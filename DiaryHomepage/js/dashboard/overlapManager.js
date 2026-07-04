// 检查某个组件跟页面上其他任何组件是不是"重叠"了——用的是经典的
// 矩形碰撞检测（AABB, Axis-Aligned Bounding Box）算法：
// 两个矩形"不重叠"，当且仅当其中一个矩形完全在另一个的左边/右边/
// 上边/下边。反过来，只要这四种"不重叠"的情况都不成立，就说明
// 两个矩形重叠了。下面的判断条件正是这四个"重叠所需成立的条件"
// （每一个条件对应排除掉一种"不重叠"的情况）同时满足。
// Checks whether a widget overlaps with any other widget on the page —
// using the classic rectangle collision test (AABB, Axis-Aligned
// Bounding Box): two rectangles do NOT overlap exactly when one is
// entirely to the left/right/above/below the other. Conversely, the two
// rectangles overlap only when none of those four "non-overlapping"
// cases hold. The condition below is exactly those four "must be true
// for overlap" checks (each one rules out one of the four
// "non-overlapping" cases) all combined together.

export function isOverlapping(
    widget
) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const left =
        widget.offsetLeft;

    const top =
        widget.offsetTop;

    const right =
        left +
        widget.offsetWidth;

    const bottom =
        top +
        widget.offsetHeight;

    for (
        const otherWidget
        of widgets
    ) {

        if (
            otherWidget === widget
        ) {
            continue;
        }

        const otherLeft =
            otherWidget.offsetLeft;

        const otherTop =
            otherWidget.offsetTop;

        const otherRight =
            otherLeft +
            otherWidget.offsetWidth;

        const otherBottom =
            otherTop +
            otherWidget.offsetHeight;

        // left < otherRight：本组件的左边界，在对方右边界的左边
        //   （排除"本组件整个在对方右边"的情况）
        // right > otherLeft：本组件的右边界，在对方左边界的右边
        //   （排除"本组件整个在对方左边"的情况）
        // top < otherBottom / bottom > otherTop：同理，分别排除
        //   "本组件整个在对方上边/下边"的情况
        // 四个条件都成立，才代表两个矩形确实有重叠的部分。
        const overlap =

            left <
            otherRight &&

            right >
            otherLeft &&

            top <
            otherBottom &&

            bottom >
            otherTop;

        if (
            overlap
        ) {
            return true;
        }

    }

    return false;

}
