import {
    computeNewSize
}
from "./resizeUtils.js";

// 每个组件除了原本右下角那个调整大小把手（resize-handle），还会
// 补上 7 个方向的边缘/角落把手（上下左右 + 四个角落，其中东南角
// 由原本的 resize-handle 负责，所以这里只补另外 7 个方向）。
// Besides the original bottom-right resize handle (resize-handle), each
// widget also gets 7 more edge/corner handles added (top/bottom/left/
// right plus four corners — the southeast corner is already handled by
// the original resize-handle, so only the other 7 directions are added
// here).
const EDGE_DIRS = ["n", "s", "e", "w", "ne", "nw", "sw"];

// 给组件加一个方向为 dir 的边缘调整大小把手，绑定它自己的拖动逻辑：
// 按下记录起点尺寸和位置 → 移动时先按方向算出新的宽/高/左/上
// （角落方向会同时改变两个维度）→ 检查是否该吸附到其他组件的边缘/
// 仪表盘中线 → 限制在仪表盘和导航栏范围内 → 如果是在缩小尺寸，
// 还要检查内容会不会被裁切（会的话直接撤销这次缩小）。
// Adds a single-direction edge resize handle to the widget and wires up
// its own drag logic: pointer down records the starting size/position →
// while moving, computes the new width/height/left/top based on the
// direction (corner directions change both dimensions at once) → checks
// whether it should snap to other widgets' edges/the dashboard's center
// line → clamps within the dashboard and navbar bounds → if the widget
// is being shrunk, also checks whether the content would get clipped
// (if so, this particular shrink is reverted).
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
        // 先记住上一次有效的状态，万一这次改动会让内容溢出，可以直接退回去
        const prevW   = widget.offsetWidth;
        const prevH   = widget.offsetHeight;
        const prevL   = parseFloat(widget.style.left) || 0;
        const prevTop = parseFloat(widget.style.top)  || 0;

        let newW = startW, newH = startH, newL = startL, newT = startT;

        // Corners change both axes; edges change only their axis.
        // 角落方向（比如 "ne"）会同时影响宽和高；单纯的边缘方向只影响自己那一个维度。
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
        // 吸附到参考线（其他组件的边缘、仪表盘的正中线）
        const snapped = applyEdgeResizeSnap(widget, newW, newH, newL, newT, dir);
        newW = snapped.width;
        newH = snapped.height;
        newL = snapped.left;
        newT = snapped.top;

        // Clamp to dashboard + navbar bounds
        // 限制在仪表盘和导航栏范围内，不能被拖出边界
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

        // Block resize only when shrinking — growing a card can never push content
        // outside its own boundary, so there is nothing to guard against.
        // Width is always reverted together with height: narrowing width can make
        // text wrap and push content below the bottom edge.
        // 只有在"变小"的时候才需要挡住这次改动——变大的话内容不可能
        // 被挤出组件边界，所以没什么好防的。宽度收窄的话可能让文字
        // 换行、往下挤出底部边界，所以宽度和高度会一起被撤销回去。
        const shrinking = newW < prevW || newH < prevH;
        if (shrinking && contentOverflow(widget) > 1) {
            widget.style.width  = prevW + "px";
            widget.style.height = prevH + "px";
            widget.style.left   = prevL + "px";
            widget.style.top    = prevTop + "px";
        }

        showSizeHud(widget, `${Math.round(widget.offsetWidth)} × ${Math.round(widget.offsetHeight)}`);

        widget.dispatchEvent(new CustomEvent("widgetresize"));
    });

    el.addEventListener("pointerup", () => {
        if (!active) return;
        hideGuideLines();
        hideSizeHud();
        if (isOverlapping(widget)) {
            widget.style.transition = "width 0.3s ease-out, height 0.3s ease-out";
            widget.style.width  = startW + "px";
            widget.style.height = startH + "px";
            widget.style.left   = startL + "px";
            widget.style.top    = startT + "px";
            setTimeout(() => { widget.style.transition = "none"; }, 300);
        }

        const finalW = parseFloat(widget.style.width);
        const finalH = parseFloat(widget.style.height);
        const finalL = parseFloat(widget.style.left);
        const finalT = parseFloat(widget.style.top);
        if (finalW !== startW || finalH !== startH || finalL !== startL || finalT !== startT) {
            const widgetId = widget.id;
            const before = { width: startW + "px", height: startH + "px", left: startL + "px", top: startT + "px" };
            const after  = { width: widget.style.width, height: widget.style.height, left: widget.style.left, top: widget.style.top };
            pushHistory({
                revert() {
                    const el = document.getElementById(widgetId);
                    if (!el) return;
                    Object.assign(el.style, before);
                    saveLayout(el);
                    el.dispatchEvent(new CustomEvent("widgetresize"));
                },
                apply() {
                    const el = document.getElementById(widgetId);
                    if (!el) return;
                    Object.assign(el.style, after);
                    saveLayout(el);
                    el.dispatchEvent(new CustomEvent("widgetresize"));
                }
            });
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
    hideGuideLines,
    showSizeHud,
    hideSizeHud
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
    pushHistory
}
from "../home/historyManager.js";

import {
    getDashboardBounds
}
from "./boundaryManager.js";


// Returns how many extra px the widget needs so no content is clipped.
// 计算这个组件还需要多少额外的像素（宽或高），才能让里面的内容
// 完全不被裁切掉；返回 0 表示当前尺寸已经足够，不需要变大。
export function contentOverflow(widget) {
    // Diary card uses max-width + margin:auto centering; leaf scan gives false positives.
    // Diary 卡片用的是 max-width + margin:auto 居中方式，用下面这种
    // "扫描叶子节点"的方法量测会得出错误的结果，所以直接跳过它。
    if (widget.id === "diary-card-widget") return 0;

    // Quote widget: quote-main uses overflow:hidden + flex:1 + min-height:0,
    // so leaf elements never escape the widget boundary and scrollHeight can
    // report the shrunken rendered size instead of the natural content size.
    // Sum children individually to get the true natural height.
    // Quote 组件比较特殊：它的 quote-main 用了 overflow:hidden +
    // flex:1 + min-height:0，导致里面的元素永远不会真的溢出组件边界，
    // 用 scrollHeight 量出来的只是"被压缩后显示出来的高度"，而不是
    // "内容本来需要的高度"。所以这里改成把每个子元素的高度分别加起来，
    // 才能算出真实需要的高度。
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
        // .quote-main 本来需要的高度：把每个子元素的高度加起来，
        // 再加上子元素之间的间距（gap）
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
    // 通用的兜底方案：递归扫描内容里每一个"叶子元素"（没有子元素的
    // 最底层元素）的实际渲染位置，跟组件本身的边界比较，看它有没有
    // 超出上下左右任何一边。这种方法对 flex-start（内容溢出到下方）、
    // flex-end（溢出到上方）、center（上下对称溢出）都适用，
    // 就算某个 height:100% 的包裹层把溢出从 scrollHeight 上"藏"起来
    // 了，也逃不过这种逐个元素比对的检查。
    const content = widget.querySelector(".widget-content");
    if (!content) return 0;

    const wRect    = widget.getBoundingClientRect();
    let   maxBelow = 0;
    let   maxAbove = 0;
    let   maxRight = 0;
    let   maxLeft  = 0;

    (function scan(el) {
        if (el.children.length === 0) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 || r.height > 0) {
                const below = r.bottom - wRect.bottom;
                const above = wRect.top  - r.top;
                const right = r.right   - wRect.right;
                const left  = wRect.left - r.left;
                if (below > maxBelow) maxBelow = below;
                if (above > maxAbove) maxAbove = above;
                if (right > maxRight) maxRight = right;
                if (left  > maxLeft)  maxLeft  = left;
            }
        } else {
            for (const child of el.children) scan(child);
        }
    })(content);

    // centered layout: symmetric overflow on both axes, sum all sides
    // 居中布局的情况：上下左右两侧都可能同时溢出，所以要把四个方向都加起来
    const total = maxAbove + maxBelow + maxLeft + maxRight;
    return total > 1 ? Math.ceil(total) : 0;
}

// 给组件启用"调整大小"功能：先补上 7 个额外方向的边缘/角落把手
// （只在第一次调用时补，避免重复添加），再给传入的这个原本的
// （通常是右下角）resize-handle 绑定它自己的拖动逻辑，跟
// attachEdgeHandle 里的逻辑基本一样，只是这个把手固定只能同时
// 改变宽和高（没有方向限制）。
// Enables the "resize" feature on a widget: first injects the 7 extra
// edge/corner handles (only on the first call, to avoid adding them
// twice), then wires up the passed-in original (usually bottom-right)
// resize-handle with its own drag logic — largely the same as the logic
// in attachEdgeHandle, except this handle is fixed to always change both
// width and height together (no direction restriction).
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

            // Block resize only when shrinking — growing cannot push content outside
            // the card's own boundary.  Width is reverted together with height because
            // narrowing width can make text wrap and overflow the bottom edge.
            const shrinking = snapped.width < prevW || snapped.height < prevH;
            if (shrinking && contentOverflow(widget) > 1) {
                widget.style.width  = prevW + "px";
                widget.style.height = prevH + "px";
            }

            showSizeHud(widget, `${Math.round(widget.offsetWidth)} × ${Math.round(widget.offsetHeight)}`);

            // Notify scalable widgets to update their font sizes
            // 通知那些字体会自动缩放的组件，该重新计算字号了
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

            const finalW = parseFloat(widget.style.width);
            const finalH = parseFloat(widget.style.height);
            if (finalW !== startWidth || finalH !== startHeight) {
                const widgetId = widget.id;
                const before = { width: startWidth + "px", height: startHeight + "px", left: widget.style.left, top: widget.style.top };
                const after  = { width: widget.style.width,  height: widget.style.height, left: widget.style.left, top: widget.style.top };
                pushHistory({
                    revert() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        Object.assign(el.style, before);
                        saveLayout(el);
                        el.dispatchEvent(new CustomEvent("widgetresize"));
                    },
                    apply() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        Object.assign(el.style, after);
                        saveLayout(el);
                        el.dispatchEvent(new CustomEvent("widgetresize"));
                    }
                });
            }

            hideSizeHud();

            saveLayout(widget);

            isResizing = false;

        }
    );

}

