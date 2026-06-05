import {
    applySnap
}
from "./core/widgetSnap.js";

import {
    clampWidgetToDashboard
}
from "./boundaryManager.js";

export function enableDrag(
    widget,
    handle
) {

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;

    const PADDING = 20;

    handle.addEventListener(
        "pointerdown",
        (event) => {

            isDragging = true;

            startX = event.clientX;

            startY = event.clientY;

            startLeft =
                widget.offsetLeft;

            startTop =
                widget.offsetTop;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );

    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!isDragging) {
                return;
            }

            const deltaX =
                event.clientX - startX;

            const deltaY =
                event.clientY - startY;

            const newLeft =
                startLeft + deltaX;

            const newTop =
                startTop + deltaY;

            const clamped =
                clampWidgetToDashboard(
                    widget,
                    newLeft,
                    newTop,
                    PADDING
                );

            const snapped =
                applySnap(
                    widget,
                    clamped.left,
                    clamped.top
                );

            widget.style.left =
                snapped.left + "px";

            widget.style.top =
                snapped.top + "px";

        }

    );

    handle.addEventListener(
        "pointerup",
        () => {

            const verticalLine =
                document.getElementById(
                    "snap-line"
                );

            const horizontalLine =
                document.getElementById(
                    "snap-line-horizontal"
                );

            verticalLine.style.display =
                "none";

            horizontalLine.style.display =
                "none";

            isDragging = false;

        }

    );

}