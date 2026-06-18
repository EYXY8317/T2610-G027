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

        }

    );

    if (
        bestTop !== null
    ) {

        return bestTop;

    }

    return newTop;

}
