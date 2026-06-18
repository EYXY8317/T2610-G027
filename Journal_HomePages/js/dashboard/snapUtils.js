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
