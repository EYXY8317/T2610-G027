const STORAGE_KEY = "emotion-summary-state";

const MOOD_ICON  = { Happy: "😊", Sad: "😢", Angry: "😠" };

// Emoji index → mood score (0-10), index 0 = most positive emoji
const EMOJI_WEIGHTS = [9.5, 8.0, 6.0, 4.5, 3.0];
// Diary mood → fixed score
const DIARY_SCORES  = { Happy: 8.5, Sad: 3.5, Angry: 3.0 };

let diaryMoods = {};  // { date: mood }
let diaryData  = {};  // { date: { mood, topic } }

const DEFAULT_STATE = {
    displayMode:    "pie",
    timeRange:      "week",
    customStart:    "",
    customEnd:      "",
    showCombo:      true,
    showHighlight:  true,
    calendarYear:   null,
    calendarMonth:  null,
};

function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    try { return { ...DEFAULT_STATE, ...JSON.parse(raw) }; }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
    } catch {
        diaryData  = {};
        diaryMoods = {};
    }
}

/* ── Emotion history ─────────────────────────────────────── */

function getEmotionHistory() {
    const raw = localStorage.getItem("today-emotion-state");
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed.history || {};
    } catch { return {}; }
}

function getEmojis() {
    const raw = localStorage.getItem("today-emotion-state");
    if (!raw) return ["😀", "😊", "🙂", "😐", "😔"];
    try {
        const parsed = JSON.parse(raw);
        return parsed.displayedEmojis || ["😀", "😊", "🙂", "😐", "😔"];
    } catch { return ["😀", "😊", "🙂", "😐", "😔"]; }
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

function filterByRange(history, state) {
    let start, end;
    const today = isoToday();
    if (state.timeRange === "today")      { start = end = today; }
    else if (state.timeRange === "week")  { start = isoWeekStart(); end = today; }
    else if (state.timeRange === "month") { start = isoMonthStart(); end = today; }
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
function getEmojiPalette() {
    const { title, content } = getESPaletteColors();
    return [
        title,
        blendHex(title, content, 0.25),
        blendHex(title, content, 0.5),
        blendHex(title, content, 0.75),
        content,
    ];
}

// Mood → palette color: Happy=title, Sad=midpoint, Angry=content
function getMoodPaletteColors() {
    const pal = getEmojiPalette();
    return { Happy: pal[0], Sad: pal[2], Angry: pal[4] };
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
    else if (state.timeRange === "month") { start = isoMonthStart(); end = today; }
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
    const moodCounts = buildDiaryMoodSummary(state);
    const moodEntries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const diaryTotal  = moodEntries.reduce((s, [, n]) => s + n, 0);

    if (!total && !diaryTotal) return null;

    // Prefer diary mood data when it exists; fall back to emotion widget emojis
    const useDiary = diaryTotal > 0;
    let labels, data, colors, grandTotal;

    if (useDiary) {
        const moodPal = getMoodPaletteColors();
        labels     = moodEntries.map(([mood]) => `${MOOD_ICON[mood]} ${mood}`);
        data       = moodEntries.map(([, n]) => n);
        colors     = moodEntries.map(([mood]) => moodPal[mood] || "#999");
        grandTotal = diaryTotal;
    } else {
        const pal = getEmojiPalette();
        const activeIdxs = totals.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);
        labels     = activeIdxs.map(i => emojis[i]);
        data       = activeIdxs.map(i => totals[i]);
        colors     = activeIdxs.map(i => pal[i] || "#999");
        grandTotal = total;
    }

    const topIdx = data.indexOf(Math.max(...data));
    return { labels, data, colors, grandTotal, topIdx, useDiary, days, diaryTotal, moodCounts };
}

function renderPieLegend(pd, isWide) {
    const items = pd.labels.map((label, i) => `
        <div class="es-leg-row">
            <span class="es-leg-dot" style="background:${pd.colors[i]}"></span>
            <span class="es-leg-label">${label}</span>
        </div>
    `).join("");
    return `<div class="es-pie-legend${isWide ? " es-pie-legend--side" : " es-pie-legend--bottom"}">${items}</div>`;
}

function renderPie(history, emojis, state) {
    const pd = buildPieData(history, emojis, state);

    if (!pd) {
        return `
            <div class="es-pie-outer">
                <div class="es-pie-wrap es-empty-wrap">
                    <div class="es-empty">No data yet.<br><small>Log a diary mood or select an emoji.</small></div>
                </div>
            </div>
        `;
    }

    const widget    = document.getElementById("emotion-summary-widget");
    const isWide    = widget && widget.offsetWidth > widget.offsetHeight * 1.1;
    const { topIdx, grandTotal, useDiary, days, diaryTotal, moodCounts } = pd;
    const centerEmoji = pd.labels[topIdx] ?? "";
    const centerPct   = Math.round(pd.data[topIdx] / grandTotal * 100);

    let highlightHtml = "", comboHtml = "";
    if (useDiary) {
        highlightHtml = state.showHighlight
            ? `<div class="es-highlight">Most felt: <strong>${centerEmoji}</strong> ${centerPct}%
               <span class="es-days-badge">${diaryTotal} entr${diaryTotal !== 1 ? "ies" : "y"}</span></div>`
            : "";
    } else {
        const comboPairs = [];
        if (state.showCombo) {
            for (let i = 0; i < emojis.length; i++) {
                for (let j = i + 1; j < emojis.length; j++) {
                    if (pd.data[i] > 0 && pd.data[j] > 0) comboPairs.push(`${emojis[i]}+${emojis[j]}`);
                }
            }
        }
        highlightHtml = state.showHighlight
            ? `<div class="es-highlight">Most felt: <strong>${centerEmoji}</strong> ${centerPct}%
               <span class="es-days-badge">${days} day${days !== 1 ? "s" : ""}</span></div>`
            : "";
        comboHtml = state.showCombo && comboPairs.length
            ? `<div class="es-combo">Combo: ${comboPairs.slice(0, 3).join(" · ")}</div>`
            : "";
    }

    return `
        <div class="es-pie-outer${isWide ? " es-pie-outer--row" : ""}">
            <div class="es-pie-wrap">
                <canvas id="es-pie-chart"></canvas>
            </div>
            ${renderPieLegend(pd, isWide)}
        </div>
        ${highlightHtml}
        ${comboHtml}
    `;
}

function renderLine(history, emojis, state) {
    const allHistory = getEmotionHistory();
    const { scores } = buildMoodScoreTimeline(allHistory, emojis, state);
    const hasData = scores.some(s => s !== null);

    if (!hasData) {
        return `<div class="es-empty">No data yet.<br><small>Log a diary mood or select an emoji.</small></div>`;
    }

    return `
        <div class="es-line-wrap">
            <canvas id="es-line-chart"></canvas>
        </div>
    `;
}

/* ── Heatmap color helper ────────────────────────────────── */

function getDayHeatColor(date, emotionData, emojiCount) {
    const moodPal = getMoodPaletteColors();
    const mood = diaryMoods[date];
    if (mood) return moodPal[mood] || null;
    const score = getMoodScore(emotionData, null, emojiCount);
    if (score === null) return null;
    const ep = getEmojiPalette();
    if (score >= 7.5) return ep[0];
    if (score >= 5.5) return ep[1];
    if (score >= 4.0) return ep[2];
    if (score >= 2.5) return ep[3];
    return ep[4];
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
    const LEGEND_W  = 80;   // legend column width in side mode
    const LEGEND_H  = 30;   // legend row height in bottom mode

    const gridW = isWide
        ? Math.max(60, widgetW - 20 - LEGEND_W - 16 - 6 * 3)   // reserve legend column
        : Math.max(60, widgetW - 20 - 6 * 3);

    const gridH = Math.max(30,
        widgetH - BASE_OH - (isWide ? 0 : LEGEND_H) - (numWeeks - 1) * 3
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

        cells.push(`<div class="es-hm-cell${todayCls}" style="${style}" data-date="${date}"${moodAttr}${topicAttr}></div>`);
    }

    const moodPal = getMoodPaletteColors();
    const legendHtml = [
        [moodPal.Happy, "Happy"],
        [moodPal.Sad,   "Sad"],
        [moodPal.Angry, "Angry"],
    ].map(([c, l]) =>
        `<span class="es-hm-leg-item"><span class="es-hm-leg-dot" style="background:${c}"></span>${l}</span>`
    ).join("");

    const pal    = getESPaletteColors();
    const emptyC = hexAlpha(pal.content, 0.12);  // subtle tint of content colour for empty cells
    const todayC = pal.title;                     // today outline = title (accent) colour

    return `
        <div class="es-hm-outer${isWide ? " es-hm-outer--row" : ""}">
            <div class="es-heatmap" style="--cw:${cellW}px; --ch:${cellH}px; --hm-empty:${emptyC}; --hm-today:${todayC}">
                <div class="es-hm-header">${headerHtml}</div>
                <div class="es-hm-cells">${cells.join("")}</div>
            </div>
            <div class="es-hm-legend${isWide ? " es-hm-legend--side" : ""}">${legendHtml}</div>
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
        if (!pd) return;

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

        const allHistory = getEmotionHistory();
        const { scores, labels } = buildMoodScoreTimeline(allHistory, emojis, state);
        const validScores = scores.filter(s => s !== null);
        if (!validScores.length) return;

        const minScore = Math.min(...validScores);
        const maxScore = Math.max(...validScores);
        const pad = Math.max(0.3, (maxScore - minScore) * 0.15);

        // Line colour: use title colour (the primary accent)
        const lineColor = pal.title;

        chartInstance = new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Mood Score",
                    data: scores,
                    borderColor: lineColor,
                    backgroundColor: hexAlpha(lineColor, 0.08),
                    borderWidth: 2.5,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: lineColor,
                    pointHoverBorderColor: pal.bg,
                    pointHoverBorderWidth: 2.5,
                    fill: true,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        displayColors: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        cornerRadius: 8,
                        callbacks: {
                            title: items => items[0].label,
                            label: ctx => ctx.parsed.y != null
                                ? `  Mood Score   ${ctx.parsed.y.toFixed(1)}`
                                : null
                        }
                    }
                },
                scales: {
                    y: {
                        min: Math.max(0, minScore - pad),
                        max: Math.min(10, maxScore + pad),
                        grid:   { color: gridColor, lineWidth: 1, borderDash: [4, 4] },
                        border: { display: false, dash: [4, 4] },
                        ticks:  {
                            font: { size: 9, family: "Inter, sans-serif" },
                            color: tickColor,
                            maxTicksLimit: 5,
                            callback: v => v.toFixed(1)
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
            plugins: [crosshairPlugin]
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
        if (state.displayMode === "calendar") {
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
            widget.classList.toggle("es-cal-hdr-col", wH > wW);
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
