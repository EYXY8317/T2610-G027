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