// 拖动组件时的"水平方向吸附"计算：把正在拖动的组件的候选新左边界
// (newLeft) 拿去跟屏幕上所有其他组件比较，找出各种"对齐关系"里，
// 距离最近（在 WIDGET_SNAP=12px 以内）的一种，然后吸附过去。
// 对齐关系包括：左边对左边、右边对右边、中心对中心、左边对右边
// （紧贴）、左边对右边+20px（留一点间距）、以及"三方联动"的
// pair-center 吸附（详见下面注释）。如果都没有足够近的，
// 就保持原本的 newLeft 不变（不吸附）。
// Horizontal snap calculation while dragging a widget: takes the
// dragged widget's candidate new left edge (newLeft) and compares it
// against every other widget on screen, looking across several kinds of
// "alignment relationships" for whichever is closest (within
// WIDGET_SNAP=12px), then snaps to it. The alignment relationships
// include: left-to-left, right-to-right, center-to-center, left-touching
// -right, left-to-right+20px (leaving a small gap), and a "three-way"
// pair-center snap (see the comment further below). If none is close
// enough, the original newLeft is returned unchanged (no snap).

export function computeHorizontalSnap(widget, newLeft) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const WIDGET_SNAP = 12;

    let bestLeft = null;

    let bestLeftDistance =
        WIDGET_SNAP + 1;

    widgets.forEach(
        otherWidget => {

            if (
                otherWidget === widget
            ) {
                return;
            }

            const otherLeft =
                otherWidget.offsetLeft;

            const otherRight =
                otherLeft +
                otherWidget.offsetWidth;

            const otherCenter =
                otherLeft +
                otherWidget.offsetWidth / 2;

            const currentRight =
                newLeft +
                widget.offsetWidth;

            const currentCenter =
                newLeft +
                widget.offsetWidth / 2;

            let distance;

            // Left ↔ Left
            distance =
                Math.abs(
                    newLeft -
                    otherLeft
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherLeft;

            }

            // Right ↔ Right
            distance =
                Math.abs(
                    currentRight -
                    otherRight
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherRight -
                    widget.offsetWidth;

            }

            // Center ↔ Center
            distance =
                Math.abs(
                    currentCenter -
                    otherCenter
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherCenter -
                    widget.offsetWidth / 2;

            }

            // Left ↔ Right (touching)
            distance =
                Math.abs(
                    newLeft -
                    otherRight
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherRight;

            }

            // Left ↔ Right + 20 (gap)
            distance =
                Math.abs(
                    newLeft -
                    (
                        otherRight +
                        20
                    )
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherRight +
                    20;

            }

            // Right ↔ Left (touching, other side)
            distance =
                Math.abs(
                    currentRight -
                    otherLeft
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherLeft -
                    widget.offsetWidth;

            }

            // Right ↔ Left - 20 (gap, other side)
            distance =
                Math.abs(
                    currentRight -
                    (
                        otherLeft -
                        20
                    )
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherLeft -
                    widget.offsetWidth -
                    20;

            }

            // Left ↔ Center
            distance =
                Math.abs(
                    newLeft -
                    otherCenter
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherCenter;

            }

            // Right ↔ Center
            distance =
                Math.abs(
                    currentRight -
                    otherCenter
                );

            if (
                distance <
                bestLeftDistance
            ) {

                bestLeftDistance =
                    distance;

                bestLeft =
                    otherCenter -
                    widget.offsetWidth;

            }

            // ── Pair-center snap ──────────────────────────────────────────
            // For each third widget P, snap W so that the pair (W, otherWidget)
            // is horizontally centred under/beside P.
            //
            //   W left of other:  targetLeft = 2*Pcx − otherLeft − otherWidth
            //   W right of other: targetLeft = 2*Pcx − otherLeft − widget.width
            //
            // ── 三方联动的"配对居中"吸附 ──────────────────────────────────────────
            // 对屏幕上第三个组件 P 来说：让"正在拖的组件 W"和"otherWidget"
            // 这一对紧挨着的组件，作为一个整体，水平居中对齐在 P 的下方/旁边。
            // 数学上：P 的中心点 x 坐标 = (W的中心 + other的中心) / 2，
            // 反过来解出 W 应该在的目标左边界（targetLeft）。
            widgets.forEach(pWidget => {

                if (pWidget === widget || pWidget === otherWidget) return;

                const pCenterX =
                    pWidget.offsetLeft +
                    pWidget.offsetWidth / 2;

                // W to the LEFT of otherWidget
                const leftTarget =
                    2 * pCenterX -
                    otherLeft -
                    otherWidget.offsetWidth;

                if (leftTarget < otherLeft) {

                    distance = Math.abs(newLeft - leftTarget);

                    if (distance < bestLeftDistance) {
                        bestLeftDistance = distance;
                        bestLeft = leftTarget;
                    }

                }

                // W to the RIGHT of otherWidget
                const rightTarget =
                    2 * pCenterX -
                    otherLeft -
                    widget.offsetWidth;

                if (rightTarget > otherRight) {

                    distance = Math.abs(newLeft - rightTarget);

                    if (distance < bestLeftDistance) {
                        bestLeftDistance = distance;
                        bestLeft = rightTarget;
                    }

                }

            });

        }

    );

    if (
        bestLeft !== null
    ) {

        return bestLeft;

    }

    return newLeft;

}
