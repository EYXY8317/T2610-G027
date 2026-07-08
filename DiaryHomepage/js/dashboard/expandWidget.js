// 自动把组件"长高"到刚好能装下里面的内容（内容溢出的时候），
// 但要先检查有没有足够的空间可以长高，长完之后还要确认没有跟别的
// 组件重叠——任何一步不满足，就把高度改回去并弹出提示，而不是
// 硬生生地把组件撑大到盖住别的东西。
// Automatically grows a widget's height just enough to fit its content
// (when the content overflows), but first checks there's enough room to
// grow into, and after growing, confirms it doesn't now overlap another
// widget — if either check fails, the height change is reverted and a
// warning is shown, rather than forcibly growing the widget over
// something else.

import { contentOverflow } from "./resizeManager.js";
import { isOverlapping  } from "./overlapManager.js";
import { saveLayout     } from "../home/saveLayout.js";

function showNoSpaceWarning() {
    // 如果已经有一条警告显示着，就不再重复弹出第二条。
    // If a warning is already showing, don't pop up a second one.
    if (document.querySelector(".widget-expand-warning")) return;
    const el = document.createElement("div");
    el.className  = "widget-expand-warning";
    el.textContent = "Not enough space — please adjust widget positions first.";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// Returns whether the widget now fits its content without clipping
// (true if nothing overflowed to begin with, or growing succeeded;
// false if there wasn't room and the height change was reverted).
export function autoExpandWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (!widget) return false;

    // contentOverflow：内容比组件当前高度多出来的像素数；
    // <= 1 时当作"没有溢出"（留 1px 的容差，避免浮点数误差
    // 导致明明没溢出却被判定为溢出）。
    // contentOverflow: how many pixels the content exceeds the widget's
    // current height by; <= 1 is treated as "no overflow" (a 1px
    // tolerance so floating-point rounding doesn't falsely trigger an
    // expand when nothing actually overflows).
    const overflow = contentOverflow(widget);
    if (overflow <= 1) return true;

    const newHeight = widget.offsetHeight + overflow;
    const dashboard = document.getElementById("dashboard");
    const dashH     = dashboard ? dashboard.offsetHeight : window.innerHeight;

    // 长高之后如果会超出仪表盘的可视高度，直接放弃，不做任何改动。
    // If growing would push the widget past the dashboard's visible
    // height, bail out entirely without making any change.
    if (widget.offsetTop + newHeight > dashH) {
        showNoSpaceWarning();
        return false;
    }

    const prevHeight = widget.style.height;
    widget.style.height = newHeight + "px";

    // 长高之后再检查一次有没有跟别的组件重叠——如果重叠了，
    // 就把高度改回长高之前的样子，等于撤销这次自动扩展。
    // After growing, check again whether it now overlaps another widget —
    // if it does, the height is reverted back to what it was before,
    // effectively undoing this auto-expand.
    if (isOverlapping(widget)) {
        widget.style.height = prevHeight;
        showNoSpaceWarning();
        return false;
    }

    saveLayout(widget);
    return true;
}
