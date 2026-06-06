import {
    createSettingPopup
}
from "../settings/core/settingPopup.js";

import {
    renderWidgets
}
from "../widgets/renderers/renderWidgets.js";

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

                    createSettingPopup(
                        "Widget Settings"
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

    setupEditMode(
        settingsButton,
        menu,
        editLayoutButton,
        widgets
    );

}