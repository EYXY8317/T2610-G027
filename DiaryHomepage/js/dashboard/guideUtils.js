// 拖动/缩放组件时显示的各种"参考辅助线"和提示框：
// - 竖直/水平吸附参考线（对准仪表盘中心线时显示）
// - "等大参考线"（蓝色，跟别的组件缩放到一样大小时显示）
// - 尺寸/位置提示框（拖动或缩放时跟着鼠标显示当前的像素数值）
// 这些辅助元素本身都是提前写在页面 HTML 里的（id 分别是 snap-line、
// same-size-guide-v 等），这里的函数只是负责控制它们的显示/隐藏和
// 位置，不负责创建它们。
// The various "guide lines" and hint boxes shown while dragging/resizing
// a widget:
// - vertical/horizontal snap guide lines (shown when aligned to the
//   dashboard's center lines)
// - "same-size guide lines" (blue, shown when resized to match another
//   widget's size)
// - a size/position HUD (follows the mouse during drag/resize, showing
//   the current pixel values)
// These guide elements themselves are already written into the page's
// HTML ahead of time (ids like snap-line, same-size-guide-v, etc.) — the
// functions here just control their visibility/position, they don't
// create them.

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
// ── 等大参考线（蓝色） ─────────────────────────────

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
// ── 尺寸 / 位置提示框 ──────────────────────────────────────

export function showSizeHud(widget, text) {
    const hud = document.getElementById("size-hud");
    if (!hud) return;
    hud.textContent = text;
    hud.style.display = "block";
    // 提示框固定显示在组件的左上角上方一点点的位置（往上偏移 26px），
    // 用 Math.max(4, ...) 确保就算组件贴着屏幕边缘，提示框也不会
    // 被裁切到看不见（最少留 4px 的边距）。
    // The HUD is positioned just above the widget's top-left corner
    // (offset 26px upward); Math.max(4, ...) ensures that even if the
    // widget is right at the screen's edge, the HUD doesn't get clipped
    // off-screen (at least a 4px margin is kept).
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
