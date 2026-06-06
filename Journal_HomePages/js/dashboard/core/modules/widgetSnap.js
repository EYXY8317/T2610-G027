import {
    applyCenterSnap
}
from "./centerSnap.js";

import {
    applyGapSnap
}
from "./gapSnap.js";

import {
    applyWidgetCollisionSnap
}
from "../../interaction/collisionManager.js";

export function applySnap(
    widget,
    newLeft,
    newTop
) {

    const centered =
        applyCenterSnap(
            widget,
            newLeft,
            newTop
        );

    const collided =
        applyWidgetCollisionSnap(
            widget,
            centered.left,
            centered.top
        );

    return {

        left:
            applyGapSnap(
                widget,
                collided.left
            ),

        top:
            collided.top

    };

}