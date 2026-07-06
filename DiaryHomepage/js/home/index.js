import {
    updateDigitalClock
}
from "../widgets/digitalClock/updateDigitalClock.js";

import {
    createSettingPopup
}
from "../settings/core/settingPopup.js";

import {
    renderWidgets
}
from "../widgets/renderWidgets.js";

import {
    enableDrag,
    enableResize
}
from "../dashboard/index.js";

import {
    setupEditMode,
    showDeleteAllConfirm
}
from "./edit.js";

import {
    showReminderPopup
}
from "../shared/reminderPopup.js";

import {
    initOnboardingGuide
}
from "../shared/onboardingGuide.js";

import {
    hideWidget,
    getHiddenWidgets
}
from "./widgetVisibility.js";


import {
    loadLayout
}
from "./loadLayout.js";

import {
    applyDefaultLayout,
    resetToDefaultLayout
}
from "./defaultLayout.js";

import {
    loadLayoutFromServer,
    syncLayoutToServer
}
from "./serverLayout.js";

import {
    loadCurrentUser,
    ensureUserScopeFresh
}
from "../currentUser.js";

import {
    getWidgetAppearance,
    applyWidgetAppearance
}
from "../settings/appearance/widgetAppearance.js";

import {
    initHistoryButtons,
    undo,
    redo,
    clearHistory
}
from "./historyManager.js";

import {
    enableFontScale
}
from "../dashboard/fontScale.js";

import {
    applyContentConstraints
}
from "../dashboard/resizeConstraints.js";

import {
    renderWeatherHour,
    initWeatherHourFontScale
}
from "../widgets/weatherHour.js";

import {
    renderWeatherDay
}
from "../widgets/weatherDay.js";

import {
    renderWeatherWeek
}
from "../widgets/weatherWeek.js";

import {
    initializeNowStreak
}
from "../widgets/nowStreak.js";

import {
    initializeHighStreak
}
from "../widgets/highStreak.js";

import {
    initializePictureStreak
}
from "../widgets/pictureStreak.js";

import {
    getExtraPictureInstances
}
from "./addWidgetPanel.js";

import {
    initializeEmotionSummary
}
from "../widgets/emotionSummary.js";

import {
    initializeQuote
}
from "../widgets/quote.js";

import {
    initializeTodayEmotion
}
from "../widgets/todayEmotion.js";

import {
    initializeDiaryCard
}
from "../widgets/diaryCard.js";

import {
    initDecoLayer,
    applyDecoItems,
    enableDecoClick,
    exitDecoMode
}
from "../settings/deco/decoLayer.js";

import {
    getDecoItems,
    clearDecoItems
}
from "../settings/deco/decoData.js";

// 首页的总入口函数：负责按正确的顺序，把首页从"一片空白"变成
// "所有组件都显示出来、可以拖动/调整大小/设置"的完整状态。
// 大致顺序是：确认登录用户 → 清理跨账号残留缓存 → 从服务器加载
// 保存的布局 → 把组件的 HTML 画到页面上 → 给没有保存过布局的
// 新用户填入默认布局 → 给每个组件绑定拖动/调整大小/右键菜单等
// 交互 → 初始化每个具体组件自己的逻辑（天气、心情、连续天数等）→
// 绑定撤销/重做、编辑模式、装饰模式、删除全部、重置布局等全局功能。
// The homepage's main entry function: responsible for turning the
// homepage from "completely blank" into the full working state where
// every widget is shown and can be dragged/resized/configured, in the
// correct order. Roughly: resolve the logged-in user → wipe any
// cross-account leftover cache → load the saved layout from the server →
// paint each widget's HTML onto the page → seed a default layout for
// new users who have no saved layout yet → wire up drag/resize/
// right-click-menu interactions on every widget → initialize each
// individual widget's own logic (weather, mood, streaks, etc) → wire up
// undo/redo, edit mode, deco mode, delete-all, and reset-layout global
// features.
export async function initializeHomepage() {

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (!dashboard) {
        return;
    }

    // Resolve the logged-in username first so mood/emotion widgets can
    // namespace their localStorage keys and never read another account's data.
    await loadCurrentUser();

    // If this browser's last active account differs from the one logged in now,
    // wipe all cached widget/layout/diary localStorage so nothing from the
    // previous account can leak into this account's dashboard.
    ensureUserScopeFresh();

    initOnboardingGuide();

    // Load this user's saved layout from the server before rendering.
    // For first-time users the server returns {}, so localStorage stays empty
    // and applyDefaultLayout() seeds it with the built-in defaults below.
    const hadSavedLayout = await loadLayoutFromServer();

    dashboard.innerHTML =
        renderWidgets();

    // Seed localStorage with default positions/styles for first-time users.
    // Only writes entries that don't already exist, so saved layouts are never overwritten.
    applyDefaultLayout();

    // If this is a brand-new user (no saved layout), sync the seeded defaults
    // to the server immediately so they get the same layout on any device.
    if (!hadSavedLayout) {
        syncLayoutToServer();
    }

    const settingsButton =
        document.getElementById(
            "homepage-settings"
        );

    const menu =
        document.getElementById(
            "homepage-menu"
        );

    const editLayoutButton =
        document.getElementById(
            "edit-layout-btn"
        );

    const widgets =
        Array.from(
            document.querySelectorAll(
                ".widget"
            )
        );

    // 给每个组件依次绑定：读取保存的位置/大小、应用内容边界限制、
    // 应用保存的外观设置、字体自动缩放、右键菜单（打开设置弹窗）、
    // 拖动、调整大小。
    // For each widget in turn, this wires up: loading its saved
    // position/size, applying content boundary constraints, applying its
    // saved appearance settings, auto font scaling, a right-click menu
    // (opens the settings popup), dragging, and resizing.
    widgets.forEach(
        widget => {

            loadLayout(
                widget
            );

            applyContentConstraints(widget);

            const savedApp = getWidgetAppearance(widget.id);
            if (savedApp) {
                applyWidgetAppearance(widget, savedApp);
            }

            enableFontScale(widget);

            const dragHandle =
                widget.querySelector(
                    ".drag-handle"
                );

            const resizeHandle =
                widget.querySelector(
                    ".resize-handle"
                );

            widget.addEventListener(
                "contextmenu",
                event => {

                    event.preventDefault();

                    console.log(
                        "RIGHT CLICK WORKING"
                    );

                    createSettingPopup(
                        widget.id
                    );

                }
            );

            widget.style.visibility =
                "visible";

            enableDrag(
                widget,
                dragHandle
            );

            enableResize(
                widget,
                resizeHandle
            );

        }
    );

    updateDigitalClock();

    // 初始化每个具体组件自己的数据/渲染逻辑（各自负责自己的 localStorage
    // 读取、向服务器请求数据、画出初始内容）。
    // Initializes each individual widget's own data/render logic (each
    // handles its own localStorage reads, server data requests, and
    // drawing its initial content).
    renderWeatherHour();
    initWeatherHourFontScale();
    renderWeatherDay();
    renderWeatherWeek();
    initializeTodayEmotion();
    initializeNowStreak();
    initializeHighStreak();
    initializePictureStreak();
    getExtraPictureInstances().forEach(id => initializePictureStreak(id));
    initializeEmotionSummary();
    initializeQuote();
    initializeDiaryCard();

    const undoBtn = document.getElementById("history-undo");
    const redoBtn = document.getElementById("history-redo");
    if (undoBtn && redoBtn) {
        initHistoryButtons(undoBtn, redoBtn);
        undoBtn.addEventListener("click", undo);
        redoBtn.addEventListener("click", redo);
        document.addEventListener("keydown", e => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
                e.preventDefault(); undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
                e.preventDefault(); redo();
            }
        });
    }

    setupEditMode(
        settingsButton,
        menu,
        editLayoutButton,
        widgets
    );

    // 如果之前是通过"添加组件"面板加了新组件后刷新页面回来的，
    // 这里会检测到那个标记，自动帮用户重新点一次"编辑布局"按钮，
    // 让用户不需要自己再点一次就能继续调整刚加的组件。
    // If the page reload happened right after adding a new widget from
    // the "Add Widget" panel, this detects that marker and automatically
    // clicks the "Edit Layout" button on the user's behalf, so they don't
    // have to click it again themselves to keep adjusting the widget they
    // just added.
    if (sessionStorage.getItem("restore-edit-mode")) {
        sessionStorage.removeItem("restore-edit-mode");
        editLayoutButton.click();
    }

    // ── Deco ──────────────────────────────────────────────────────────────
    // ── 装饰功能 ──────────────────────────────────────────────────────────────
    widgets.forEach(widget => {
        initDecoLayer(widget);
        applyDecoItems(widget, getDecoItems(widget.id));
        enableDecoClick(widget);
    });

    let _decoToolbar = null;
    function _getDecoToolbar() {
        if (_decoToolbar) return _decoToolbar;
        _decoToolbar = document.createElement("div");
        _decoToolbar.id = "deco-toolbar";
        _decoToolbar.innerHTML = `<span>Click any card to add a decoration</span><button id="deco-toolbar-exit">Done</button>`;
        document.body.appendChild(_decoToolbar);
        document.getElementById("deco-toolbar-exit").addEventListener("click", _endDecoMode);
        return _decoToolbar;
    }

    function _endDecoMode() {
        exitDecoMode();
    }

    const decoBtn = document.getElementById("deco-btn");
    if (decoBtn) {
        decoBtn.addEventListener("click", () => {
            menu.style.display = "none";
            document.body.classList.add("deco-mode");
            _getDecoToolbar().classList.add("visible");
        });
    }

    // Exit deco mode when pressing Escape
    // 按 Escape 键退出装饰模式
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && document.body.classList.contains("deco-mode")) {
            _endDecoMode();
        }
    });

    // Delete All Widgets button
    // "删除所有组件"按钮
    const deleteAllBtn = document.getElementById("delete-all-widgets-btn");
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener("click", () => {
            menu.style.display = "none";
            showDeleteAllConfirm(() => {
                const allWidgets = Array.from(document.querySelectorAll(".widget"));
                allWidgets.forEach(w => {
                    hideWidget(w.id);
                    clearDecoItems(w.id);
                    w.remove();
                });
                syncLayoutToServer();
            });
        });
    }

    // Reset Layout button — re-applies default positions + styles to all widgets
    // "重置布局"按钮——把所有组件重新套用回默认的位置和样式
    const resetLayoutButton = document.getElementById("reset-layout-btn");
    if (resetLayoutButton) {
        resetLayoutButton.addEventListener("click", () => {
            showReminderPopup({
                title: "Reset Layout?",
                message: "Reset all widgets to the default layout? This will undo your current arrangement.",
                confirmText: "Reset",
                cancelText: "Cancel",
                danger: true,
                onConfirm: async () => {
                    resetToDefaultLayout();
                    clearHistory();
                    await syncLayoutToServer();
                    menu.style.display = "none";
                    window.location.reload();
                }
            });
        });
    }

}
