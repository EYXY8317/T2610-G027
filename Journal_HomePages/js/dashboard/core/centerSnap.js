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

    const widgetCenter = newLeft + widget.offsetWidth / 2;

    const dashboardCenter = dashboard.clientWidth / 2;

    const widgetMiddle = newTop + widget.offsetHeight / 2;

    const dashboardMiddle = dashboard.clientHeight / 2;

    if (Math.abs(widgetCenter - dashboardCenter) < CENTER_SNAP) {

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
            widget.offsetWidth;

        showVertical = true;

    }

    if (
        Math.abs(
            widgetMiddle -
            dashboardMiddle
        ) < CENTER_SNAP
    ) {

        newTop =
            dashboardMiddle -
            widget.offsetHeight / 2;

        showHorizontal = true;

    }

    if (
        Math.abs(
            widgetTop -
            dashboardMiddle
        ) < CENTER_SNAP
    ) {

        newTop =
            dashboardMiddle;

        showHorizontal = true;

    }

    if (
        Math.abs(
            widgetBottom -
            dashboardMiddle
        ) < CENTER_SNAP
    ) {

        newTop =
            dashboardMiddle -
            widget.offsetHeight;

        showHorizontal = true;

    }

    verticalLine.style.display =
        showVertical
            ? "block"
            : "none";

    horizontalLine.style.display =
        showHorizontal
            ? "block"
            : "none";

    verticalLine.style.left =
        dashboardCenter + "px";

    horizontalLine.style.top =
        dashboardMiddle + "px";

    return {

        left: newLeft,

        top: newTop

    };

}