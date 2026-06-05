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