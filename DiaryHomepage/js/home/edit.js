import { saveLayout } from "./saveLayout.js";
import { hideWidget } from "./widgetVisibility.js";
import { openAddWidgetPanel, removeExtraPictureInstance } from "./addWidgetPanel.js";
import { syncLayoutToServer } from "./serverLayout.js";
import { showReminderPopup } from "../shared/reminderPopup.js";

// "编辑模式"：点击设置按钮旁边的"编辑布局"后进入，每个组件右上角
// 会冒出一个 ✕ 删除按钮，此时可以自由拖动/调整大小/删除组件，
// 点"完成"后退出编辑模式并把最终布局同步到服务器。这个文件也提供
// "删除单个组件"和"删除所有组件"的确认弹窗。
// "Edit mode": entered by clicking "Edit Layout" next to the settings
// button — each widget gets a ✕ delete button in its top-right corner,
// and widgets can be freely dragged/resized/deleted while in this mode;
// clicking "Done" exits edit mode and syncs the final layout to the
// server. This file also provides the confirmation popups for "delete
// one widget" and "delete all widgets".

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

// 给设置按钮、菜单、"编辑布局"按钮绑定交互逻辑，管理编辑模式的
// 进入/退出，并返回一个 { getActive } 对象，方便外部随时查询
// 当前还在画面上的组件有哪些。
// Wires up the interaction logic for the settings button, menu, and
// "Edit Layout" button, managing entering/exiting edit mode, and returns
// a { getActive } object so outside code can query which widgets are
// currently on screen at any time.
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
