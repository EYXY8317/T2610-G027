const STORAGE_KEY = "emotion-summary-state";

const DEFAULT_STATE = {
    displayMode: "pie",          // "pie" | "line" | "calendar"
    timeRange: "week",           // "today" | "week" | "month" | "custom"
    customStart: "",
    customEnd: "",
    showCombo: true,             // show combo analysis
    showHighlight: true          // highlight most common + text summary
};

function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return { ...DEFAULT_STATE };
    }
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
    catch {
        return { ...DEFAULT_STATE };
    }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
}

/* ── Read emotion history ─────────────────────────────────── */

function getEmotionHistory() {
    // Reads from todayEmotion's own localStorage
    const raw = localStorage.getItem("today-emotion-state");
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        // history shape: { "YYYY-MM-DD": { selectedIndexes, sliderValues, displayedEmojis } }
        return parsed.history || {};
    }
    catch {
        return {};
    }
}

function getEmojis() {
    const raw = localStorage.getItem("today-emotion-state");
    if (!raw) {
        return ["😀", "😊", "🙂", "😐", "😔"];
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed.displayedEmojis || ["😀", "😊", "🙂", "😐", "😔"];
    }
    catch {
        return ["😀", "😊", "🙂", "😐", "😔"];
    }
}

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

    if (state.timeRange === "today") {
        start = today;
        end = today;
    } else if (state.timeRange === "week") {
        start = isoWeekStart();
        end = today;
    } else if (state.timeRange === "month") {
        start = isoMonthStart();
        end = today;
    } else {
        start = state.customStart || isoMonthStart();
        end = state.customEnd || today;
    }

    const filtered = {};

    for (const [date, data] of Object.entries(history)) {
        if (date >= start && date <= end) {
            filtered[date] = data;
        }
    }

    return filtered;

}

/* ── Build summary data ──────────────────────────────────── */

function buildEmojiTotals(history, emojis) {

    const totals = new Array(emojis.length).fill(0);
    let days = 0;

    for (const data of Object.values(history)) {

        if (!data) {
            continue;
        }

        const vals = data.sliderValues || [];
        days++;

        vals.forEach((v, i) => {
            if (i < totals.length) {
                totals[i] += Number(v) || 0;
            }
        });

    }

    return { totals, days };

}

function buildLineData(history, emojis) {

    const dates = Object.keys(history).sort();

    const datasets = emojis.map((emoji, i) => ({
        label: emoji,
        data: dates.map(d => {
            const vals = history[d]?.sliderValues || [];
            return vals[i] || 0;
        })
    }));

    return { dates, datasets };

}

/* ── Render ──────────────────────────────────────────────── */

let chartInstance = null;

function destroyChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

const PALETTE = [
    "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#f43f5e"
];

function renderPie(history, emojis, state) {

    const { totals } = buildEmojiTotals(history, emojis);
    const total = totals.reduce((s, v) => s + v, 0);

    if (!total) {
        return `<div class="es-empty">No emotion data for this period.</div>`;
    }

    const highlight = state.showHighlight;
    const maxIdx = totals.indexOf(Math.max(...totals));
    const maxEmoji = emojis[maxIdx];
    const maxPct = total ? Math.round(totals[maxIdx] / total * 100) : 0;

    const comboPairs = [];

    if (state.showCombo) {
        for (let i = 0; i < emojis.length; i++) {
            for (let j = i + 1; j < emojis.length; j++) {
                if (totals[i] > 0 && totals[j] > 0) {
                    comboPairs.push(`${emojis[i]}+${emojis[j]}`);
                }
            }
        }
    }

    return `
        <canvas id="es-pie-chart" style="max-height:160px;"></canvas>
        ${highlight ? `
            <div class="es-highlight">
                Most felt: ${maxEmoji} <strong>${maxPct}%</strong>
            </div>
        ` : ""}
        ${state.showCombo && comboPairs.length ? `
            <div class="es-combo">Combo: ${comboPairs.slice(0, 3).join(" · ")}</div>
        ` : ""}
    `;

}

function renderLine(history, emojis) {

    const { dates, datasets } = buildLineData(history, emojis);

    if (!dates.length) {
        return `<div class="es-empty">No emotion data for this period.</div>`;
    }

    const shortDates = dates.map(d => d.slice(5));

    return `
        <canvas id="es-line-chart"></canvas>
        <div class="es-legend">
            ${emojis.map((e, i) =>
                `<span style="color:${PALETTE[i] || "#999"}">${e}</span>`
            ).join("")}
        </div>
    `;

}

function renderCalendar(history, emojis, state) {

    const today = isoToday();
    const start = state.timeRange === "today" ? today
        : state.timeRange === "week" ? isoWeekStart()
        : state.timeRange === "month" ? isoMonthStart()
        : (state.customStart || isoMonthStart());

    const end = state.timeRange === "today" ? today
        : (state.customEnd || today);

    const dates = [];
    const cur = new Date(start);
    const endDate = new Date(end);

    while (cur <= endDate) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }

    const cells = dates.map(date => {

        const data = history[date];
        let emoji = "";

        if (data?.sliderValues) {
            const maxIdx = data.sliderValues.indexOf(Math.max(...data.sliderValues));
            if (data.sliderValues[maxIdx] > 0 && maxIdx < emojis.length) {
                emoji = emojis[maxIdx];
            }
        } else if (data?.selectedIndexes?.length) {
            const idx = data.selectedIndexes[0];
            emoji = emojis[idx] || "";
        }

        const isToday = date === today;

        return `
            <div class="es-cal-cell${isToday ? " today" : ""}" title="${date}">
                <span class="es-cal-day">${String(new Date(date + "T00:00:00").getDate()).padStart(2, "0")}</span>
                <span class="es-cal-emoji">${emoji}</span>
            </div>
        `;

    }).join("");

    return `<div class="es-calendar">${cells}</div>`;

}

function renderWidget(state) {

    const emojis = getEmojis();
    const allHistory = getEmotionHistory();
    const history = filterByRange(allHistory, state);

    let content;

    if (state.displayMode === "line") {
        content = renderLine(history, emojis);
    } else if (state.displayMode === "calendar") {
        content = renderCalendar(history, emojis, state);
    } else {
        content = renderPie(history, emojis, state);
    }

    return `<div class="es-body">${content}</div>`;

}

function initCharts(state) {

    destroyChart();

    const emojis = getEmojis();
    const allHistory = getEmotionHistory();
    const history = filterByRange(allHistory, state);

    if (state.displayMode === "pie") {

        const canvas = document.getElementById("es-pie-chart");

        if (!canvas) {
            return;
        }

        const { totals } = buildEmojiTotals(history, emojis);

        chartInstance = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: emojis,
                datasets: [{
                    data: totals,
                    backgroundColor: PALETTE
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: { font: { size: 11 }, padding: 6 }
                    }
                }
            }
        });

    } else if (state.displayMode === "line") {

        const canvas = document.getElementById("es-line-chart");

        if (!canvas) {
            return;
        }

        const { dates, datasets } = buildLineData(history, emojis);
        const shortDates = dates.map(d => d.slice(5));

        chartInstance = new Chart(canvas, {
            type: "line",
            data: {
                labels: shortDates,
                datasets: datasets.map((ds, i) => ({
                    ...ds,
                    borderColor: PALETTE[i] || "#999",
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 2
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100, ticks: { font: { size: 9 } } },
                    x: { ticks: { font: { size: 9 } } }
                }
            }
        });

    }

}

function rerender(state) {

    const content = document.querySelector("#emotion-summary-widget .widget-content");

    if (!content) {
        return;
    }

    content.innerHTML = renderWidget(state);

    requestAnimationFrame(() => initCharts(state));

}

function updateState(partial) {
    const next = saveState(partial);
    rerender(next);
    return next;
}

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
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeEmotionSummary() {

    const widget = document.getElementById("emotion-summary-widget");

    if (!widget) {
        return;
    }

    rerender(getState());

}

export function getEmotionSummaryState() {
    return getState();
}

export function updateEmotionSummaryState(partial) {
    return updateState(partial);
}
