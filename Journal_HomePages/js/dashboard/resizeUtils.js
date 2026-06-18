import { getConstraints } from "./resizeConstraints.js";

// Sums paddingLeft + paddingRight of every ancestor between el and widget (exclusive).
// This gives the fixed structural padding — not centering-based space.
function ancestorHPad(el, widget) {
    let pad = 0;
    let cur = el.parentElement;
    while (cur && cur !== widget) {
        const cs = getComputedStyle(cur);
        pad += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        cur = cur.parentElement;
    }
    return pad;
}

// Returns the minimum widget width so all single-line labels stay unclipped.
// scrollWidth gives natural text width even when overflow:hidden clips visually.
function getTitleMinWidth(widget) {
    let minW = 0;

    // Header title
    const header = widget.querySelector(".widget-header");
    if (header && header.offsetHeight > 0) {
        const span = header.querySelector("span:first-child");
        if (span) minW = Math.max(minW, span.scrollWidth + ancestorHPad(span, widget));
    }

    // Content labels that must not wrap
    for (const sel of [".streak-label", ".wd-temp-label"]) {
        const el = widget.querySelector(sel);
        if (el) minW = Math.max(minW, el.scrollWidth + ancestorHPad(el, widget));
    }

    return minW;
}

// Returns the minimum widget height so the header title is never crushed.
// Drag handle is now position:absolute (out of flow), so only header height counts.
function getHeaderMinHeight(widget) {
    const header = widget.querySelector(".widget-header");
    if (!header || header.offsetHeight === 0) return 0;
    return header.offsetHeight;
}

export function computeNewSize(widget, startWidth, startHeight, deltaX, deltaY) {

    const { minW, minH, maxW, maxH } = getConstraints(widget.id);
    const effectiveMinW = Math.max(minW, getTitleMinWidth(widget));
    const effectiveMinH = Math.max(minH, getHeaderMinHeight(widget));

    const newWidth  = Math.max(effectiveMinW, Math.min(startWidth  + deltaX, maxW));
    const newHeight = Math.max(effectiveMinH, Math.min(startHeight + deltaY, maxH));

    return { width: newWidth, height: newHeight };

}

export default computeNewSize;
