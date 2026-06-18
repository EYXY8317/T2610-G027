export function enableSettingDrag(
    popup,
    header
) {

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener(
        "mousedown",
        (event) => {

            isDragging = true;

            startX = event.clientX;
            startY = event.clientY;

            const rect =
                popup.getBoundingClientRect();

            offsetX = rect.left;
            offsetY = rect.top;

        }
    );

    document.addEventListener(
        "mousemove",
        (event) => {

            if (!isDragging) {
                return;
            }

            const popupWidth =
                popup.offsetWidth;

            const popupHeight =
                popup.offsetHeight;

            const minVisibleWidth =
                80;

            const minVisibleHeader =
                50;

            let left =
                offsetX +
                (
                    event.clientX -
                    startX
                );

            let top =
                offsetY +
                (
                    event.clientY -
                    startY
                );

            const minLeft = 0;

            const maxLeft =
                window.innerWidth -
                popupWidth;

            const minTop = 0;

            const maxTop =
                window.innerHeight -
                minVisibleHeader;

            left =
                Math.max(
                    minLeft,
                    Math.min(
                        left,
                        maxLeft
                    )
                );

            top =
                Math.max(
                    minTop,
                    Math.min(
                        top,
                        maxTop
                    )
                );

            popup.style.left =
                left + "px";

            popup.style.top =
                top + "px";

        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            isDragging = false;

        }
    );

}