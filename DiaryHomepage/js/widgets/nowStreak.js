import { userScopedKey } from "../currentUser.js";
import { autoExpandWidget, showNoSpaceModal } from "../dashboard/expandWidget.js";
import { contentOverflow } from "../dashboard/resizeManager.js";
import { renderStreakHeatmap } from "./streakHeatmap.js";

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

function renderWidget(dates, state) {
    const streak    = calculateStreak(dates);
    const todayDone = dates.has(todayKey());

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-label">Journal Streak</div>
                <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
                ${renderStreakHeatmap(dates)}
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

// 数字模式直接渲染；热力图模式先渲染完整格子，尝试自动长高来装下它，
// 如果长高之后仍然装不下（比如仪表盘空间不够、会跟别的组件重叠），
// 就退回数字模式，并弹出跟"添加组件时空间不够"一样的提示——而不是
// 让格子被组件边界硬生生裁切掉一部分。
// Number mode just renders directly; heatmap mode first renders the full
// grid and tries auto-expanding to fit it, but if it still doesn't fit
// after that (not enough dashboard space, would overlap another widget,
// etc.), falls back to Number mode and shows the same "not enough space"
// notice used when adding a new widget, instead of leaving the grid
// clipped by the widget's edge.
function rerender(dates, state) {
    const widget  = document.getElementById("now-streak-widget");
    const content = widget?.querySelector(".widget-content");
    if (!content) return;

    content.innerHTML = renderWidget(dates, state);
    if (state.displayMode !== "heatmap") return;

    autoExpandWidget(widget.id, { silent: true });

    if (contentOverflow(widget) > 1) {
        const reverted = saveState({ displayMode: "number" });
        content.innerHTML = renderWidget(dates, reverted);
        showNoSpaceModal();
    }
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
    return fetchJournalDates().then(dates => { rerender(dates, next); return next; });
}
