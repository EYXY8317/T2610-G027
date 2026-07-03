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