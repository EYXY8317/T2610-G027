// 组件之间的"碰撞吸附"：水平方向和垂直方向分别独立计算
// （见 collisionX.js / collisionY.js），最后把两个方向的结果合并成
// 一个 {left, top} 坐标返回。之所以拆成两个独立的文件/函数，是因为
// 水平和垂直方向各自要考虑的"哪些组件在同一水平线/垂直线上"逻辑不同，
// 分开处理更清晰。
// Widget-to-widget "collision snapping": the horizontal and vertical
// directions are computed independently (see collisionX.js /
// collisionY.js), then merged into one {left, top} coordinate at the end.
// This is split into two separate files/functions because the "which
// other widgets are aligned on this axis" logic differs between the
// horizontal and vertical directions — keeping them separate is clearer.

import {
    computeHorizontalSnap
}
from "./collisionX.js";

import {
    computeVerticalSnap
}
from "./collisionY.js";

export function applyWidgetCollisionSnap(
    widget,
    newLeft,
    newTop
) {

    return {

        left:
            computeHorizontalSnap(
                widget,
                newLeft
            ),

        top:
            computeVerticalSnap(
                widget,
                newTop
            )

    };

}
