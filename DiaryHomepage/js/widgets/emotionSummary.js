import { MOOD_LIST } from "../mood_sync.js";
import { userScopedKey } from "../currentUser.js";

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
const EMOJI_WEIGHTS = [5, 4, 3, 2, 1];
// Diary mood → fixed score (1-5 scale): happy=5, anxious=4, sad=2, angry=1, unwell=1
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

const LEGACY_NORM = { meh: "unwell", smile: "happy", neutral: "unwell", Happy: "happy", Sad: "sad", Angry: "angry" };
function normalizeMood(mood) { return LEGACY_NORM[mood] || mood; }

// Counts moods for the calendar's current month — same iteration as renderCalendar,
// so Pie always matches what Calendar shows regardless of state.timeRange.
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
const MOOD_COLORS = {
    happy:   "#E4CC6D",   // warm yellow
    sad:     "#8AABD4",   // soft blue
    angry:   "#C96B58",   // terracotta red
    anxious: "#F5A455",   // warm orange
    unwell:  "#8FAD83",   // sage green
};

// Pre-load PNG assets for the line chart Y-axis plugin
const MOOD_IMAGES = Object.fromEntries(
    ["happy", "anxious", "sad", "angry", "unwell"].map(m => {
        const img = new Image();
        img.src = `/diary_home_static/assets/emotions/${m}.png`;
        return [m, img];
    })
);

// Map Y-axis score values to the mood PNG(s) that should appear there
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

let chartInstance = null;

function destroyChart() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

// Plugin that draws center label inside the doughnut hole
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

function getDominantMood(emotionData, emojiCount) {
    if (!emotionData) return null;
    const vals = getDayValues(emotionData, emojiCount);
    if (!vals.some(v => v > 0)) return null;
    const domIdx = vals.indexOf(Math.max(...vals));
    return MOOD_LIST[domIdx]?.value || null;
}

function getDayHeatColor(date, emotionData, emojiCount) {
    const moodPal = getMoodPaletteColors();
    const mood = diaryMoods[date];
    if (mood) return moodPal[mood] || null;
    const dominant = getDominantMood(emotionData, emojiCount);
    if (!dominant) return null;
    return moodPal[dominant] || null;
}

/* ── Heatmap calendar ────────────────────────────────────── */

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

async function rerender(state) {
    const content = document.querySelector("#emotion-summary-widget .widget-content");
    if (!content) return;
    await fetchDiaryData();

    // Sync calendar nav in widget header
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
