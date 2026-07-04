// 拖动组件时算出"最终应该落在哪里"的完整流程：先用
// clampWidgetToDashboard 把位置限制在仪表盘范围内，再把限制后的位置
// 交给 applySnap 做进一步的吸附对齐——两步是有先后顺序的：
// 必须先保证组件在合法范围内，才有意义去判断它该不该吸附到
// 别的组件或中心线上。
// The full pipeline for figuring out "where a dragged widget should
// actually end up": first clampWidgetToDashboard restricts the position
// to within the dashboard's bounds, then that restricted position is
// handed to applySnap for further snap-alignment. The order matters —
// the widget must first be confirmed to be within legal bounds before it
// makes sense to check whether it should snap to another widget or a
// center line.

import {
    applySnap
}
from "./widgetSnap.js";

import {
    clampWidgetToDashboard
}
from "./boundary.js";

export function computeSnappedPosition(widget, newLeft, newTop, padding = 20) {

    const clamped =
        clampWidgetToDashboard(
            widget,
            newLeft,
            newTop,
            padding
        );

    const snapped =
        applySnap(
            widget,
            clamped.left,
            clamped.top
        );

    return {

        left: snapped.left,

        top: snapped.top

    };

}
