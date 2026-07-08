import { getHiddenWidgets, showWidget } from "./widgetVisibility.js";
import { syncLayoutToServer } from "./serverLayout.js";
import { getConstraints } from "../dashboard/resizeConstraints.js";
import { showNoSpaceModal } from "../dashboard/expandWidget.js";

// "添加组件"面板：显示所有目前被隐藏的组件，让用户点击"Add"把它们
// 重新加回首页；同时也支持添加多个 Picture Streak 组件实例
// （不像其他组件只能有一个）。
// The "Add Widget" panel: lists every widget that's currently hidden, so
// the user can click "Add" to bring it back onto the home page; it also
// supports adding multiple Picture Streak widget instances (unlike other
// widgets, which can only have one).

const WIDGET_INFO = {
    "digital-clock-widget":   { name: "Digital Clock",   icon: "🕐" },
    "weather-hour-widget":    { name: "Weather Hours",   icon: "🌤️" },
    "weather-day-widget":     { name: "Weather Day",     icon: "☀️" },
    "weather-week-widget":    { name: "Weather Week",    icon: "📅" },
    "today-emotion-widget":   { name: "Emotion Today",   icon: "😊" },
    "now-streak-widget":      { name: "Now Streak",      icon: "🔥" },
    "high-streak-widget":     { name: "High Streak",     icon: "🏆" },
    "picture-streak-widget":  { name: "Picture Streak",  icon: "📷" },
    "emotion-summary-widget": { name: "Emotion Summary", icon: "📊" },
    "quote-widget":           { name: "Quote",           icon: "💬" },
    "diary-card-widget":      { name: "Diary",           icon: "📖" },
};

const ALL_IDS = Object.keys(WIDGET_INFO);

// ── Extra picture streak instances ───────────────────────────
// ── 额外的 Picture Streak 实例 ───────────────────────────
const EXTRA_KEY = "picture-streak-extra-instances";

export function getExtraPictureInstances() {
    try { return JSON.parse(localStorage.getItem(EXTRA_KEY)) || []; }
    catch { return []; }
}

function addExtraPictureInstance(id) {
    const extras = getExtraPictureInstances();
    if (!extras.includes(id)) {
        localStorage.setItem(EXTRA_KEY, JSON.stringify([...extras, id]));
    }
}

export function removeExtraPictureInstance(id) {
    const extras = getExtraPictureInstances();
    localStorage.setItem(EXTRA_KEY, JSON.stringify(extras.filter(e => e !== id)));
    localStorage.removeItem(`${id}-layout`);
    localStorage.removeItem(`${id}-state`);
    localStorage.removeItem(`${id}-appearance`);
}

// 决定"再加一个 Picture Streak"时应该用哪个 id：如果原本那个基础
// 实例被隐藏了，优先把它复原（而不是凭空多建一个）；否则从 2 开始
// 找一个还没被用过的编号，生成新的额外实例 id。
// Decides which id to use when adding another Picture Streak: if the
// original base instance is currently hidden, it's restored first
// (instead of creating a brand new one out of nowhere); otherwise it
// searches upward from 2 for an unused number to generate a new extra
// instance id.
function nextPictureId() {
    const hidden = getHiddenWidgets();
    // If the base instance is hidden, restore it instead of creating a new one
    if (hidden.includes("picture-streak-widget")) return "picture-streak-widget";
    // Otherwise generate the next available numbered ID
    const extras = getExtraPictureInstances();
    let n = 2;
    while (extras.includes(`picture-streak-widget-${n}`)) n++;
    return `picture-streak-widget-${n}`;
}

// ── Layout helpers ────────────────────────────────────────────
// ── 布局相关的辅助函数 ────────────────────────────────────────────

// 收集所有目前显示中（没被隐藏）的组件占用的矩形区域，用来判断
// "新加的组件放哪里才不会跟别的组件重叠"。
// Collects the rectangle occupied by every widget that's currently
// visible (not hidden), used to figure out where a newly added widget
// can be placed without overlapping anything else.
function getOccupied(excludeId) {
    const hidden = getHiddenWidgets();
    const extras = getExtraPictureInstances();
    const allIds = [...ALL_IDS, ...extras];
    return allIds
        .filter(id => id !== excludeId && !hidden.includes(id))
        .flatMap(id => {
            const raw = localStorage.getItem(`${id}-layout`);
            if (!raw) return [];
            try {
                const l = JSON.parse(raw);
                const left   = parseInt(l.left)   || 0;
                const top    = parseInt(l.top)    || 0;
                const width  = parseInt(l.width)  || 200;
                const height = parseInt(l.height) || 150;
                return [{ left, top, right: left + width, bottom: top + height }];
            } catch { return []; }
        });
}

// 从导航栏下方开始，按固定步长（20px）逐格扫描屏幕，找到第一个
// 大小够放下新组件、并且跟已占用区域没有重叠（含 GAP 间距缓冲）
// 的空位。找不到就返回 null。
// Starting just below the navbar, scans the screen in fixed steps (20px)
// looking for the first spot big enough for the new widget that doesn't
// overlap any already-occupied area (with a GAP buffer). Returns null if
// no spot is found.
function tryFit(occupied, w, h, navH) {
    const GAP  = 14;
    const STEP = 20;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;

    for (let y = navH + GAP; y + h + GAP <= maxH; y += STEP) {
        for (let x = GAP; x + w + GAP <= maxW; x += STEP) {
            const r = { left: x, top: y, right: x + w, bottom: y + h };
            const blocked = occupied.some(o =>
                r.right  > o.left  - GAP &&
                r.left   < o.right + GAP &&
                r.bottom > o.top   - GAP &&
                r.top    < o.bottom + GAP
            );
            if (!blocked) return { left: x + "px", top: y + "px", width: w + "px", height: h + "px" };
        }
    }
    return null;
}

function findEmptySpot(targetId) {
    const navH          = document.querySelector(".navbar")?.offsetHeight || 70;
    const occupied      = getOccupied(targetId);
    const baseId        = targetId.replace(/-\d+$/, "");
    const { minW, minH } = getConstraints(baseId);
    return tryFit(occupied, minW, minH, navH);
}

export function openAddWidgetPanel() {
    const hidden = getHiddenWidgets();

    // Standard widgets: show ones that are hidden
    // 普通组件：只列出目前被隐藏的那些
    const hiddenWidgets = ALL_IDS.filter(id =>
        id !== "picture-streak-widget" && hidden.includes(id)
    );

    // Picture streak is always addable
    // Picture Streak 永远可以再加一个，不受"是否隐藏"限制
    const panelWidgets = [
        ...hiddenWidgets,
        "picture-streak-widget",
    ];

    const overlay = document.createElement("div");
    overlay.className = "add-widget-overlay";

    const bodyHTML = panelWidgets.length === 0
        ? `<div class="add-widget-empty">All widgets are already on your homepage.</div>`
        : `<div class="add-widget-grid">
            ${panelWidgets.map(id => {
                const { name, icon } = WIDGET_INFO[id] || { name: id, icon: "📦" };
                return `
                    <div class="add-widget-card">
                        <div class="add-widget-icon">${icon}</div>
                        <div class="add-widget-name">${name}</div>
                        <button class="add-widget-btn" data-id="${id}">Add</button>
                    </div>
                `;
            }).join("")}
           </div>`;

    overlay.innerHTML = `
        <div class="add-widget-panel">
            <div class="add-widget-header">
                <span>Add Widget</span>
                <button class="add-widget-close">✕</button>
            </div>
            ${bodyHTML}
        </div>
    `;

    overlay.querySelector(".add-widget-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    // 点击某个组件卡片的"Add"按钮：先算出应该用哪个组件 id
    // （Picture Streak 要特殊处理，可能是复原或是新建一个实例），
    // 再找一块没有重叠的空位放它；如果找不到空位就弹出提示，
    // 否则显示/新建这个组件、把它的布局写入 localStorage、
    // 标记"重新加载后自动进入编辑模式"、同步到服务器，
    // 最后刷新整个页面，让新组件真正出现在画面上。
    // Clicking a widget card's "Add" button: first works out which
    // widget id to use (Picture Streak needs special handling — it might
    // be restoring the hidden base instance or creating a brand new
    // extra one), then looks for a non-overlapping empty spot for it; if
    // none is found, shows a popup instead. Otherwise it shows/creates
    // the widget, writes its layout into localStorage, marks "re-enter
    // edit mode after reload", syncs to the server, then reloads the
    // whole page so the new widget actually appears on screen.
    overlay.querySelectorAll(".add-widget-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const clickedId = btn.dataset.id;

            let widgetId;
            if (clickedId === "picture-streak-widget") {
                widgetId = nextPictureId();
            } else {
                widgetId = clickedId;
            }

            const spot = findEmptySpot(widgetId);
            if (!spot) {
                showNoSpaceModal();
                return;
            }

            if (widgetId === "picture-streak-widget") {
                // Restoring the base instance from hidden
                // 从隐藏状态复原基础实例
                showWidget(widgetId);
            } else if (widgetId.startsWith("picture-streak-widget-")) {
                // Brand new extra instance
                // 全新的额外实例
                addExtraPictureInstance(widgetId);
            } else {
                showWidget(widgetId);
            }

            const current = (() => {
                try { return JSON.parse(localStorage.getItem(`${widgetId}-layout`)) || {}; }
                catch { return {}; }
            })();
            localStorage.setItem(`${widgetId}-layout`, JSON.stringify({ ...current, ...spot }));
            sessionStorage.setItem("restore-edit-mode", "1");
            await syncLayoutToServer();
            overlay.remove();
            window.location.reload();
        });
    });

    document.body.appendChild(overlay);
}
