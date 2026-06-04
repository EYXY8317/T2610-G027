export function enableResize(
    widget,
    handle
) {

    let isResizing = false;

    let startX = 0;
    let startY = 0;

    let startWidth = 0;
    let startHeight = 0;

    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 200;

    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 500;

    handle.addEventListener(
        "pointerdown",
        (event) => {

            isResizing = true;

            startX = event.clientX;
            startY = event.clientY;

            startWidth =
                widget.offsetWidth;

            startHeight =
                widget.offsetHeight;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );

    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!isResizing) {
                return;
            }

            const deltaX =
                event.clientX -
                startX;

            const deltaY =
                event.clientY -
                startY;

            let newWidth =
                startWidth +
                deltaX;

            let newHeight =
                startHeight +
                deltaY;

            newWidth =
                Math.max(
                    MIN_WIDTH,
                    Math.min(
                        newWidth,
                        MAX_WIDTH
                    )
                );

            newHeight =
                Math.max(
                    MIN_HEIGHT,
                    Math.min(
                        newHeight,
                        MAX_HEIGHT
                    )
                );

            widget.style.width =
                newWidth + "px";

            widget.style.height =
                newHeight + "px";

        }
    );

    handle.addEventListener(
        "pointerup",
        () => {

            isResizing = false;

        }
    );

}