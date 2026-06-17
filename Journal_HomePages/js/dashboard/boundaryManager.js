export const BOUNDARY_GAP = 20;

function getNavbarHeight() {
    const nav = document.querySelector('.navbar');
    return nav ? nav.offsetHeight : 0;
}

export function getDashboardBounds(padding = BOUNDARY_GAP) {
    const dashboard = document.getElementById("dashboard");
    const navH = getNavbarHeight();
    return {
        minLeft:   padding,
        minTop:    navH + padding,
        maxRight:  dashboard.clientWidth  - padding,
        maxBottom: dashboard.clientHeight - padding
    };
}

export function clampWidgetToDashboard(
    widget,
    newLeft,
    newTop,
    padding = BOUNDARY_GAP
) {

    const { minLeft, minTop, maxRight, maxBottom } = getDashboardBounds(padding);

    return {

        left: Math.max(minLeft, Math.min(newLeft, maxRight  - widget.offsetWidth)),

        top:  Math.max(minTop,  Math.min(newTop,  maxBottom - widget.offsetHeight))

    };

}