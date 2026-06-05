import {
    computeHorizontalSnap
}
from "./core/collisionX.js";

import {
    computeVerticalSnap
}
from "./core/collisionY.js";

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