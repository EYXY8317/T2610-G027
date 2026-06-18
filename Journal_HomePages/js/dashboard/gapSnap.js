export function applyGapSnap(

    widget,
    newLeft

) {

    const widgets =
        [...document.querySelectorAll(
            ".widget"
        )];

    if (
        widgets.length !== 3
    ) {
        return newLeft;
    }

    const sortedWidgets =
        widgets
            .sort(

                (a, b) =>

                    a.offsetLeft -
                    b.offsetLeft

            );

    const leftWidget =
        sortedWidgets[0];

    const middleWidget =
        sortedWidgets[1];

    const rightWidget =
        sortedWidgets[2];

    if (
        widget !== middleWidget
    ) {
        return newLeft;
    }

    const leftCenter =

        leftWidget.offsetLeft +

        leftWidget.offsetWidth / 2;

    const rightCenter =

        rightWidget.offsetLeft +

        rightWidget.offsetWidth / 2;

    const targetCenter =

        (
            leftCenter +
            rightCenter
        ) / 2;

    const currentCenter =

        newLeft +

        widget.offsetWidth / 2;

    const SNAP_DISTANCE = 20;

    if (

        Math.abs(

            currentCenter -
            targetCenter

        ) < SNAP_DISTANCE

    ) {

        newLeft =

            targetCenter -

            widget.offsetWidth / 2;

    }

    return newLeft;

}
