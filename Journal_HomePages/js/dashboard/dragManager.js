import {
    computeSnappedPosition
}
from "./position.js";

import {
    hideGuideLines
}
from "./guide.js";

import {
    showSizeHud,
    hideSizeHud
}
from "./guideUtils.js";

import {
    isOverlapping
}
from "./overlapManager.js";

import {
    BOUNDARY_GAP
}
from "./boundaryManager.js";

import {
    saveLayout
}
from "../home/saveLayout.js";

import {
    pushHistory
}
from "../home/historyManager.js";

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

    const PADDING = BOUNDARY_GAP;

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

            showSizeHud(widget, `x: ${Math.round(snapped.left)}  y: ${Math.round(snapped.top)}`);

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

            hideSizeHud();

            const endLeft = parseFloat(widget.style.left);
            const endTop  = parseFloat(widget.style.top);

            if (endLeft !== startLeft || endTop !== startTop) {
                const widgetId = widget.id;
                const bl = startLeft + "px", bt = startTop + "px";
                const al = widget.style.left,  at = widget.style.top;
                pushHistory({
                    revert() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        el.style.left = bl; el.style.top = bt;
                        saveLayout(el);
                    },
                    apply() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        el.style.left = al; el.style.top = at;
                        saveLayout(el);
                    }
                });
            }

            saveLayout(widget);

            isDragging = false;

        }

    );

}
