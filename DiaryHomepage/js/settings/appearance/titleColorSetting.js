// 跟 contentColorSetting.js 是同一套结构，只是控制的是组件标题栏
// （.widget-header）的文字颜色，而不是内容区域的。
// Same structure as contentColorSetting.js, just controlling the widget's
// title bar (.widget-header) text color instead of its content area.

export function getTitleColorSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Title Color
            </span>

            <input
                type="color"
                value="#000000"
                class="
                title-color-picker
                "
            >

        </div>

    `;

}

export function applyTitleColor(
    widget,
    color
) {

    const title =
        widget.querySelector(
            ".widget-header"
        );

    if (!title) {
        return;
    }

    title.style.color =
        color;

}
