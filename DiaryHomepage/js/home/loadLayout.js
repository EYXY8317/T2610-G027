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
