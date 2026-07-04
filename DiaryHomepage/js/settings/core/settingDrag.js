// 让"设置弹窗"（右键点击组件后跳出来的那个面板）可以被自己的
// 标题栏拖动：按下标题栏记录起点，移动时用鼠标移动的距离算出弹窗
// 应该在的新位置，并且限制不能被拖出屏幕（左右完全限制在窗口内，
// 上边不能超出顶部，下边至少要留 minVisibleHeader=50px 的标题栏
// 露在外面，这样弹窗不会"消失"到看不见、抓不回来的地方）。
// Makes the "settings popup" (the panel that appears after right-clicking
// a widget) draggable by its own header: pressing down on the header
// records the starting point, and while moving, the mouse's movement
// distance is used to compute the popup's new position — clamped so it
// can't be dragged off screen (fully constrained left/right within the
// window, can't go above the top, and at least minVisibleHeader=50px of
// the header must stay visible at the bottom, so the popup can never
// disappear somewhere unreachable).

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
