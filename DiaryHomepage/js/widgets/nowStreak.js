import { userScopedKey } from "../currentUser.js";
import { autoExpandWidget } from "../dashboard/expandWidget.js";
import { contentOverflow } from "../dashboard/resizeManager.js";
import {
    renderStreakHeatmap,
    renderStreakHeatmapTrigger,
    openStreakHeatmapPopup
}
from "./streakHeatmap.js";

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

// heatmapView: "full" | "trigger" — "full" inlines the complete grid;
// "trigger" instead shows a button that opens it in a popup, used when
// the widget card isn't tall enough to fit the full grid without clipping.
function renderWidget(dates, state, heatmapView = "full") {
    const streak    = calculateStreak(dates);
    const todayDone = dates.has(todayKey());

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-label">Journal Streak</div>
                <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
                ${heatmapView === "full" ? renderStreakHeatmap(dates) : renderStreakHeatmapTrigger()}
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

// 数字模式直接渲染就好；热力图模式则先按"完整格子"渲染，尝试
// 自动长高来装下它，如果长高之后仍然装不下（比如仪表盘空间不够、
// 会跟别的组件重叠），就换成一个"查看热力图"按钮，点击后弹窗
// 展示完整格子——而不是让格子被组件边界硬生生裁切掉一部分。
// Number mode just renders directly; heatmap mode first renders the
// full grid and tries auto-expanding to fit it, but if it still doesn't
// fit after that (not enough dashboard space, would overlap another
// widget, etc.), swaps in a "View Heatmap" button that opens the full
// grid in a popup instead of leaving it clipped by the widget's edge.
function rerender(dates, state) {
    const widget  = document.getElementById("now-streak-widget");
    const content = widget?.querySelector(".widget-content");
    if (!content) return;

    if (state.displayMode !== "heatmap") {
        content.innerHTML = renderWidget(dates, state);
        return;
    }

    content.innerHTML = renderWidget(dates, state, "full");
    autoExpandWidget(widget.id);

    if (contentOverflow(widget) > 1) {
        content.innerHTML = renderWidget(dates, state, "trigger");
        content.querySelector(".streak-heatmap-btn")
            ?.addEventListener("click", () => openStreakHeatmapPopup("Journal Streak", dates));
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
