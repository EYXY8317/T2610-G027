import { saveLayout } from "./saveLayout.js";
import { hideWidget } from "./widgetVisibility.js";
import { openAddWidgetPanel, removeExtraPictureInstance } from "./addWidgetPanel.js";
import { syncLayoutToServer } from "./serverLayout.js";

const WIDGET_NAMES = {
    "digital-clock-widget":   "Digital Clock",
    "weather-hour-widget":    "Weather Hours",
    "weather-day-widget":     "Weather Day",
    "weather-week-widget":    "Weather Week",
    "today-emotion-widget":   "Emotion Today",
    "now-streak-widget":      "Now Streak",
    "high-streak-widget":     "High Streak",
    "picture-streak-widget":  "Picture Streak",
    "emotion-summary-widget": "Emotion Summary",
    "quote-widget":           "Quote",
    "diary-card-widget":      "Diary"
};

function getWidgetName(id) {
    if (id.startsWith("picture-streak-widget")) return "Picture Streak";
    return WIDGET_NAMES[id] || "this widget";
}

function showDeleteConfirm(widgetName, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "delete-confirm-overlay";
    overlay.innerHTML = `
        <div class="delete-confirm-popup">
            <div class="delete-confirm-title">Delete Widget?</div>
            <div class="delete-confirm-msg">Remove <strong>${widgetName}</strong> from your homepage.</div>
            <div class="delete-confirm-actions">
                <button class="delete-confirm-cancel">Cancel</button>
                <button class="delete-confirm-ok">Delete</button>
            </div>
        </div>
    `;
    overlay.querySelector(".delete-confirm-cancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector(".delete-confirm-ok").addEventListener("click", () => {
        overlay.remove();
        onConfirm();
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

export function showDeleteAllConfirm(onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "delete-confirm-overlay";
    overlay.innerHTML = `
        <div class="delete-confirm-popup">
            <div class="delete-confirm-title">Delete All Widgets?</div>
            <div class="delete-confirm-msg">All widgets will be removed from your homepage.</div>
            <div class="delete-confirm-actions">
                <button class="delete-confirm-cancel">Cancel</button>
                <button class="delete-confirm-ok">Delete All</button>
            </div>
        </div>
    `;
    overlay.querySelector(".delete-confirm-cancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector(".delete-confirm-ok").addEventListener("click", () => {
        overlay.remove();
        onConfirm();
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

export function setupEditMode(settingsButton, menu, editLayoutButton, widgetList) {
    let menuOpen = false;
    let editMode = false;
    let activeWidgets = [...widgetList];

    function injectDeleteBtn(widget) {
        if (widget.querySelector(".widget-delete-btn")) return;
        const btn = document.createElement("button");
        btn.className = "widget-delete-btn";
        btn.textContent = "✕";
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const name = getWidgetName(widget.id);
            showDeleteConfirm(name, () => {
                if (widget.id.startsWith("picture-streak-widget-")) {
                    removeExtraPictureInstance(widget.id);
                } else {
                    hideWidget(widget.id);
                }
                widget.remove();
                activeWidgets = activeWidgets.filter(w => w !== widget);
            });
        });
        widget.appendChild(btn);
    }

    function enterEditMode() {
        editMode = true;
        menuOpen = false;
        menu.style.display = "none";
        activeWidgets.forEach(w => {
            w.classList.add("edit-mode");
            injectDeleteBtn(w);
        });
        settingsButton.textContent = "✓ Done";

        const addBtn = document.createElement("button");
        addBtn.id = "edit-mode-add-btn";
        addBtn.textContent = "+ Add Widget";
        addBtn.addEventListener("click", () => openAddWidgetPanel());
        settingsButton.parentElement.insertBefore(addBtn, settingsButton);
    }

    function exitEditMode() {
        activeWidgets.forEach(w => {
            saveLayout(w);
            w.classList.remove("edit-mode");
            w.querySelector(".widget-delete-btn")?.remove();
        });
        editMode = false;
        settingsButton.textContent = "⚙ Customize";
        document.getElementById("edit-mode-add-btn")?.remove();
        syncLayoutToServer();
    }

    settingsButton.addEventListener("click", () => {
        if (editMode) { exitEditMode(); return; }
        menuOpen = !menuOpen;
        menu.style.display = menuOpen ? "block" : "none";
    });

    editLayoutButton.addEventListener("click", enterEditMode);

    return { getActive: () => activeWidgets };
}
