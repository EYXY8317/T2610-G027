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
    renderWeatherHour
}
from "../widgets/weatherHour.js";

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
    initializeTodayEmotion();
    
    setupEditMode(
        settingsButton,
        menu,
        editLayoutButton,
        widgets
    );

}
