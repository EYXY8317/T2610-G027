import { getHiddenWidgets, showWidget } from "./widgetVisibility.js";
import { syncLayoutToServer } from "./serverLayout.js";
import { getConstraints } from "../dashboard/resizeConstraints.js";
<<<<<<< HEAD
=======
import { showReminderPopup } from "../shared/reminderPopup.js";
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1

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

function showNoSpacePopup() {
<<<<<<< HEAD
    const modal = document.createElement("div");
    modal.className = "confirm-overlay";
    modal.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-modal-title">Not Enough Space</div>
            <div class="confirm-modal-body">There isn't enough room to place this widget without overlapping. Try moving or resizing existing widgets first.</div>
            <div class="confirm-modal-btns">
                <button class="confirm-ok-btn">OK</button>
            </div>
        </div>
    `;
    modal.querySelector(".confirm-ok-btn").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
=======
    showReminderPopup({
        title: "Not Enough Space",
        message: "There isn't enough room to place this widget without overlapping. Try moving or resizing existing widgets first.",
        confirmText: "OK"
    });
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
}

export function openAddWidgetPanel() {
    const hidden = getHiddenWidgets();

    // Standard widgets: show ones that are hidden
    const hiddenWidgets = ALL_IDS.filter(id =>
        id !== "picture-streak-widget" && hidden.includes(id)
    );

    // Picture streak is always addable
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
                showNoSpacePopup();
                return;
            }

            if (widgetId === "picture-streak-widget") {
                // Restoring the base instance from hidden
                showWidget(widgetId);
            } else if (widgetId.startsWith("picture-streak-widget-")) {
                // Brand new extra instance
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
