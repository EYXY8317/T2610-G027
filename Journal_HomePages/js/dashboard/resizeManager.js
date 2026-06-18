import {
    computeNewSize
}
from "./resizeUtils.js";

const EDGE_DIRS = ["n", "s", "e", "w", "ne", "nw", "sw"];

function attachEdgeHandle(widget, dir) {
    const el = document.createElement("div");
    el.className = `resize-${dir}`;
    widget.appendChild(el);

    let active = false;
    let startX, startY, startW, startH, startL, startT;

    el.addEventListener("pointerdown", e => {
        e.stopPropagation();
        active = true;
        widget.style.transition = "none";
        startX = e.clientX;
        startY = e.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        startL = parseFloat(widget.style.left) || 0;
        startT = parseFloat(widget.style.top)  || 0;
        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", e => {
        if (!active) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Capture last valid state so we can revert if content would overflow
        const prevW   = widget.offsetWidth;
        const prevH   = widget.offsetHeight;
        const prevL   = parseFloat(widget.style.left) || 0;
        const prevTop = parseFloat(widget.style.top)  || 0;

        let newW = startW, newH = startH, newL = startL, newT = startT;

        // Corners change both axes; edges change only their axis.
        if (dir.includes("e")) newW = computeNewSize(widget, startW, startH,  dx, 0).width;
        if (dir.includes("w")) {
            newW = computeNewSize(widget, startW, startH, -dx, 0).width;
            newL = startL + (startW - newW);
        }
        if (dir.includes("s")) newH = computeNewSize(widget, startW, startH, 0,  dy).height;
        if (dir.includes("n")) {
            newH = computeNewSize(widget, startW, startH, 0, -dy).height;
            newT = startT + (startH - newH);
        }

        // Snap to guides (other widgets, dashboard centre)
        const snapped = applyEdgeResizeSnap(widget, newW, newH, newL, newT, dir);
        newW = snapped.width;
        newH = snapped.height;
        newL = snapped.left;
        newT = snapped.top;

        // Clamp to dashboard + navbar bounds
        const bounds = getDashboardBounds();
        if (dir.includes("w") && newL < bounds.minLeft) {
            newL = bounds.minLeft;
            newW = startL + startW - newL;
        }
        if (dir.includes("e") && newL + newW > bounds.maxRight) {
            newW = bounds.maxRight - newL;
        }
        if (dir.includes("n") && newT < bounds.minTop) {
            newT = bounds.minTop;
            newH = startT + startH - newT;
        }
        if (dir.includes("s") && newT + newH > bounds.maxBottom) {
            newH = bounds.maxBottom - newT;
        }

        widget.style.width  = newW + "px";
        widget.style.height = newH + "px";
        widget.style.left   = newL + "px";
        widget.style.top    = newT + "px";

        // Block resize if content would overflow — revert entire frame to last valid state.
        // Width is reverted too: narrowing width can make text wrap and overflow the height.
        if (contentOverflow(widget) > 1) {
            widget.style.width  = prevW + "px";
            widget.style.height = prevH + "px";
            widget.style.left   = prevL + "px";
            widget.style.top    = prevTop + "px";
        }

        widget.dispatchEvent(new CustomEvent("widgetresize"));
    });

    el.addEventListener("pointerup", () => {
        if (!active) return;
        hideGuideLines();
        if (isOverlapping(widget)) {
            widget.style.transition = "width 0.3s ease-out, height 0.3s ease-out";
            widget.style.width  = startW + "px";
            widget.style.height = startH + "px";
            widget.style.left   = startL + "px";
            widget.style.top    = startT + "px";
            setTimeout(() => { widget.style.transition = "none"; }, 300);
        }
        saveLayout(widget);
        active = false;
    });
}

import {
    applyResizeSnap,
    applyEdgeResizeSnap
}
from "./resizeSnap.js";

import {
    hideGuideLines
}
from "./guideUtils.js";

import {
    isOverlapping
}
from "./overlapManager.js";

import {
    saveLayout
}
from "../home/saveLayout.js";

import {
    getDashboardBounds
}
from "./boundaryManager.js";


// Returns how many extra px the widget needs so no content is clipped.
export function contentOverflow(widget) {
    // Quote widget: quote-main uses overflow:hidden + flex:1 + min-height:0,
    // so leaf elements never escape the widget boundary and scrollHeight can
    // report the shrunken rendered size instead of the natural content size.
    // Sum children individually to get the true natural height.
    const quoteMain    = widget.querySelector(".quote-main");
    const quoteActions = widget.querySelector(".quote-actions");
    if (quoteMain && quoteActions) {
        const header    = widget.querySelector(".widget-header");
        const quoteBody = widget.querySelector(".quote-body");
        const headerH   = header ? header.offsetHeight : 0;
        const bodyCS    = quoteBody ? getComputedStyle(quoteBody) : null;
        const pt        = bodyCS ? parseFloat(bodyCS.paddingTop)    : 0;
        const pb        = bodyCS ? parseFloat(bodyCS.paddingBottom) : 0;

        // Natural height of .quote-main: sum each child + gap between them
        const mainCS = getComputedStyle(quoteMain);
        const gap    = parseFloat(mainCS.gap) || parseFloat(mainCS.rowGap) || 0;
        let mainH = 0, childCount = 0;
        for (const child of quoteMain.children) {
            const h = child.scrollHeight;
            if (h > 0) { mainH += h; childCount++; }
        }
        if (childCount > 1) mainH += gap * (childCount - 1);

        const actionsH  = quoteActions.scrollHeight;
        const minNeeded = headerH + pt + mainH + actionsH + pb;
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

    // Inject edge + corner handles once per widget
    if (!widget.querySelector(".resize-n")) {
        EDGE_DIRS.forEach(dir => attachEdgeHandle(widget, dir));
    }

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

            const { maxRight, maxBottom } = getDashboardBounds();
            snapped.width  = Math.min(snapped.width,  maxRight  - (parseFloat(widget.style.left) || 0));
            snapped.height = Math.min(snapped.height, maxBottom - (parseFloat(widget.style.top)  || 0));

            const prevW = widget.offsetWidth;
            const prevH = widget.offsetHeight;

            widget.style.width  = snapped.width  + "px";
            widget.style.height = snapped.height + "px";

            // Block resize if content would overflow — revert entire frame (both axes).
            // Narrowing width can make text wrap and overflow the height, so revert width too.
            if (contentOverflow(widget) > 1) {
                widget.style.width  = prevW + "px";
                widget.style.height = prevH + "px";
            }

            // Notify scalable widgets to update their font sizes
            widget.dispatchEvent(new CustomEvent("widgetresize"));

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

