// 跟 collisionX.js 完全对称的"垂直方向吸附"计算，只是把"左右"
// 换成"上下"：顶边对顶边、底边对底边、中线对中线、顶边贴底边、
// 底边贴顶边（加不加 20px 间距的版本都有），以及同样的三方联动
// "配对居中"吸附，只是方向变成垂直。
// The exact vertical-direction counterpart to collisionX.js, just with
// "left/right" swapped for "top/bottom": top-to-top, bottom-to-bottom,
// middle-to-middle, top-touching-bottom, bottom-touching-top (with and
// without a 20px gap), and the same three-way "pair-center" snap, just
// in the vertical direction.

export function computeVerticalSnap(widget, newTop) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const WIDGET_SNAP = 12;

    let bestTop = null;

    let bestTopDistance =
        WIDGET_SNAP + 1;

    widgets.forEach(
        otherWidget => {

            if (
                otherWidget === widget
            ) {
                return;
            }

            const otherTop =
                otherWidget.offsetTop;

            const otherBottom =
                otherTop +
                otherWidget.offsetHeight;

            const otherMiddle =
                otherTop +
                otherWidget.offsetHeight / 2;

            const currentBottom =
                newTop +
                widget.offsetHeight;

            const currentMiddle =
                newTop +
                widget.offsetHeight / 2;

            let distance;

            // Top ↔ Top

            distance =
                Math.abs(
                    newTop -
                    otherTop
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherTop;

            }

            // Bottom ↔ Bottom

            distance =
                Math.abs(
                    currentBottom -
                    otherBottom
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherBottom -
                    widget.offsetHeight;

            }

            // Middle ↔ Middle

            distance =
                Math.abs(
                    currentMiddle -
                    otherMiddle
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherMiddle -
                    widget.offsetHeight / 2;

            }

            // Top ↔ Bottom

            distance =
                Math.abs(
                    newTop -
                    otherBottom
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherBottom;

            }

            // Top ↔ Bottom +20

            distance =
                Math.abs(
                    newTop -
                    (
                        otherBottom +
                        20
                    )
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherBottom +
                    20;

            }

            // Bottom ↔ Top

            distance =
                Math.abs(
                    currentBottom -
                    otherTop
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherTop -
                    widget.offsetHeight;

            }

            // Bottom ↔ Top +20

            distance =
                Math.abs(
                    currentBottom -
                    (
                        otherTop -
                        20
                    )
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherTop -
                    widget.offsetHeight -
                    20;

            }

            // Top ↔ Middle

            distance =
                Math.abs(
                    newTop -
                    otherMiddle
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherMiddle;

            }

            // Bottom ↔ Middle

            distance =
                Math.abs(
                    currentBottom -
                    otherMiddle
                );

            if (
                distance <
                bestTopDistance
            ) {

                bestTopDistance =
                    distance;

                bestTop =
                    otherMiddle -
                    widget.offsetHeight;

            }

            // ── Pair-center snap (vertical) ───────────────────────────────
            // Snap W so that the pair (W, otherWidget) stacked vertically
            // is centred beside a third widget P.
            //
            // ── 垂直方向的三方联动"配对居中"吸附 ───────────────────────────────
            // 让"正在拖的组件 W"和"otherWidget"这一对上下堆叠的组件，
            // 作为一个整体，垂直居中对齐在第三个组件 P 的旁边。

            widgets.forEach(pWidget => {

                if (pWidget === widget || pWidget === otherWidget) return;

                const pMiddleY =
                    pWidget.offsetTop +
                    pWidget.offsetHeight / 2;

                // W ABOVE otherWidget
                const aboveTarget =
                    2 * pMiddleY -
                    otherTop -
                    otherWidget.offsetHeight;

                if (aboveTarget < otherTop) {

                    distance = Math.abs(newTop - aboveTarget);

                    if (distance < bestTopDistance) {
                        bestTopDistance = distance;
                        bestTop = aboveTarget;
                    }

                }

                // W BELOW otherWidget
                const belowTarget =
                    2 * pMiddleY -
                    otherTop -
                    widget.offsetHeight;

                if (belowTarget > otherBottom) {

                    distance = Math.abs(newTop - belowTarget);

                    if (distance < bestTopDistance) {
                        bestTopDistance = distance;
                        bestTop = belowTarget;
                    }

                }

            });

        }

    );

    if (
        bestTop !== null
    ) {

        return bestTop;

    }

    return newTop;

}
