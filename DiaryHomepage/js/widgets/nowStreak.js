import { userScopedKey } from "../currentUser.js";

// "Now Streak" 组件：显示"连续写日记的天数"，可以切换成数字显示，
// 或者像 GitHub 贡献图那样的小方格热力图显示。
// The "Now Streak" widget: shows the current consecutive-day journaling
// streak, switchable between a plain number display or a small
// GitHub-contributions-style heatmap grid.

const STORAGE_KEY = "now-streak-display";

const DEFAULT_STATE = {
    displayMode: "number"   // "number" | "heatmap"
};

function getState() {
    const raw = localStorage.getItem(userScopedKey(STORAGE_KEY));
    if (!raw) return { ...DEFAULT_STATE };
    try { return { ...DEFAULT_STATE, ...JSON.parse(raw) }; }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(userScopedKey(STORAGE_KEY), JSON.stringify(next));
    return next;
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

// Count consecutive days ending today (or yesterday if today has no entry yet)
// 计算"到今天为止连续写了几天"（如果今天还没写，就从昨天开始往前数，
// 避免还没写今天日记就直接把连续天数清零）。
function calculateStreak(dates) {
    const date = new Date();
    if (!dates.has(date.toISOString().slice(0, 10))) {
        date.setDate(date.getDate() - 1);
    }
    let streak = 0;
    while (true) {
        const key = date.toISOString().slice(0, 10);
        if (!dates.has(key)) break;
        streak++;
        date.setDate(date.getDate() - 1);
    }
    return streak;
}

// 画热力图：一共 15 周（15 列），每列 7 天（7 行），从今天往前数，
// 每写过日记的那一天格子就点亮（加上 active 样式）。
// Draws the heatmap: 15 weeks (columns) total, 7 days each (rows),
// counting backward from today — each day with a journal entry gets its
// cell lit up (the "active" class).
function renderHeatmap(dates) {
    const weeks = 15;
    const cells = [];
    const today = new Date();
    for (let w = weeks - 1; w >= 0; w--) {
        const col = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const key = date.toISOString().slice(0, 10);
            col.push(`<div class="streak-cell${dates.has(key) ? " active" : ""}" title="${key}"></div>`);
        }
        cells.push(`<div class="streak-col">${col.join("")}</div>`);
    }
    return `<div class="streak-heatmap">${cells.join("")}</div>`;
}

function renderWidget(dates, state) {
    const streak    = calculateStreak(dates);
    const todayDone = dates.has(todayKey());

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-label">Journal Streak</div>
                <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
                ${renderHeatmap(dates)}
                ${todayDone ? `<div class="streak-today-done">✓ Written today</div>` : ""}
            </div>`;
    }

    return `
        <div class="streak-body">
            <div class="streak-label">Journal Streak</div>
            <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
            ${todayDone ? `<div class="streak-today-done">✓ Written today</div>` : ""}
        </div>`;
}

// 向服务器请求"这个用户写过日记的所有日期"，用 Set 存起来方便
// 用 .has() 快速判断某一天有没有写过日记。
// Requests "every date this user has written a journal entry for" from
// the server, stored as a Set so .has() can quickly check whether a
// given day has an entry.
async function fetchJournalDates() {
    try {
        const res  = await fetch("/journal_dates");
        const data = await res.json();
        return new Set(data.dates || []);
    } catch {
        return new Set();
    }
}

function rerender(dates, state) {
    const content = document.querySelector("#now-streak-widget .widget-content");
    if (!content) return;
    content.innerHTML = renderWidget(dates, state);
}

export function createNowStreakWidget() {
    return `
        <div class="widget" id="now-streak-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Now Streak</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export async function initializeNowStreak() {
    const widget = document.getElementById("now-streak-widget");
    if (!widget) return;
    const dates = await fetchJournalDates();
    rerender(dates, getState());
}

export function getNowStreakState() {
    return getState();
}

export function updateNowStreakState(partial) {
    const next = saveState(partial);
    fetchJournalDates().then(dates => rerender(dates, next));
    return next;
}
