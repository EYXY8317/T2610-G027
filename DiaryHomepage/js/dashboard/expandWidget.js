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
import { showReminderPopup } from "../shared/reminderPopup.js";

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

// Same "not enough space" modal shown when there's no room to place a new
// widget (see addWidgetPanel.js) — reused wherever a widget can't grow to
// fit content it needs to show.
// 跟"添加组件"面板里空间不够时弹出的提示是同一个弹窗（见
// addWidgetPanel.js）——哪里需要"组件长不大、装不下内容"这个提示，
// 就复用这一份，不用各自再写一份一样的文案。
export function showNoSpaceModal() {
    showReminderPopup({
        title: "Not Enough Space",
        message: "There isn't enough room to place this widget without overlapping. Try moving or resizing existing widgets first.",
        confirmText: "OK"
    });
}

// Returns whether the widget now fits its content without clipping
// (true if nothing overflowed to begin with, or growing succeeded;
// false if there wasn't room and the height change was reverted).
// silent: true 时不弹出"空间不够"的小提示——用于调用方打算自己
// 展示更明确的说明（比如 showNoSpaceModal()），避免同一件事重复提示两次。
// silent: true suppresses the small "not enough space" toast — for
// callers that intend to show their own, more explicit explanation
// (e.g. showNoSpaceModal()) instead, so the user isn't told twice.
export function autoExpandWidget(widgetId, { silent = false } = {}) {
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
        if (!silent) showNoSpaceWarning();
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
        if (!silent) showNoSpaceWarning();
        return false;
    }

    saveLayout(widget);
    return true;
}
