import { saveLayout } from "./saveLayout.js";
import { hideWidget } from "./widgetVisibility.js";
import { openAddWidgetPanel, removeExtraPictureInstance } from "./addWidgetPanel.js";
import { syncLayoutToServer } from "./serverLayout.js";
import { showReminderPopup } from "../shared/reminderPopup.js";

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
    showReminderPopup({
        title: "Delete Widget?",
        message: `Remove <strong>${widgetName}</strong> from your homepage.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
        onConfirm
    });
}

export function showDeleteAllConfirm(onConfirm) {
    showReminderPopup({
        title: "Delete All Widgets?",
        message: "All widgets will be removed from your homepage.",
        confirmText: "Delete All",
        cancelText: "Cancel",
        danger: true,
        onConfirm
    });
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
