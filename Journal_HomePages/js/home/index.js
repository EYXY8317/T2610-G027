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
    hideWidget,
    clearHiddenWidgets,
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
    openTemplatePicker
}
from "./templatePicker.js";

import {
    getWidgetAppearance,
    applyWidgetAppearance
}
from "../settings/appearance/widgetAppearance.js";

import {
    enableFontScale
}
from "../dashboard/fontScale.js";

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

export async function initializeHomepage() {

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (!dashboard) {
        return;
    }

    // Load this user's saved layout from the server before rendering.
    // For first-time users the server returns {}, so localStorage stays empty
    // and applyDefaultLayout() seeds it with the built-in defaults below.
    await loadLayoutFromServer();

    dashboard.innerHTML =
        renderWidgets();

    // Seed localStorage with default positions/styles for first-time users.
    // Only writes entries that don't already exist, so saved layouts are never overwritten.
    applyDefaultLayout();

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

    widgets.forEach(
        widget => {

            loadLayout(
                widget
            );

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
    
    setupEditMode(
        settingsButton,
        menu,
        editLayoutButton,
        widgets
    );

    if (sessionStorage.getItem("restore-edit-mode")) {
        sessionStorage.removeItem("restore-edit-mode");
        editLayoutButton.click();
    }

    const templatesBtn = document.getElementById("templates-btn");
    if (templatesBtn) {
        templatesBtn.addEventListener("click", () => {
            menu.style.display = "none";
            openTemplatePicker();
        });
    }

    // Delete All Widgets button
    const deleteAllBtn = document.getElementById("delete-all-widgets-btn");
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener("click", () => {
            menu.style.display = "none";
            showDeleteAllConfirm(() => {
                const allWidgets = Array.from(document.querySelectorAll(".widget"));
                allWidgets.forEach(w => {
                    hideWidget(w.id);
                    w.remove();
                });
            });
        });
    }

    // Reset Layout button — re-applies default positions + styles to all widgets
    const resetLayoutButton = document.getElementById("reset-layout-btn");
    if (resetLayoutButton) {
        resetLayoutButton.addEventListener("click", async () => {
            if (!confirm("Reset all widgets to the default layout? This will undo your current arrangement.")) return;

            clearHiddenWidgets();
            resetToDefaultLayout();
            await syncLayoutToServer();
            menu.style.display = "none";
            window.location.reload();
        });
    }

}
