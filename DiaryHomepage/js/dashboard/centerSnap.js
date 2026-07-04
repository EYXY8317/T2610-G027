// 拖动组件时，如果快要对齐仪表盘的水平/垂直中心线，就"吸"过去正好
// 对齐，并显示一条参考线给用户看；离中心线不够近的时候就把参考线
// 隐藏起来。CENTER_SNAP（12px）是判定"够不够近"的容差范围。
// While dragging a widget, if it's close to lining up with the
// dashboard's horizontal/vertical center line, it "snaps" into perfect
// alignment and shows a guide line so the user can see it; when it's not
// close enough, the guide line is hidden. CENTER_SNAP (12px) is the
// tolerance used to decide "close enough".

import {
    showVerticalLine,
    showHorizontalLine,
    hideVerticalLine,
    hideHorizontalLine
} from "./guideUtils.js";

export function applyCenterSnap(
    widget,
    newLeft,
    newTop
) {

    const CENTER_SNAP = 12;

    const dashboard = document.getElementById("dashboard");

    // widget 的"中心点"坐标 = 左上角坐标 + 自身宽/高的一半。
    // The widget's "center point" coordinate = its top-left position plus
    // half its own width/height.
    const widgetCenter = newLeft + widget.offsetWidth / 2;

    const dashboardCenter = dashboard.clientWidth / 2;

    const widgetMiddle = newTop + widget.offsetHeight / 2;

    const dashboardMiddle = dashboard.clientHeight / 2;

    if (Math.abs(widgetCenter - dashboardCenter) < CENTER_SNAP) {

        // 强制把 newLeft 改成"正好让组件中心对准仪表盘中心"的那个值，
        // 而不是保留鼠标拖到的、稍微偏一点的位置。
        // Forces newLeft to the exact value that centers the widget on
        // the dashboard's center, rather than keeping the slightly-off
        // position the mouse actually dragged to.
        newLeft = dashboardCenter - widget.offsetWidth / 2;

        showVerticalLine(dashboardCenter);

    } else {

        hideVerticalLine();

    }

    if (Math.abs(widgetMiddle - dashboardMiddle) < CENTER_SNAP) {

        newTop = dashboardMiddle - widget.offsetHeight / 2;

        showHorizontalLine(dashboardMiddle);

    } else {

        hideHorizontalLine();

    }

    return {
        left: newLeft,
        top: newTop
    };

}
