import {
    computeHorizontalSnap
}
from "../core/modules/collisionX.js";

import {
    computeVerticalSnap
}
from "../core/modules/collisionY.js";

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