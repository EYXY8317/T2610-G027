export function clampWidgetToDashboard(
    widget,
    newLeft,
    newTop,
    padding = 20
) {

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    const maxLeft =
        dashboard.clientWidth -
        widget.offsetWidth -
        padding;

    const maxTop =
        dashboard.clientHeight -
        widget.offsetHeight -
        padding;

    return {

        left:
            Math.max(
                padding,
                Math.min(
                    newLeft,
                    maxLeft
                )
            ),

        top:
            Math.max(
                padding,
                Math.min(
                    newTop,
                    maxTop
                )

        )

    };

}