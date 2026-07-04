import { userScopedKey } from "../currentUser.js";

// "High Streak" 组件：显示"历史最长连续写日记天数的记录"（跟
// nowStreak.js 的"当前连续天数"不同，这个是查看所有日记日期后，
// 找出曾经出现过的最长连续区间，即使现在已经断掉了）。
// The "High Streak" widget: shows the all-time best (longest ever)
// consecutive journaling streak (unlike nowStreak.js's "current streak",
// this one scans every journal date to find the longest run that ever
// occurred, even if the streak has since been broken).

const STORAGE_KEY = "high-streak-display";

const DEFAULT_STATE = {
    displayMode: "number",
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

// Current streak: consecutive days ending today (or yesterday)
// 当前连续天数：从今天（如果今天还没写就从昨天）往前数，连续写了几天
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

// Best ever streak across all journal entries
// 把所有写过日记的日期从旧到新排序，逐一比较相邻两个日期是否刚好
// 差一天（86400000 毫秒 = 一天）：如果是，说明连续天数继续累加；
// 如果不是，说明断了，重新从 1 开始数，同时记录出现过的最大值。
// Sorts every journal date from oldest to newest, then checks each pair
// of adjacent dates to see if they're exactly one day apart (86400000ms
// = one day): if so, the running streak count keeps growing; if not, the
// streak broke, so it resets to 1 — while tracking the largest value seen.
function calculateHighStreak(dates) {
    if (dates.size === 0) return 0;
    const sorted = [...dates].sort();
    let max = 0, cur = 0;
    for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
            cur = 1;
        } else {
            const diff = Math.round(
                (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
            );
            cur = diff === 1 ? cur + 1 : 1;
        }
        if (cur > max) max = cur;
    }
    return max;
}

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
    const high = calculateHighStreak(dates);

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
                ${renderHeatmap(dates)}
            </div>`;
    }

    return `
        <div class="streak-body">
            <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
        </div>`;
}

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
    const content = document.querySelector("#high-streak-widget .widget-content");
    if (!content) return;
    content.innerHTML = renderWidget(dates, state);
}

export function createHighStreakWidget() {
    return `
        <div class="widget" id="high-streak-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>High Streak</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export async function initializeHighStreak() {
    const widget = document.getElementById("high-streak-widget");
    if (!widget) return;

    const dates = await fetchJournalDates();

    rerender(dates, getState());
}

export function getHighStreakState() {
    return getState();
}

export function updateHighStreakState(partial) {
    const next = saveState(partial);
    fetchJournalDates().then(dates => rerender(dates, next));
    return next;
}
