// 生成"内容文字颜色"这一个设置项的 HTML（一个颜色选择器输入框），
// 以及把选中的颜色实际应用到组件内容区域（.widget-content）上的函数。
// Builds the HTML for the "content text color" setting (a color-picker
// input), plus the function that actually applies the chosen color to
// the widget's content area (.widget-content).

export function getContentColorSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Content Color
            </span>

            <input
                type="color"
                value="#000000"
                class="
                content-color-picker
                "
            >

        </div>

    `;

}

export function applyContentColor(
    widget,
    color
) {

    const content =
        widget.querySelector(
            ".widget-content"
        );

    if (!content) {
        return;
    }

    content.style.color =
        color;

}
