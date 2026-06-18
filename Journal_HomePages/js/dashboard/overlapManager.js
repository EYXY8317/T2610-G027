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