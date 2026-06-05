export function applyWidgetCollisionSnap(
    widget,
    newLeft,
    newTop
) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const WIDGET_SNAP = 12;

    let bestLeft =
        null;

    let bestTop =
        null;

    let bestLeftDistance =
        WIDGET_SNAP + 1;

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

            const otherLeft =
                otherWidget.offsetLeft;

            const otherRight =
                otherLeft +
                otherWidget.offsetWidth;

            const otherBottom =
                otherTop +
                otherWidget.offsetHeight;

            const otherCenter =
                otherLeft +
                otherWidget.offsetWidth / 2;

            const otherMiddle =
                otherTop +
                otherWidget.offsetHeight / 2;

            const currentRight =
                newLeft +
                widget.offsetWidth;

            const currentBottom =
                newTop +
                widget.offsetHeight;

            const currentCenter =
                newLeft +
                widget.offsetWidth / 2;

            const currentMiddle =
                newTop +
                widget.offsetHeight / 2;

            function updateX(
                distance,
                targetLeft
            ) {

                if (
                    distance <
                    bestLeftDistance
                ) {

                    bestLeftDistance =
                        distance;

                    bestLeft =
                        targetLeft;

                }

            }

            function updateY(
                distance,
                targetTop
            ) {

                if (
                    distance <
                    bestTopDistance
                ) {

                    bestTopDistance =
                        distance;

                    bestTop =
                        targetTop;

                }

            }

            let distance;

            distance =
                Math.abs(
                    newLeft -
                    otherLeft
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherLeft
                );

            }

            distance =
                Math.abs(
                    currentRight -
                    otherRight
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherRight -
                    widget.offsetWidth
                );

            }

            distance =
                Math.abs(
                    currentCenter -
                    otherCenter
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherCenter -
                    widget.offsetWidth / 2
                );

            }

            distance =
                Math.abs(
                    newLeft -
                    otherRight
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherRight
                );

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
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherRight +
                    20
                );

            }

            distance =
                Math.abs(
                    currentRight -
                    otherLeft
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherLeft -
                    widget.offsetWidth
                );

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
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherLeft -
                    widget.offsetWidth -
                    20
                );

            }

            distance =
                Math.abs(
                    newLeft -
                    otherCenter
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherCenter
                );

            }

            distance =
                Math.abs(
                    currentRight -
                    otherCenter
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateX(
                    distance,
                    otherCenter -
                    widget.offsetWidth
                );

            }

            distance =
                Math.abs(
                    newTop -
                    otherTop
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherTop
                );

            }

            distance =
                Math.abs(
                    currentMiddle -
                    otherMiddle
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherMiddle -
                    widget.offsetHeight / 2
                );

            }

            distance =
                Math.abs(
                    newTop -
                    otherBottom
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherBottom
                );

            }

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
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherBottom +
                    20
                );

            }

            distance =
                Math.abs(
                    currentBottom -
                    otherTop
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherTop -
                    widget.offsetHeight
                );

            }

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
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherTop -
                    widget.offsetHeight -
                    20
                );

            }

            distance =
                Math.abs(
                    newTop -
                    otherMiddle
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherMiddle
                );

            }

            distance =
                Math.abs(
                    currentBottom -
                    otherMiddle
                );

            if (
                distance <
                WIDGET_SNAP
            ) {

                updateY(
                    distance,
                    otherMiddle -
                    widget.offsetHeight
                );

            }

        }

    );

    if (
        bestLeft !== null
    ) {

        newLeft =
            bestLeft;

    }

    if (
        bestTop !== null
    ) {

        newTop =
            bestTop;

    }

    return {

        left: newLeft,

        top: newTop

    };

}