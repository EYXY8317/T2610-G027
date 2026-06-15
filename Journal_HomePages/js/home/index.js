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
    setupEditMode
}
from "./edit.js";

import {
    loadLayout
}
from "./loadLayout.js";

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

export function initializeHomepage() {

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (!dashboard) {
        return;
    }

    dashboard.innerHTML =
        renderWidgets();

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
    initializeEmotionSummary();
    initializeQuote();
    
    setupEditMode(
        settingsButton,
        menu,
        editLayoutButton,
        widgets
    );

}
