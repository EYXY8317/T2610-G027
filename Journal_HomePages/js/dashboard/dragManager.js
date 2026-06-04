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
                event.clientX -
                startX;

            const deltaY =
                event.clientY -
                startY;

            let newLeft =
                startLeft +
                deltaX;

            let newTop =
                startTop +
                deltaY;

            const dashboard =
                document.getElementById(
                    "dashboard"
                );

            const snapLine =
                document.getElementById(
                    "snap-line"
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

            if (
                Math.abs(
                    widgetCenter -
                    dashboardCenter
                ) < 15
            ) {

                newLeft =
                    dashboardCenter -
                    widget.offsetWidth / 2;

                snapLine.style.display =
                    "block";

                snapLine.style.left =
                    dashboardCenter +
                    "px";

            }

            else {

                snapLine.style.display =
                    "none";

            }

            widget.style.left =
                newLeft + "px";

            widget.style.top =
                newTop + "px";

        }
    );

    handle.addEventListener(
        "pointerup",
        () => {

            const snapLine =
                document.getElementById(
                    "snap-line"
                );

            snapLine.style.display =
                "none";

            isDragging = false;

        }
    );

}