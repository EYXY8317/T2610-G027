import {
    computeNewSize
}
from "../core/modules/resizeUtils.js";

import {
    applyResizeSnap
}
from "../core/modules/resizeSnap.js";

import {
    isOverlapping
}
from "./overlapManager.js";

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

            widget.style.transition =
                "none";

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

            const deltaX =
                event.clientX - startX;

            const deltaY =
                event.clientY - startY;

            const size =
                computeNewSize(
                    widget,
                    startWidth,
                    startHeight,
                    deltaX,
                    deltaY
                );

            const snapped =
                applyResizeSnap(
                    widget,
                    size.width,
                    size.height
                );

            widget.style.width =
                snapped.width + "px";

            widget.style.height =
                snapped.height + "px";

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
                    "width 0.3s ease-out, height 0.3s ease-out";

                widget.style.width =
                    startWidth + "px";

                widget.style.height =
                    startHeight + "px";

                setTimeout(
                    () => {

                        widget.style.transition =
                            "none";

                    },
                    300
                );

            }

            isResizing = false;

        }
    );

}