// 从 localStorage 里读回这个组件上次保存的位置和大小（left/top/
// width/height），直接应用到组件的行内样式上——如果之前从没保存过
// （savedLayout 是 null），就什么都不做，让组件保持默认的初始位置。
// Reads this widget's previously saved position/size (left/top/width/
// height) back out of localStorage and applies it directly to the
// widget's inline styles — if nothing was ever saved before (savedLayout
// is null), nothing happens, and the widget keeps its default initial
// position.
export function loadLayout(widget) {
    const savedLayout = localStorage.getItem(`${widget.id}-layout`);
    if (!savedLayout) {
        return;
    }

    const layout = JSON.parse(savedLayout);

    widget.style.left = layout.left;
    widget.style.top = layout.top;
    widget.style.width = layout.width;
    widget.style.height = layout.height;
}
