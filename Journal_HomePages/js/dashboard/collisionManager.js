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
