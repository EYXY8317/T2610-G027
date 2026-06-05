import {
    computeSnappedPosition
}
from "./core/snapUtils.js";

import {
    hideGuideLines
}
from "./core/guideUtils.js";

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

            const newLeft = startLeft + deltaX;

            const newTop = startTop + deltaY;

            const snapped = computeSnappedPosition(
                widget,
                newLeft,
                newTop,
                PADDING
            );

            widget.style.left = snapped.left + "px";

            widget.style.top = snapped.top + "px";

        }

    );

    handle.addEventListener(
        "pointerup",
        () => {

            hideGuideLines();

            isDragging = false;

        }

    );

}