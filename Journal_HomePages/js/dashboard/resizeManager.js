import {
    computeNewSize
}
from "./core/resizeUtils.js";

export function enableResize(
    widget,
    handle
) {

    let isResizing = false;

    let startX = 0;
    let startY = 0;

    let startWidth = 0;
    let startHeight = 0;

    handle.addEventListener(
        "pointerdown",
        (event) => {

            isResizing = true;

            startX = event.clientX;
            startY = event.clientY;

            startWidth =
                widget.offsetWidth;

            startHeight =
                widget.offsetHeight;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );

    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!isResizing) {
                return;
            }

            const deltaX = event.clientX - startX;

            const deltaY = event.clientY - startY;

            const size = computeNewSize(
                widget,
                startWidth,
                startHeight,
                deltaX,
                deltaY
            );

            widget.style.width = size.width + "px";

            widget.style.height = size.height + "px";

        }
    );

    handle.addEventListener(
        "pointerup",
        () => {

            isResizing = false;

        }
    );

}