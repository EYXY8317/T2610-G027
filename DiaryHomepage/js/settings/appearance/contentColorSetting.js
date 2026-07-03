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