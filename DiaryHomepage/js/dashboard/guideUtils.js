export function showVerticalLine(x) {
    const verticalLine = document.getElementById("snap-line");
    verticalLine.style.display = "block";
    verticalLine.style.left = x + "px";
}

export function showHorizontalLine(y) {
    const horizontalLine = document.getElementById("snap-line-horizontal");
    horizontalLine.style.display = "block";
    horizontalLine.style.top = y + "px";
}

export function hideVerticalLine() {
    const verticalLine = document.getElementById("snap-line");
    verticalLine.style.display = "none";
}

export function hideHorizontalLine() {
    const horizontalLine = document.getElementById("snap-line-horizontal");
    horizontalLine.style.display = "none";
}

export function hideGuideLines() {
    hideVerticalLine();
    hideHorizontalLine();
    const gapGuide = document.getElementById("gap-guide");
    if (gapGuide) gapGuide.style.display = "none";
    hideSameSizeGuides();
}

// ── Same-size guide lines (blue) ─────────────────────────────

export function showSameSizeGuideV(x) {
    const el = document.getElementById("same-size-guide-v");
    if (!el) return;
    el.style.display = "block";
    el.style.left = x + "px";
}

export function showSameSizeGuideH(y) {
    const el = document.getElementById("same-size-guide-h");
    if (!el) return;
    el.style.display = "block";
    el.style.top = y + "px";
}

export function hideSameSizeGuides() {
    const v = document.getElementById("same-size-guide-v");
    const h = document.getElementById("same-size-guide-h");
    if (v) v.style.display = "none";
    if (h) h.style.display = "none";
}

// ── Size / position HUD ──────────────────────────────────────

export function showSizeHud(widget, text) {
    const hud = document.getElementById("size-hud");
    if (!hud) return;
    hud.textContent = text;
    hud.style.display = "block";
    const r = widget.getBoundingClientRect();
    hud.style.left = Math.max(4, r.left) + "px";
    hud.style.top  = Math.max(4, r.top - 26) + "px";
}

export function hideSizeHud() {
    const hud = document.getElementById("size-hud");
    if (hud) hud.style.display = "none";
}

export default {
    showVerticalLine,
    showHorizontalLine,
    hideGuideLines
};
