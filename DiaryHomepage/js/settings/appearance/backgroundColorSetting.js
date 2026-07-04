// 背景颜色设置：defaultValue 是"设置项定义"元数据（供通用设置系统
// 使用），getBackgroundColorSetting() 生成设置面板里显示的 HTML，
// applyBackgroundColor() 是真正把颜色应用到组件上的函数。
// Background color setting: the exported object's fields are "setting
// definition" metadata (used by the generic settings system),
// getBackgroundColorSetting() builds the HTML shown in the settings
// panel, and applyBackgroundColor() actually applies the color to the
// widget.

export const backgroundColorSetting = {

    id: "background-color",

    label: "Background Color",

    defaultValue: "#ffffff"

};

export function getBackgroundColorSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Background Color
            </span>

            <input
                type="color"
                value="#ffffff"
                class="
                background-color-picker
                "
            >

        </div>

    `;

}

export function applyBackgroundColor(
    widget,
    color
) {

    widget.style.background =
        color;

}
