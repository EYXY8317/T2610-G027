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
