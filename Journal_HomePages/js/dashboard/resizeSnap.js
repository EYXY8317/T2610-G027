export function applyResizeSnap(
    widget,
    width,
    height
) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const SNAP = 12;

    const GAP = 20;

    const widgetLeft =
        widget.offsetLeft;

    const widgetTop =
        widget.offsetTop;

    let newWidth =
        width;

    let newHeight =
        height;

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

            const otherTop =
                otherWidget.offsetTop;

            const otherBottom =
                otherTop +
                otherWidget.offsetHeight;

            const currentRight =
                widgetLeft +
                newWidth;

            const currentBottom =
                widgetTop +
                newHeight;

            // Right ↔ Left

            if (
                Math.abs(
                    currentRight -
                    otherLeft
                ) < SNAP
            ) {

                newWidth =
                    otherLeft -
                    widgetLeft;

            }

            // Right ↔ Left + 20

            if (
                Math.abs(
                    currentRight -
                    (
                        otherLeft -
                        GAP
                    )
                ) < SNAP
            ) {

                newWidth =
                    otherLeft -
                    GAP -
                    widgetLeft;

            }

            // Right ↔ Right

            if (
                Math.abs(
                    currentRight -
                    otherRight
                ) < SNAP
            ) {

                newWidth =
                    otherRight -
                    widgetLeft;

            }

            // Bottom ↔ Top

            if (
                Math.abs(
                    currentBottom -
                    otherTop
                ) < SNAP
            ) {

                newHeight =
                    otherTop -
                    widgetTop;

            }

            // Bottom ↔ Top + 20

            if (
                Math.abs(
                    currentBottom -
                    (
                        otherTop -
                        GAP
                    )
                ) < SNAP
            ) {

                newHeight =
                    otherTop -
                    GAP -
                    widgetTop;

            }

            // Bottom ↔ Bottom

            if (
                Math.abs(
                    currentBottom -
                    otherBottom
                ) < SNAP
            ) {

                newHeight =
                    otherBottom -
                    widgetTop;

            }

        }

    );

    return {

        width:
            newWidth,

        height:
            newHeight

    };

}
