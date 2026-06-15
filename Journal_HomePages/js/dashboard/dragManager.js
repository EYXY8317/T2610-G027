import {
    computeSnappedPosition
}
from "./position.js";

import {
    hideGuideLines
}
from "./guide.js";

import {
    isOverlapping
}
from "./overlapManager.js";

import {
    saveLayout
}
from "../home/saveLayout.js";

let currentZIndex = 1;

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

            widget.style.transition =
                "none";

            startX = event.clientX;

            startY = event.clientY;

            currentZIndex++;

            widget.style.zIndex =
                currentZIndex;

            console.log(
                widget.id,
                widget.style.zIndex
            );

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

            if (
                isOverlapping(
                    widget
                )
            ) {

                widget.style.transition =
                    "left 0.3s ease-out, top 0.3s ease-out";

                widget.style.left =
                    startLeft + "px";

                widget.style.top =
                    startTop + "px";

                setTimeout(
                    () => {

                        widget.style.transition =
                            "none";

                    },
                    300
                );

            }

            hideGuideLines();

            saveLayout(widget);

            isDragging = false;

        }

    );

}
