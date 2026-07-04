// 把某个组件当前的位置和大小（left/top/width/height）打包成一个对象，
// 存进 localStorage，key 是这个组件的 id 加上 "-layout" 后缀——
// 跟 loadLayout.js 是配对的一对函数，一个存一个读。
// Packages a widget's current position and size (left/top/width/height)
// into an object and saves it to localStorage, keyed by the widget's id
// plus a "-layout" suffix — this pairs with loadLayout.js: one saves,
// the other reads it back.

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
