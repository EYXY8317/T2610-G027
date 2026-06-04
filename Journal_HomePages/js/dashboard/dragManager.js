import {
    applyGapSnap
}
from "./gapSnap.js";

export function enableDrag(
    widget,
    handle
) {

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;

    const PADDING = 20;

    const CENTER_SNAP = 12;

    const WIDGET_SNAP = 12;

    handle.addEventListener(
        "pointerdown",
        (event) => {

            isDragging = true;

            startX = event.clientX;

            startY = event.clientY;

            startLeft =
                widget.offsetLeft;

            startTop =
                widget.offsetTop;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );

    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!isDragging) {
                return;
            }

            const deltaX =
                event.clientX - startX;

            const deltaY =
                event.clientY - startY;

            let newLeft =
                startLeft + deltaX;

            let newTop =
                startTop + deltaY;

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

            const maxLeft =
                dashboard.clientWidth -
                widget.offsetWidth -
                PADDING;

            const maxTop =
                dashboard.clientHeight -
                widget.offsetHeight -
                PADDING;

            newLeft =
                Math.max(
                    PADDING,
                    Math.min(
                        newLeft,
                        maxLeft
                    )
                );

            newTop =
                Math.max(
                    PADDING,
                    Math.min(
                        newTop,
                        maxTop
                    )
                );

            const widgetCenter =
                newLeft +
                widget.offsetWidth / 2;

            const dashboardCenter =
                dashboard.clientWidth / 2;

            const widgetMiddle =
                newTop +
                widget.offsetHeight / 2;

            const dashboardMiddle =
                dashboard.clientHeight / 2;

            if (
                Math.abs(
                    widgetCenter -
                    dashboardCenter
                ) < CENTER_SNAP
            ) {

                newLeft =
                    dashboardCenter -
                    widget.offsetWidth / 2;

                verticalLine.style.display =
                    "block";

                verticalLine.style.left =
                    dashboardCenter + "px";

            }

            else {

                verticalLine.style.display =
                    "none";

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

                horizontalLine.style.display =
                    "block";

                horizontalLine.style.top =
                    dashboardMiddle + "px";

            }

            else {

                horizontalLine.style.display =
                    "none";

            }

            const widgets =
                document.querySelectorAll(
                    ".widget"
                );

            widgets.forEach(
                otherWidget => {

                    if (
                        otherWidget === widget
                    ) {
                        return;
                    }

                    const otherTop =
                        otherWidget.offsetTop;

                    const otherLeft =
                        otherWidget.offsetLeft;

                    const otherRight =
                        otherLeft +
                        otherWidget.offsetWidth;

                    const otherBottom =
                        otherTop +
                        otherWidget.offsetHeight;

                    const otherCenter =
                        otherLeft +
                        otherWidget.offsetWidth / 2;

                    const otherMiddle =
                        otherTop +
                        otherWidget.offsetHeight / 2;

                    const currentRight =
                        newLeft +
                        widget.offsetWidth;

                    const currentBottom =
                        newTop +
                        widget.offsetHeight;

                    const currentCenter =
                        newLeft +
                        widget.offsetWidth / 2;

                    const currentMiddle =
                        newTop +
                        widget.offsetHeight / 2;

                    if (
                        Math.abs(
                            newLeft -
                            otherLeft
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherLeft;

                    }

                    if (
                        Math.abs(
                            currentRight -
                            otherRight
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherRight -
                            widget.offsetWidth;

                    }

                    if (
                        Math.abs(
                            currentCenter -
                            otherCenter
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherCenter -
                            widget.offsetWidth / 2;

                    }

                    if (
                        Math.abs(
                            newTop -
                            otherTop
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherTop;

                    }

                    if (
                        Math.abs(
                            currentMiddle -
                            otherMiddle
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherMiddle -
                            widget.offsetHeight / 2;

                    }

                    if (
                        Math.abs(
                            newTop -
                            otherBottom
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherBottom;

                    }

                    if (
                        Math.abs(
                            newTop -
                            (
                                otherBottom + 20
                            )
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherBottom + 20;

                    }

                    if (
                        Math.abs(
                            currentBottom -
                            otherTop
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherTop -
                            widget.offsetHeight;

                    }

                    if (
                        Math.abs(
                            currentBottom -
                            (
                                otherTop - 20
                            )
                        ) < WIDGET_SNAP
                    ) {

                        newTop =
                            otherTop -
                            widget.offsetHeight -
                            20;

                    }

                    if (
                        Math.abs(
                            newLeft -
                            otherRight
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherRight;

                    }

                    if (
                        Math.abs(
                            newLeft -
                            (
                                otherRight + 20
                            )
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherRight + 20;

                    }

                    if (
                        Math.abs(
                            currentRight -
                            otherLeft
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherLeft -
                            widget.offsetWidth;

                    }

                    if (
                        Math.abs(
                            currentRight -
                            (
                                otherLeft - 20
                            )
                        ) < WIDGET_SNAP
                    ) {

                        newLeft =
                            otherLeft -
                            widget.offsetWidth -
                            20;

                    }

                }

            );

            newLeft =
                applyGapSnap(
                    widget,
                    newLeft
                );

            widget.style.left =
                newLeft + "px";

            widget.style.top =
                newTop + "px";

        }

    );

    handle.addEventListener(
        "pointerup",
        () => {

            verticalLine.style.display =
                "none";

            horizontalLine.style.display =
                "none";

            isDragging = false;

        }

    );

}