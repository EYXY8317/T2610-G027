import {
    computeNewSize
}
from "./resizeUtils.js";

import {
    applyResizeSnap
}
from "./resizeSnap.js";

import {
    isOverlapping
}
from "./overlapManager.js";

import {
    saveLayout
}
from "../home/saveLayout.js";

// Returns how many extra px the widget needs so no content is clipped.
export function contentOverflow(widget) {
    // Quote widget: measure every visible element explicitly
    const quoteMain    = widget.querySelector(".quote-main");
    const quoteActions = widget.querySelector(".quote-actions");
    if (quoteMain && quoteActions) {
        const header    = widget.querySelector(".widget-header");
        const quoteBody = widget.querySelector(".quote-body");
        const headerH   = header ? header.offsetHeight : 0;
        const cs        = quoteBody ? getComputedStyle(quoteBody) : null;
        const pt        = cs ? parseFloat(cs.paddingTop)    : 14;
        const pb        = cs ? parseFloat(cs.paddingBottom) : 14;
        const actCS     = getComputedStyle(quoteActions);
        const actionsH  = quoteActions.scrollHeight + parseFloat(actCS.paddingTop || 0);
        const minNeeded = headerH + pt + quoteMain.scrollHeight + actionsH + pb;
        return Math.max(0, minNeeded - widget.offsetHeight);
    }

    // Weather week: directly compare table natural height vs available space
    const wwTable = widget.querySelector(".ww-table");
    if (wwTable) {
        const header    = widget.querySelector(".widget-header");
        const headerH   = header ? header.offsetHeight : 0;
        const available = widget.offsetHeight - headerH;
        return Math.max(0, wwTable.offsetHeight - available);
    }

    // Generic fallback: check widget-content itself (scrollHeight vs clientHeight)
    const content = widget.querySelector(".widget-content");
    if (!content) return 0;

    const contentOver = content.scrollHeight - content.clientHeight;
    if (contentOver > 1) return contentOver;

    for (const child of content.children) {
        const over = child.scrollHeight - child.clientHeight;
        if (over > 1) return over;
        for (const grandchild of child.children) {
            const over2 = grandchild.scrollHeight - grandchild.clientHeight;
            if (over2 > 1) return over2;
        }
    }
    return 0;
}

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

            // Content-aware floor: expand height if any content is being clipped
            const overflow = contentOverflow(widget);
            if (overflow > 1) {
                widget.style.height = (widget.offsetHeight + overflow) + "px";
            }

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

            saveLayout(widget);

            isResizing = false;

        }
    );

}
