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
            document.querySelectorAll(
                ".widget"
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
);