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
    // Quote widget: quote-main uses overflow:hidden internally, so leaf elements
    // never escape the widget boundary — getBoundingClientRect can't detect the clip.
    // Must measure by summing natural heights explicitly.
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

    // Universal fallback: scan every leaf element's bounding rect vs the widget boundary.
    // Works for flex-start (overflow below), flex-end (above), and center (symmetric above+below),
    // regardless of whether a height:100% wrapper hides the overflow from scrollHeight.
    const content = widget.querySelector(".widget-content");
    if (!content) return 0;

    const wRect    = widget.getBoundingClientRect();
    let   maxBelow = 0;
    let   maxAbove = 0;

    (function scan(el) {
        if (el.children.length === 0) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 || r.height > 0) {
                const below = r.bottom - wRect.bottom;
                const above = wRect.top  - r.top;
                if (below > maxBelow) maxBelow = below;
                if (above > maxAbove) maxAbove = above;
            }
        } else {
            for (const child of el.children) scan(child);
        }
    })(content);

    // centered layout: clipping is symmetric so total needed = above + below
    // top/bottom-aligned layout: one side is 0, total = the overflowing side
    const total = maxAbove + maxBelow;
    return total > 1 ? Math.ceil(total) : 0;
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
