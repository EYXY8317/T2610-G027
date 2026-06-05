export function applyCenterSnap(
    widget,
    newLeft,
    newTop
) {

    const CENTER_SNAP = 12;

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const verticalLine =
        document.getElementById(
            "snap-line"
        );

    const horizontalLine =
        document.getElementById(
            "snap-line-horizontal"
        );

    const dashboardCenter =
        dashboard.clientWidth / 2;

    const dashboardMiddle =
        dashboard.clientHeight / 2;

    const widgetLeft =
        newLeft;

    const widgetRight =
        newLeft +
        widget.offsetWidth;

    const widgetCenter =
        newLeft +
        widget.offsetWidth / 2;

    const widgetTop =
        newTop;

    const widgetBottom =
        newTop +
        widget.offsetHeight;

    const widgetMiddle =
        newTop +
        widget.offsetHeight / 2;

    let showVertical =
        false;

    let showHorizontal =
        false;

    if (
        Math.abs(
            widgetCenter -
            dashboardCenter
        ) < CENTER_SNAP
    ) {

        newLeft =
            dashboardCenter -
            widget.offsetWidth / 2;

        showVertical = true;

    }

    if (
        Math.abs(
            widgetLeft -
            dashboardCenter
        ) < CENTER_SNAP
    ) {

        newLeft =
            dashboardCenter;

        showVertical = true;

    }

    if (
        Math.abs(
            widgetRight -
            dashboardCenter
        ) < CENTER_SNAP
    ) {

        newLeft =
            dashboardCenter -
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