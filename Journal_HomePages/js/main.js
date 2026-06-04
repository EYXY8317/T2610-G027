import {
    renderWidgets
}
from "./widgets/renderWidgets.js";

import {
    enableDrag
}
from "./dashboard/dragManager.js";

import {
    enableResize
}
from "./dashboard/resizeManager.js";

import {
    setupEditMode
}
from "./homepage/editMode.js";

import {
    loadLayout
}
from "./homepage/layoutStorage.js";

console.clear();

console.log(
    "Journal Homepage Loaded"
);

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const dashboard =
            document.getElementById(
                "dashboard"
            );

        console.log(
            renderWidgets()
        );

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

        const widget =
            document.getElementById(
                "weather-hour-widget"
            );

        const dragHandle =
            document.getElementById(
                "weather-hour-drag-handle"
            );

        const resizeHandle =
            document.querySelector(
                ".resize-handle"
            );

        loadLayout(
            widget
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

        setupEditMode(

            settingsButton,
            menu,
            editLayoutButton,
            widget,
            dragHandle,
            resizeHandle,

            enableDrag,
            enableResize

        );

    }
);