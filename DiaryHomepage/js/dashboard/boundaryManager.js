// 限制组件不能被拖出仪表盘的可视范围（不能拖到导航栏底下，
// 也不能拖出屏幕左右/下边缘）。
// Keeps widgets from being dragged outside the dashboard's visible area
// (can't be dragged under the navbar, and can't be dragged past the
// screen's left/right/bottom edges).

export const BOUNDARY_GAP = 20;

function getNavbarHeight() {
    const nav = document.querySelector('.navbar');
    return nav ? nav.offsetHeight : 0;
}

export function getDashboardBounds(padding = BOUNDARY_GAP) {
    // 可拖动范围的上边界要留出导航栏的高度，避免组件被拖到
    // 导航栏后面藏起来、点不到也拖不出来。
    // The draggable area's top boundary leaves room for the navbar's
    // height, preventing a widget from being dragged behind the navbar
    // where it would be hidden and impossible to click or drag back out.
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

    // Math.max(min, Math.min(value, max))：经典的"钳制"（clamp）写法——
    // 先用 Math.min 保证不超过上限，再用 Math.max 保证不低于下限，
    // 两层包一起就能把 value 限制在 [min, max] 这个区间内。
    // maxRight/maxBottom 还要再减去组件自身的宽/高，因为限制的是
    // "组件左上角能到达的最远位置"，而不是组件右下角的位置。
    // Math.max(min, Math.min(value, max)): the classic "clamp" pattern —
    // Math.min first caps the value at the upper bound, then Math.max
    // floors it at the lower bound, together constraining value to the
    // [min, max] range. maxRight/maxBottom also subtract the widget's own
    // width/height, since what's being bounded is "how far the widget's
    // top-left corner can go", not its bottom-right corner.

    return {

        left: Math.max(minLeft, Math.min(newLeft, maxRight  - widget.offsetWidth)),

        top:  Math.max(minTop,  Math.min(newTop,  maxBottom - widget.offsetHeight))

    };

}
