import { MOOD_LIST } from "../mood_sync.js";
import { userScopedKey } from "../currentUser.js";

// "Emotion Summary" 组件：把用户记录下来的心情数据（来自 Today
// Emotion 组件的历史记录 + 日记页面锁定的每日心情）汇总成图表，
// 支持三种显示方式——饼图（doughnut chart，某段时间内各种心情各占
// 多少比例）、折线图（心情分数随时间的变化趋势）、热力图日历
// （像 GitHub 贡献图一样，每天用颜色代表当天的主要心情）。
// 这是整个 DiaryHomepage 里逻辑最复杂的组件之一，因为要同时兼容
// 两套不同的数据来源（Today Emotion 的滑块/选择数据，以及日记页面
// 的单一心情标签），还要手动处理好几个 Chart.js 自定义插件。
// The "Emotion Summary" widget: aggregates the mood data the user has
// recorded (from the Today Emotion widget's history + the single daily
// mood locked in on the diary page) into charts, supporting three
// display modes — a doughnut (pie) chart showing what percentage each
// mood took up over a period, a line chart showing the mood score trend
// over time, and a heatmap calendar (like a GitHub contributions graph,
// coloring each day by its dominant mood). This is one of the most
// logically complex widgets in the whole DiaryHomepage, since it has to
// reconcile two different data sources at once (Today Emotion's
// slider/selection data, and the diary page's single mood tag), plus
// hand-roll several custom Chart.js plugins.

const STORAGE_KEY = "emotion-summary-state";

function _moodImg(value) {
    return `<img src="/diary_home_static/assets/emotions/${value}.png" alt="${value}" class="es-mood-icon-img">`;
}

const MOOD_ICON = {
    // Current 5-mood system
    happy:   _moodImg("happy"),
    sad:     _moodImg("sad"),
    angry:   _moodImg("angry"),
    anxious: _moodImg("anxious"),
    unwell:  _moodImg("unwell"),
    // Legacy moods (backwards compatibility with old diary entries)
    smile:   "😊",
    neutral: "🙂",
    meh:     "😐",
    Happy:   _moodImg("happy"),
    Sad:     _moodImg("sad"),
    Angry:   _moodImg("angry"),
};

// Emoji index → mood score (1-5 scale), index 0 = most positive emoji
// 表情下标 → 心情分数（1-5 分），下标 0 对应最正面的表情
const EMOJI_WEIGHTS = [5, 4, 3, 2, 1];
// Diary mood → fixed score (1-5 scale): happy=5, anxious=4, sad=2, angry=1, unwell=1
// 日记心情标签 → 固定的分数（1-5 分）
const DIARY_SCORES = {
    // Current moods — each gets its own Y level
    happy:   5,
    anxious: 4,
    sad:     3,
    angry:   2,
    unwell:  1,
    // Legacy moods mapped to nearest equivalent
    smile:   5,
    neutral: 3,
    meh:     2,
    Happy:   5,
    Sad:     3,
    Angry:   2,
};

let diaryMoods = {};  // { date: mood }
let diaryData  = {};  // { date: { mood, topic } }

const DEFAULT_STATE = {
    displayMode:    "pie",
    timeRange:      "month",
    customStart:    "",
    customEnd:      "",
    calendarYear:   null,
    calendarMonth:  null,
    graphColor:     "",
    graphLineWidth: 2.5,
};

function getState() {
    const raw = localStorage.getItem(userScopedKey(STORAGE_KEY));
    if (!raw) return { ...DEFAULT_STATE };
    try {
        const saved = JSON.parse(raw);
        // Migrate old default "week" → "month" so charts show real diary data
        // 迁移旧版本默认值："week"（周）改成 "month"（月），让图表能
        // 显示出实际有意义的日记数据（新账号刚开始几天数据太少，
        // 按周看容易一片空白）。
        if (saved.timeRange === "week") saved.timeRange = "month";
        return { ...DEFAULT_STATE, ...saved };
    }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(userScopedKey(STORAGE_KEY), JSON.stringify(next));
    return next;
}

/* ── Fetch diary data ────────────────────────────────────── */
/* ── 获取日记数据 ────────────────────────────────────── */

// 向服务器请求所有日记条目的数据（每篇日记的日期、心情、主题等），
// 再从里面单独抽出"日期 → 心情"这一份精简版映射（diaryMoods），
// 后面大部分统计函数只需要用到这份精简版。
// Requests all diary entry data from the server (each entry's date,
// mood, topic, etc), then separately extracts a simplified "date →
// mood" mapping (diaryMoods) from it — most of the statistics functions
// below only need this simplified version.
async function fetchDiaryData() {
    try {
        const resp = await fetch("/diary_data");
        diaryData  = await resp.json();
        diaryMoods = {};
        for (const [d, info] of Object.entries(diaryData)) {
            if (info.mood) diaryMoods[d] = info.mood;
        }
        console.log("[EmotionSummary] diary entries loaded:", Object.keys(diaryData).length, "| with mood:", Object.keys(diaryMoods).length);
        console.log("[EmotionSummary] diaryMoods:", diaryMoods);
    } catch (e) {
        console.error("[EmotionSummary] failed to fetch diary data:", e);
        diaryData  = {};
        diaryMoods = {};
    }
}

/* ── Emotion history ─────────────────────────────────────── */
/* ── 心情历史记录 ─────────────────────────────────────── */

// 读取 Today Emotion 组件自己存的"历史记录"（每天选中的心情/滑块
// 数值），这是跟日记页面完全独立的另一套数据来源。
// Reads the Today Emotion widget's own saved "history" (each day's
// selected moods/slider values) — this is a completely separate data
// source from the diary page.
function getEmotionHistory() {
    const raw = localStorage.getItem(userScopedKey("today-emotion-state"));
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed.history || {};
    } catch { return {}; }
}

function getEmojis() {
    return MOOD_LIST.map(m => m.emoji);
}

/* ── Date helpers ────────────────────────────────────────── */
/* ── 日期辅助函数 ────────────────────────────────────────── */

function isoToday() {
    return new Date().toISOString().slice(0, 10);
}

function isoWeekStart() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
}

function isoMonthStart() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function isoYearStart() {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
}

// 根据用户选的时间范围（今天/本周/本月/本年/自定义区间），算出
// 一个起止日期区间，再把 Today Emotion 的历史记录（history）里
// 落在这个区间内的日期筛选出来。
// Based on the user's selected time range (today/week/month/year/custom
// range), computes a start/end date range, then filters the Today
// Emotion widget's history down to only the dates falling within it.
function filterByRange(history, state) {
    let start, end;
    const today = isoToday();
    if (state.timeRange === "week") { start = isoWeekStart(); end = today; }
    else if (state.timeRange === "month") {
        const now = new Date();
        const y  = state.calendarYear  ?? now.getFullYear();
        const m  = state.calendarMonth ?? now.getMonth();
        const mm = String(m + 1).padStart(2, "0");
        const lastDay = new Date(y, m + 1, 0).getDate();
        start = `${y}-${mm}-01`;
        end   = `${y}-${mm}-${String(lastDay).padStart(2, "0")}`;
        if (end > today) end = today;
    }
    else if (state.timeRange === "year")  { start = isoYearStart();  end = today; }
    else { start = state.customStart || isoMonthStart(); end = state.customEnd || today; }

    const filtered = {};
    for (const [date, data] of Object.entries(history)) {
        if (date >= start && date <= end) filtered[date] = data;
    }
    return filtered;
}

/* ── Per-day values: handles both select and slider modes ── */
/* ── 单日数值：同时兼容"点选"和"滑块"两种模式 ── */

// Today Emotion 组件有两种记录心情的方式：滑块模式（每种心情给一个
// 百分比数值）或点选模式（选中一个或多个心情，选中的会平分 100%）。
// 这个函数统一把两种模式的数据都转换成"每种心情对应一个数值"的
// 数组格式，方便后面的统计函数不用关心到底是哪种模式记录的。
// The Today Emotion widget has two ways of recording mood: slider mode
// (each mood gets a percentage value) or select mode (one or more moods
// are selected, and the selected ones evenly split 100%). This function
// normalizes both modes' data into the same "one number per mood" array
// format, so the statistics functions below don't need to care which
// mode the data was originally recorded in.
function getDayValues(data, count) {
    if (!data) return new Array(count).fill(0);
    const sliders = (data.sliderValues || []).slice(0, count).map(v => Number(v) || 0);
    if (sliders.some(v => v > 0)) return [...sliders, ...new Array(Math.max(0, count - sliders.length)).fill(0)];
    const vals = new Array(count).fill(0);
    const selected = data.selectedIndexes || [];
    if (selected.length) {
        const w = Math.round(100 / selected.length);
        selected.forEach(i => { if (i < count) vals[i] = w; });
    }
    return vals;
}

/* ── Build summary data ──────────────────────────────────── */
/* ── 构建统计数据 ──────────────────────────────────── */

function buildEmojiTotals(history, emojis) {
    const totals = new Array(emojis.length).fill(0);
    let days = 0;
    for (const data of Object.values(history)) {
        const vals = getDayValues(data, emojis.length);
        if (vals.some(v => v > 0)) {
            days++;
            vals.forEach((v, i) => { totals[i] += v; });
        }
    }
    return { totals, days };
}

function buildLineData(history, emojis) {
    const dates = Object.keys(history).sort();
    const datasets = emojis.map((emoji, i) => ({
        label: emoji,
        data: dates.map(d => getDayValues(history[d], emojis.length)[i] || 0)
    }));
    return { dates, datasets };
}

function buildDiaryMoodSummary(state) {
    let start, end;
    const today = isoToday();
    if (state.timeRange === "today")      { start = end = today; }
    else if (state.timeRange === "week")  { start = isoWeekStart(); end = today; }
    else if (state.timeRange === "month") { start = isoMonthStart(); end = today; }
    else { start = state.customStart || isoMonthStart(); end = state.customEnd || today; }

    const counts = {};
    for (const [date, mood] of Object.entries(diaryMoods)) {
        if (date >= start && date <= end && mood) {
            counts[mood] = (counts[mood] || 0) + 1;
        }
    }
    return counts;
}

// 把旧版本用过的心情名字（meh/smile/neutral/Happy 等）统一映射成
// 现在这套 5 种心情系统里对应的名字，这样老日记条目也能正确统计。
// Maps mood names used in older versions (meh/smile/neutral/Happy, etc)
// onto their matching name in the current 5-mood system, so older diary
// entries still get counted correctly.
const LEGACY_NORM = { meh: "unwell", smile: "happy", neutral: "unwell", Happy: "happy", Sad: "sad", Angry: "angry" };
function normalizeMood(mood) { return LEGACY_NORM[mood] || mood; }

// Counts moods for the calendar's current month — same iteration as renderCalendar,
// so Pie always matches what Calendar shows regardless of state.timeRange.
// 统计"日历当前查看的这个月"里各种心情出现的次数——用的遍历方式
// 跟 renderCalendar() 完全一样，这样不管 state.timeRange 设成什么，
// 饼图统计出来的数据都会跟日历视图显示的完全对得上。
function buildCurrentMonthMoodSummary(state) {
    const now = new Date();
    const viewYear  = state.calendarYear  ?? now.getFullYear();
    const viewMonth = state.calendarMonth ?? now.getMonth();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = isoToday();

    const counts = {};
    for (let d = 1; d <= daysInMonth; d++) {
        const mm   = String(viewMonth + 1).padStart(2, "0");
        const dd   = String(d).padStart(2, "0");
        const date = `${viewYear}-${mm}-${dd}`;
        if (date > today) break;
        const mood = diaryMoods[date];
        if (mood) {
            const key = normalizeMood(mood);
            counts[key] = (counts[key] || 0) + 1;
        }
    }
    return counts;
}

// Counts moods for any time range (week / year / custom).
// 统计任意时间范围（周/年/自定义区间）内各种心情出现的次数。
function buildRangedMoodSummary(state) {
    let start, end;
    const today = isoToday();
    if (state.timeRange === "week")        { start = isoWeekStart();  end = today; }
    else if (state.timeRange === "year")   { start = isoYearStart();  end = today; }
    else { start = state.customStart || isoMonthStart(); end = state.customEnd || today; }

    const counts = {};
    for (const [date, mood] of Object.entries(diaryMoods)) {
        if (date < start || date > end || !mood) continue;
        const key = normalizeMood(mood);
        counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
}

// Line data for any time range: diary-mood entries sorted by date.
// 折线图数据（任意时间范围）：按日期从早到晚排序的日记心情条目。
function buildRangedDiaryLineData(state) {
    if (state.timeRange === "month") return buildCurrentMonthLineData(state);

    let start, end;
    const today = isoToday();
    if (state.timeRange === "week")       { start = isoWeekStart(); end = today; }
    else if (state.timeRange === "year")  { start = isoYearStart(); end = today; }
    else { start = state.customStart || isoMonthStart(); end = state.customEnd || today; }

    const entries = [];
    for (const [date, mood] of Object.entries(diaryMoods)) {
        if (date < start || date > end) continue;
        const score = DIARY_SCORES[mood] ?? null;
        if (score === null) continue;
        entries.push({ date, score });
    }
    entries.sort((a, b) => (a.date < b.date ? -1 : 1));

    const labels = entries.map(({ date }) => {
        const dt = new Date(date + "T00:00:00");
        return `${dt.getMonth() + 1}/${dt.getDate()}`;
    });
    const scores = entries.map(e => e.score);
    return { labels, scores };
}

// Returns only dates in the calendar's current month that have diary mood entries,
// so Line chart X-axis matches what Calendar shows.
// 只返回"日历当前查看的这个月"里、确实有日记心情记录的那些日期，
// 让折线图的横轴跟日历视图显示的月份保持一致。
function buildCurrentMonthLineData(state) {
    const now = new Date();
    const viewYear  = state.calendarYear  ?? now.getFullYear();
    const viewMonth = state.calendarMonth ?? now.getMonth();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = isoToday();

    const labels = [];
    const scores = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const mm   = String(viewMonth + 1).padStart(2, "0");
        const dd   = String(d).padStart(2, "0");
        const date = `${viewYear}-${mm}-${dd}`;
        if (date > today) break;
        const mood  = diaryMoods[date];
        const score = mood != null ? (DIARY_SCORES[mood] ?? null) : null;
        if (score === null) continue;
        const dt = new Date(date + "T00:00:00");
        labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
        scores.push(score);
    }
    return { labels, scores };
}

/* ── Palette colour helpers ──────────────────────────────── */
/* ── 调色板颜色辅助函数 ──────────────────────────────── */

function getESPaletteColors() {
    try {
        const app = JSON.parse(localStorage.getItem("emotion-summary-widget-appearance") || "{}");
        return {
            bg:      app.backgroundColor || "#faf8f5",
            title:   app.titleColor      || "#1a1a1a",
            content: app.contentColor    || "#555555",
        };
    } catch {
        return { bg: "#faf8f5", title: "#1a1a1a", content: "#555555" };
    }
}

// 用标准的亮度公式（人眼对绿色最敏感、蓝色最不敏感，所以权重不同）
// 算出一个十六进制颜色到底"看起来偏亮还是偏暗"，返回 0~1 之间的值，
// 用来决定图表提示框该用深色文字还是浅色文字才看得清楚。
// Uses the standard luminance formula (the human eye is most sensitive
// to green and least sensitive to blue, hence the different weights) to
// compute whether a hex color looks bright or dark, returning a value
// between 0 and 1 — used to decide whether chart tooltips should use
// dark or light text to stay readable.
function hexLuminance(hex) {
    if (!hex || hex[0] !== "#") return 1;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function hexAlpha(hex, a) {
    if (!hex || hex[0] !== "#") return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function blendHex(c1, c2, t) {
    const r = v => parseInt(v.slice(1, 3), 16);
    const g = v => parseInt(v.slice(3, 5), 16);
    const b = v => parseInt(v.slice(5, 7), 16);
    const mix = (a, b) => Math.round(a + (b - a) * t).toString(16).padStart(2, "0");
    return `#${mix(r(c1), r(c2))}${mix(g(c1), g(c2))}${mix(b(c1), b(c2))}`;
}

// 5 emoji-pie colors graduated from title → content
// Fixed colors sampled from each emoji face image
// 5 种心情各自固定的代表色（从对应的表情图片里取样出来的颜色）
const MOOD_COLORS = {
    happy:   "#E4CC6D",   // warm yellow
    sad:     "#8AABD4",   // soft blue
    angry:   "#C96B58",   // terracotta red
    anxious: "#F5A455",   // warm orange
    unwell:  "#8FAD83",   // sage green
};

// Pre-load PNG assets for the line chart Y-axis plugin
// 提前把心情图片加载好，给折线图的 Y 轴插件用（避免绘制的时候
// 图片还没加载完成而显示不出来）
const MOOD_IMAGES = Object.fromEntries(
    ["happy", "anxious", "sad", "angry", "unwell"].map(m => {
        const img = new Image();
        img.src = `/diary_home_static/assets/emotions/${m}.png`;
        return [m, img];
    })
);

// Map Y-axis score values to the mood PNG(s) that should appear there
// 把 Y 轴上的分数刻度（1~5）映射到对应应该显示的心情图片
const SCORE_MOODS = {
    5: ["happy"],
    4: ["anxious"],
    3: ["sad"],
    2: ["angry"],
    1: ["unwell"],
};

function getEmojiPalette() {
    // Order matches MOOD_LIST: [happy, sad, angry, anxious, unwell]
    return [
        MOOD_COLORS.happy,
        MOOD_COLORS.sad,
        MOOD_COLORS.angry,
        MOOD_COLORS.anxious,
        MOOD_COLORS.unwell,
    ];
}

// Mood → emoji face color
function getMoodPaletteColors() {
    return {
        // Current 5-mood system
        happy:   MOOD_COLORS.happy,
        sad:     MOOD_COLORS.sad,
        angry:   MOOD_COLORS.angry,
        anxious: MOOD_COLORS.anxious,
        unwell:  MOOD_COLORS.unwell,
        // Legacy moods
        smile:   MOOD_COLORS.happy,
        neutral: MOOD_COLORS.unwell,
        meh:     MOOD_COLORS.unwell,
        Happy:   MOOD_COLORS.happy,
        Sad:     MOOD_COLORS.sad,
        Angry:   MOOD_COLORS.angry,
    };
}

/* ── Render ──────────────────────────────────────────────── */
/* ── 渲染 ──────────────────────────────────────────────── */

let chartInstance = null;

function destroyChart() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

// Plugin that draws center label inside the doughnut hole
// 自定义 Chart.js 插件：在环形图（doughnut）中间的空心圆圈里，
// 画出"占比最高的心情表情 + 百分比"这两行文字。
const doughnutCenterPlugin = {
    id: "doughnutCenter",
    afterDraw(chart) {
        const label = chart.config._centerLabel;
        if (!label) return;
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top  + chartArea.bottom) / 2;
        const pal = getESPaletteColors();
        ctx.save();
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 18px Inter, sans-serif";
        ctx.fillStyle = pal.title;
        ctx.fillText(label.emoji, cx, cy - 9);
        ctx.font = "600 11px Inter, sans-serif";
        ctx.fillStyle = hexAlpha(pal.content, 0.7);
        ctx.fillText(label.pct, cx, cy + 10);
        ctx.restore();
    }
};

// Draws a vertical crosshair line at the hovered point
// 鼠标悬停在折线图上时，画一条垂直的十字准线，标出当前悬停的位置
const crosshairPlugin = {
    id: "crosshair",
    afterDraw(chart) {
        const active = chart.tooltip?._active;
        if (!active?.length) return;
        const { ctx, chartArea } = chart;
        const x = active[0].element.x;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.strokeStyle = hexAlpha(getESPaletteColors().content, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
};

// Draws mood PNG images on the Y-axis in place of text tick labels
// 在折线图的 Y 轴上，用心情图片代替普通的文字刻度标签（比如分数=5
// 的位置画一个开心表情，而不是显示数字"5"）
const moodAxisPlugin = {
    id: "moodAxis",
    afterDraw(chart) {
        const yScale = chart.scales.y;
        if (!yScale) return;
        const { ctx, chartArea } = chart;
        const SZ_DEFAULT = 36;
        const SZ_ANXIOUS = Math.round(SZ_DEFAULT * 1.2);
        const RIGHT_PAD = 4;
        ctx.save();
        Object.entries(SCORE_MOODS).forEach(([score, moods]) => {
            const y = yScale.getPixelForValue(Number(score));
            const sz = Number(score) === 4 ? SZ_ANXIOUS : SZ_DEFAULT;
            const totalW = moods.length * sz + (moods.length - 1) * 3;
            let x = chartArea.left - RIGHT_PAD - totalW;
            moods.forEach(mood => {
                const img = MOOD_IMAGES[mood];
                if (!img?.complete || !img.naturalWidth) return;
                ctx.drawImage(img, x, y - sz / 2, sz, sz);
                x += sz + 3;
            });
        });
        ctx.restore();
    }
};

/* ── Mood score helpers ───────────────────────────────────── */
/* ── 心情分数计算 ───────────────────────────────────── */

// 计算某一天的"综合心情分数"：优先用 Today Emotion 组件当天的记录
// （如果有多种心情各占不同百分比，就按各自的权重算出加权平均分），
// 如果那天没有 Today Emotion 数据，就退回去用日记页面锁定的单一
// 心情对应的固定分数；两边都没有数据就返回 null（这天没有记录）。
// Computes a "combined mood score" for a given day: prefers the Today
// Emotion widget's record for that day (if multiple moods each have a
// different percentage, a weighted average score is computed using each
// mood's weight); if there's no Today Emotion data for that day, it
// falls back to the fixed score for the single mood locked in on the
// diary page; if neither has data, returns null (no record for that
// day).
function getMoodScore(emotionData, diaryMood, emojiCount) {
    if (emotionData) {
        const vals = getDayValues(emotionData, emojiCount);
        const total = vals.reduce((s, v) => s + v, 0);
        if (total > 0) {
            const weighted = vals.reduce((s, v, i) => {
                const w = EMOJI_WEIGHTS[i] ?? (9.5 - i * 1.6);
                return s + v * w;
            }, 0);
            return Math.round(weighted / total * 10) / 10;
        }
    }
    if (diaryMood && DIARY_SCORES[diaryMood] != null) {
        return DIARY_SCORES[diaryMood];
    }
    return null;
}

function buildMoodScoreTimeline(allHistory, emojis, state) {
    let start, end;
    const today = isoToday();
    if (state.timeRange === "today")      { start = end = today; }
    else if (state.timeRange === "week")  { start = isoWeekStart(); end = today; }
    else if (state.timeRange === "month") {
        const now = new Date();
        const y  = state.calendarYear  ?? now.getFullYear();
        const m  = state.calendarMonth ?? now.getMonth();
        const mm = String(m + 1).padStart(2, "0");
        const lastDay = new Date(y, m + 1, 0).getDate();
        start = `${y}-${mm}-01`;
        end   = `${y}-${mm}-${String(lastDay).padStart(2, "0")}`;
        if (end > today) end = today;
    }
    else { start = state.customStart || isoMonthStart(); end = state.customEnd || today; }

    const dates = [];
    const cur = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    while (cur <= endDate) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }

    const scores = dates.map(d => getMoodScore(allHistory[d], diaryMoods[d], emojis.length));
    const isShort = dates.length <= 7;
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = dates.map(d => {
        const dt = new Date(d + "T00:00:00");
        return isShort ? DOW[dt.getDay()] : `${dt.getMonth() + 1}/${dt.getDate()}`;
    });

    return { dates, scores, labels };
}

function moodChipsHtml(moodCounts) {
    if (!Object.keys(moodCounts).length) return "";
    return `<div class="es-diary-moods">${
        Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([mood, n]) =>
                `<span class="es-mood-chip mood-${mood.toLowerCase()}">${MOOD_ICON[mood]} ${mood} ×${n}</span>`
            ).join("")
    }</div>`;
}

/* ── Shared pie data builder ─────────────────────────────── */
/* ── 饼图数据的通用构建函数 ─────────────────────────────── */

// 饼图既可能显示"日记心情"的统计，也可能显示"Today Emotion 组件"
// 的统计——优先用日记数据（如果这段时间内有日记记录的话），
// 因为日记心情是用户明确锁定过的，比 Today Emotion 组件里随手点选
// 的数据更可靠；只有完全没有日记数据时，才退回去用 Today Emotion
// 组件自己的历史记录。
// The pie chart might show either "diary mood" statistics or "Today
// Emotion widget" statistics — diary data is preferred (if there's any
// diary record for this period), since a diary mood was deliberately
// locked in by the user, more reliable than data casually clicked in the
// Today Emotion widget; only when there's no diary data at all does it
// fall back to the Today Emotion widget's own history.
function buildPieData(history, emojis, state) {
    const { totals, days } = buildEmojiTotals(history, emojis);
    const total = totals.reduce((s, v) => s + v, 0);
    const moodCounts = state.timeRange === "month"
        ? buildCurrentMonthMoodSummary(state)
        : buildRangedMoodSummary(state);
    const moodEntries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const diaryTotal  = moodEntries.reduce((s, [, n]) => s + n, 0);

    if (!total && !diaryTotal) return null;

    // Prefer diary mood data when it exists; fall back to emotion widget emojis
    const useDiary = diaryTotal > 0;
    let labels, moodKeys, data, colors, grandTotal;

    if (useDiary) {
        const moodPal = getMoodPaletteColors();
        moodKeys   = moodEntries.map(([mood]) => mood);   // already normalized by buildCurrentMonthMoodSummary
        labels     = moodKeys.map(key => {
            const m = MOOD_LIST.find(x => x.value === key);
            return m ? m.value : key;
        });
        data       = moodEntries.map(([, n]) => n);
        colors     = moodEntries.map(([mood]) => moodPal[mood] || "#999");
        grandTotal = diaryTotal;
    } else {
        const pal = getEmojiPalette();
        const activeIdxs = totals.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);
        moodKeys   = activeIdxs.map(i => MOOD_LIST[i]?.value || "");
        labels     = activeIdxs.map(i => MOOD_LIST[i]?.value || emojis[i]);
        data       = activeIdxs.map(i => totals[i]);
        colors     = activeIdxs.map(i => pal[i] || "#999");
        grandTotal = total;
    }

    const topIdx = data.indexOf(Math.max(...data));
    return { labels, moodKeys, data, colors, grandTotal, topIdx, useDiary, days, diaryTotal, moodCounts };
}

function renderPieLegend(pd, isWide) {
    const items = pd.labels.map((label, i) => {
        const key = pd.moodKeys?.[i];
        const icon = key
            ? `<img src="/diary_home_static/assets/emotions/${key}.png" alt="${label}" class="es-leg-emoji-img">`
            : `<span class="es-leg-dot" style="background:${pd.colors[i]}"></span>`;
        return `
            <div class="es-leg-row">
                ${icon}
                <span class="es-leg-label">${label}</span>
            </div>
        `;
    }).join("");
    return `<div class="es-pie-legend${isWide ? " es-pie-legend--side" : " es-pie-legend--bottom"}">${items}</div>`;
}

function renderPie(history, emojis, state) {
    const pd = buildPieData(history, emojis, state);

    if (!pd) {
        return `
            <div class="es-pie-outer">
                <div class="es-pie-wrap">
                    <canvas id="es-pie-chart"></canvas>
                </div>
            </div>
        `;
    }

    const widget    = document.getElementById("emotion-summary-widget");
    const isWide    = widget && widget.offsetWidth > widget.offsetHeight * 1.1;

    return `
        <div class="es-pie-outer${isWide ? " es-pie-outer--row" : ""}">
            <div class="es-pie-wrap">
                <canvas id="es-pie-chart"></canvas>
            </div>
            ${renderPieLegend(pd, isWide)}
        </div>
    `;
}

function renderLine(history, emojis, state) {
    return `
        <div class="es-line-wrap">
            <canvas id="es-line-chart"></canvas>
        </div>
    `;
}

/* ── Heatmap color helper ────────────────────────────────── */
/* ── 热力图颜色辅助函数 ────────────────────────────────── */

function getDominantMood(emotionData, emojiCount) {
    if (!emotionData) return null;
    const vals = getDayValues(emotionData, emojiCount);
    if (!vals.some(v => v > 0)) return null;
    const domIdx = vals.indexOf(Math.max(...vals));
    return MOOD_LIST[domIdx]?.value || null;
}

// 决定日历某一天格子应该显示的颜色：优先用日记锁定的心情，
// 没有的话就用 Today Emotion 组件那天记录里"占比最高的心情"。
// Decides the color a given calendar day's cell should show: prefers the
// diary-locked mood, falling back to the "most dominant mood" in that
// day's Today Emotion widget record if there's no diary mood.
function getDayHeatColor(date, emotionData, emojiCount) {
    const moodPal = getMoodPaletteColors();
    const mood = diaryMoods[date];
    if (mood) return moodPal[mood] || null;
    const dominant = getDominantMood(emotionData, emojiCount);
    if (!dominant) return null;
    return moodPal[dominant] || null;
}

/* ── Heatmap calendar ────────────────────────────────────── */
/* ── 热力图日历 ────────────────────────────────────── */

// 画出"月历"样式的热力图：每个格子代表一天，颜色代表当天的主要
// 心情。这个函数里有不少手动计算的布局数值（cellW/cellH/gridW/gridH
// 等），是因为格子大小要跟着组件实际的宽高自动缩放，同时还要区分
// "宽扁形组件"（图例显示在旁边）和"瘦高形组件"（图例显示在下面）
// 两种布局。
// Draws a "month calendar"-style heatmap: each cell represents one day,
// colored by that day's dominant mood. This function has a fair amount
// of hand-computed layout math (cellW/cellH/gridW/gridH, etc), because
// the cell size needs to auto-scale with the widget's actual width/
// height, while also distinguishing between a "wide" widget (legend
// shown to the side) and a "tall/narrow" widget (legend shown below).
function renderCalendar(allHistory, emojis, state) {
    const today = isoToday();
    const now = new Date();
    const viewYear  = state.calendarYear  ?? now.getFullYear();
    const viewMonth = state.calendarMonth ?? now.getMonth();

    const firstDay    = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDow    = firstDay.getDay();   // 0 = Sunday
    const numWeeks    = Math.ceil((startDow + daysInMonth) / 7);

    // Adaptive layout: wide card → legend on side; tall/narrow → legend below
    const widget  = document.getElementById("emotion-summary-widget");
    const widgetW = widget?.offsetWidth  || 300;
    const widgetH = widget?.offsetHeight || 260;
    const isWide  = widgetW > widgetH * 1.1;

    // Overhead (px) outside the cell grid:
    //   widget-header ≈ 40 (+ 26 extra if month wraps below title on tall card)
    //   body-pad ≈ 17, dow-header ≈ 14, body-gap ≈ 6
    const isTall  = widgetH > widgetW;
    const BASE_OH = (isTall ? 66 : 40) + 17 + 14 + 6;

    const gridW = Math.max(60, widgetW - 20 - 6 * 3);

    const gridH = Math.max(30,
        widgetH - BASE_OH - (numWeeks - 1) * 3
    );

    // Wide: cells can be wider than tall (rectangular); narrow: keep square
    const cellW = Math.max(8, Math.floor(gridW / 7));
    const cellH = isWide
        ? Math.max(8, Math.floor(gridH / numWeeks))
        : Math.max(8, Math.min(Math.floor(gridW / 7), Math.floor(gridH / numWeeks)));

    const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const headerHtml = DOW_LABELS.map(d => `<span>${d}</span>`).join("");

    const cells = [];
    // Leading empty cells so first day lands in the correct column
    // 先补上几个空白格子，让这个月第一天能落在正确的星期几那一列
    for (let i = 0; i < startDow; i++) {
        cells.push(`<div class="es-hm-cell es-hm-empty"></div>`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const mm    = String(viewMonth + 1).padStart(2, "0");
        const dd    = String(d).padStart(2, "0");
        const date  = `${viewYear}-${mm}-${dd}`;
        const color = getDayHeatColor(date, allHistory[date], emojis.length);
        const mood  = diaryMoods[date] || "";
        const topic = diaryData[date]?.topic || "";
        const style = color ? `background:${color}` : "";
        const moodAttr  = mood  ? ` data-mood="${mood}"`                            : "";
        const topicAttr = topic ? ` data-topic="${topic.replace(/"/g, "&quot;")}"` : "";
        const todayCls  = date === today ? " es-hm-today" : "";
        const moodForIcon = mood || getDominantMood(allHistory[date], emojis.length) || "";
        const moodEmoji = moodForIcon ? (MOOD_ICON[moodForIcon] || "") : "";

        cells.push(`<div class="es-hm-cell${todayCls}" style="${style}" data-date="${date}"${moodAttr}${topicAttr}>${moodEmoji ? `<span class="es-hm-emoji">${moodEmoji}</span>` : ""}</div>`);
    }

    const pal    = getESPaletteColors();
    const emptyC = hexAlpha(pal.content, 0.12);  // subtle tint of content colour for empty cells
    const todayC = pal.title;                     // today outline = title (accent) colour

    return `
        <div class="es-hm-outer">
            <div class="es-heatmap" style="--cw:${cellW}px; --ch:${cellH}px; --hm-empty:${emptyC}; --hm-today:${todayC}">
                <div class="es-hm-header">${headerHtml}</div>
                <div class="es-hm-cells">${cells.join("")}</div>
            </div>
        </div>
    `;
}

function renderWidget(state) {
    const emojis = getEmojis();
    const allHistory = getEmotionHistory();
    const history = filterByRange(allHistory, state);

    let content;
    if (state.displayMode === "line") {
        content = renderLine(history, emojis, state);
    } else if (state.displayMode === "calendar") {
        content = renderCalendar(allHistory, emojis, state);
    } else {
        content = renderPie(history, emojis, state);
    }
    return `<div class="es-body">${content}</div>`;
}

/* ── Chart.js initialization ─────────────────────────────── */
/* ── Chart.js 图表初始化 ─────────────────────────────── */

// 用 Chart.js 库真正把图表画出来（饼图/环形图 或 折线图，日历热力图
// 不用 Chart.js，是纯手写 HTML/CSS 画的）。这里会先把组件的外观
// 配色（背景/标题/内容颜色）转换成图表用得上的颜色（提示框背景、
// 提示框文字颜色等），保证图表颜色跟组件本身的主题保持协调。
// Actually draws the chart using the Chart.js library (doughnut/pie or
// line chart — the calendar heatmap doesn't use Chart.js, it's hand-
// drawn HTML/CSS instead). This first converts the widget's appearance
// colors (background/title/content color) into colors the chart can use
// (tooltip background, tooltip text color, etc), keeping the chart's
// colors consistent with the widget's own theme.
function initCharts(state) {
    destroyChart();

    const emojis = getEmojis();
    const allHistory = getEmotionHistory();
    const history = filterByRange(allHistory, state);

    const pal = getESPaletteColors();
    const bgDark    = hexLuminance(pal.bg) < 0.5;
    const tickColor = hexAlpha(pal.content, 0.55);
    const gridColor = hexAlpha(pal.content, 0.1);
    // Tooltip colours: contrast against widget bg
    const ttBg      = bgDark ? hexAlpha(pal.content, 0.95) : hexAlpha(pal.bg, 0.95);
    const ttText    = bgDark ? pal.bg : pal.content;
    const ttBorder  = hexAlpha(pal.content, 0.15);

    if (state.displayMode === "pie") {
        const canvas = document.getElementById("es-pie-chart");
        if (!canvas) return;

        const pd = buildPieData(history, emojis, state);

        if (!pd) {
            chartInstance = new Chart(canvas, {
                type: "doughnut",
                data: {
                    labels: [],
                    datasets: [{
                        data: [1],
                        backgroundColor: [hexAlpha(pal.content, 0.1)],
                        borderWidth: 4,
                        borderColor: pal.bg,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "62%",
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
            return;
        }

        const { labels, data, colors, grandTotal, topIdx } = pd;
        const centerLabel = {
            emoji: labels[topIdx] ?? "",
            pct:   `${Math.round(data[topIdx] / grandTotal * 100)}%`
        };

        chartInstance = new Chart(canvas, {
            type: "doughnut",
            _centerLabel: centerLabel,
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 4,
                    borderColor: pal.bg,
                    hoverOffset: 10,
                    hoverBorderColor: pal.bg
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: ttBg,
                        borderColor: ttBorder,
                        borderWidth: 1,
                        titleColor: ttText,
                        bodyColor: ttText,
                        padding: 8,
                        cornerRadius: 8,
                        callbacks: {
                            title: () => "",
                            label: ctx => {
                                const pct = grandTotal ? Math.round(ctx.parsed / grandTotal * 100) : 0;
                                return `  ${ctx.label}  ${pct}%`;
                            }
                        }
                    }
                }
            },
            plugins: [doughnutCenterPlugin]
        });

    } else if (state.displayMode === "line") {
        const canvas = document.getElementById("es-line-chart");
        if (!canvas) return;

        const { scores, labels } = buildRangedDiaryLineData(state);

        const lineColor = state.graphColor || pal.title;
        const lineWidth = Number(state.graphLineWidth) || 2.5;

        const MOOD_LABELS = { 5: "happy", 4: "anxious", 3: "sad", 2: "angry", 1: "unwell" };

        chartInstance = new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Mood",
                    data: scores,
                    borderColor: lineColor,
                    backgroundColor: hexAlpha(lineColor, 0.08),
                    borderWidth: lineWidth,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: lineColor,
                    pointHoverBorderColor: pal.bg,
                    pointHoverBorderWidth: 2.5,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 20, bottom: 20, left: 58, right: 58 } },
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: ttBg,
                        borderColor: ttBorder,
                        borderWidth: 1,
                        padding: { x: 12, y: 10 },
                        titleColor: ttText,
                        titleFont: { size: 12, weight: "700", family: "Inter, sans-serif" },
                        bodyColor: ttText,
                        bodyFont: { size: 11, family: "Inter, sans-serif" },
                        displayColors: false,
                        cornerRadius: 8,
                        callbacks: {
                            title: items => items[0].label,
                            label: ctx => {
                                if (ctx.parsed.y == null) return null;
                                const rounded = Math.round(ctx.parsed.y);
                                return `  ${MOOD_LABELS[rounded] || ctx.parsed.y.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        grid:   { color: gridColor, lineWidth: 1, borderDash: [4, 4] },
                        border: { display: false, dash: [4, 4] },
                        afterFit: scale => { scale.width = 0; },
                        ticks:  {
                            display: false,
                            stepSize: 1,
                        }
                    },
                    x: {
                        grid:   { display: false },
                        border: { display: false },
                        ticks:  {
                            font: { size: 10, family: "Inter, sans-serif" },
                            color: tickColor,
                            maxRotation: 0
                        }
                    }
                }
            },
            plugins: [crosshairPlugin, moodAxisPlugin]
        });
    }
}

/* ── Rerender + update ───────────────────────────────────── */
/* ── 重新渲染 + 更新 ───────────────────────────────────── */

async function rerender(state) {
    const content = document.querySelector("#emotion-summary-widget .widget-content");
    if (!content) return;
    await fetchDiaryData();

    // Sync calendar nav in widget header
    // 同步组件标题栏里的"上个月/下个月"翻页按钮显示状态
    const widget   = document.getElementById("emotion-summary-widget");
    const hdrCal   = widget?.querySelector(".es-hdr-cal");
    const hdrMonth = widget?.querySelector(".es-hdr-cal-month");
    if (hdrCal) {
        const showMonthNav = state.displayMode === "calendar"
            || (state.displayMode === "pie" && state.timeRange === "month");
        if (showMonthNav) {
            const now = new Date();
            const y   = state.calendarYear  ?? now.getFullYear();
            const m   = state.calendarMonth ?? now.getMonth();
            if (hdrMonth) {
                hdrMonth.textContent = new Date(y, m, 1).toLocaleDateString("en-US", {
                    month: "long", year: "numeric"
                });
            }
            hdrCal.style.display = "";
            // Tall card: month wraps below title; wide card: stays on same row
            // 瘦高形卡片：月份换行显示在标题下方；宽扁形卡片：跟标题同一行显示
            const wW = widget.offsetWidth  || 300;
            const wH = widget.offsetHeight || 260;
            widget.classList.toggle("es-cal-hdr-col", wH > wW && state.displayMode === "calendar");
        } else {
            hdrCal.style.display = "none";
            widget.classList.remove("es-cal-hdr-col");
        }
    }

    content.innerHTML = renderWidget(state);
    requestAnimationFrame(() => initCharts(state));
}

function updateState(partial) {
    const next = saveState(partial);
    rerender(next);
    return next;
}

/* ── Public API ──────────────────────────────────────────── */
/* ── 对外接口 ──────────────────────────────────────────── */

export function createEmotionSummaryWidget() {
    return `
        <div class="widget" id="emotion-summary-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Emotion Summary</span>
                <span class="es-hdr-cal" style="display:none">
                    <button class="es-cal-prev">‹</button>
                    <span class="es-hdr-cal-month"></span>
                    <button class="es-cal-next">›</button>
                </span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="es-hm-tooltip" id="es-hm-tooltip"></div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeEmotionSummary() {
    const widget = document.getElementById("emotion-summary-widget");
    if (!widget) return;

    widget.addEventListener("widgetresize", () => {
        const st = getState();
        rerender(st);
    });

    widget.addEventListener("click", e => {
        if (e.target.closest(".es-cal-prev")) {
            const st = getState();
            const now = new Date();
            let y = st.calendarYear  ?? now.getFullYear();
            let m = st.calendarMonth ?? now.getMonth();
            m--;
            if (m < 0) { m = 11; y--; }
            updateState({ calendarYear: y, calendarMonth: m });
        } else if (e.target.closest(".es-cal-next")) {
            const st = getState();
            const now = new Date();
            let y = st.calendarYear  ?? now.getFullYear();
            let m = st.calendarMonth ?? now.getMonth();
            m++;
            if (m > 11) { m = 0; y++; }
            updateState({ calendarYear: y, calendarMonth: m });
        }
    });

    // Heatmap hover tooltip
    // 热力图悬停提示框：鼠标移到某一天的格子上，显示那天的日期/心情/日记主题
    const tooltip = widget.querySelector("#es-hm-tooltip");
    if (tooltip) {
        widget.addEventListener("mouseover", e => {
            const cell = e.target.closest(".es-hm-cell[data-date]");
            if (!cell) { tooltip.style.display = "none"; return; }

            const date  = cell.dataset.date;
            const mood  = cell.dataset.mood  || "";
            const topic = cell.dataset.topic || "";
            const fmt   = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric"
            });

            // Style tooltip from palette
            // 提示框的颜色跟着组件的调色板走
            const tp = getESPaletteColors();
            const tpDark = hexLuminance(tp.bg) < 0.5;
            tooltip.style.background = tpDark ? hexAlpha(tp.content, 0.95) : "#1e1e1e";
            tooltip.style.color      = tpDark ? tp.bg : "#fff";

            tooltip.innerHTML = `
                <div class="es-hm-tt-date">${fmt}</div>
                ${mood  ? `<div class="es-hm-tt-mood">${MOOD_ICON[mood] || ""} ${mood}</div>` : ""}
                ${topic ? `<div class="es-hm-tt-topic">${topic}</div>` : ""}
                ${!mood && !topic ? `<div class="es-hm-tt-empty">No entry</div>` : ""}
            `;
            tooltip.style.display = "block";

            const cr = cell.getBoundingClientRect();
            const wr = widget.getBoundingClientRect();
            const ttW = tooltip.offsetWidth;
            const ttH = tooltip.offsetHeight;

            let left = cr.left - wr.left + cr.width / 2 - ttW / 2;
            let top  = cr.top  - wr.top  - ttH - 8;

            left = Math.max(4, Math.min(left, wr.width - ttW - 4));
            if (top < 4) top = cr.top - wr.top + cr.height + 4;

            tooltip.style.left = `${left}px`;
            tooltip.style.top  = `${top}px`;
        });

        widget.addEventListener("mouseout", e => {
            if (!e.relatedTarget?.closest?.("#emotion-summary-widget .es-hm-cell")) {
                tooltip.style.display = "none";
            }
        });
    }

    rerender(getState());
}

export function getEmotionSummaryState() {
    return getState();
}

export function updateEmotionSummaryState(partial) {
    return updateState(partial);
}
