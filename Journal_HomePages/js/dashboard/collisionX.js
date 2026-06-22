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
