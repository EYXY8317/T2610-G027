export function saveLayout(
    widget
) {

    const layout = {

        left:
            widget.style.left,

        top:
            widget.style.top,

        width:
            widget.style.width,

        height:
            widget.style.height

    };

    localStorage.setItem(

        `${widget.id}-layout`,

        JSON.stringify(
            layout
        )

    );

}

export function loadLayout(
    widget
) {

    const savedLayout =
        localStorage.getItem(
            `${widget.id}-layout`
        );

    if (!savedLayout) {
        return;
    }

    const layout =
        JSON.parse(
            savedLayout
        );

    widget.style.left =
        layout.left;

    widget.style.top =
        layout.top;

    widget.style.width =
        layout.width;

    widget.style.height =
        layout.height;

}