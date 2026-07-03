console.log(
    "TITLE SIZE LOADED"
);

export function getTitleSizeSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Title Size
            </span>

        </div>

        <div
            class="
            title-size-value
            "
        >

            20px

        </div>

        <div
            class="
            title-size-slider-row
            "
        >

            <span>
                12
            </span>

            <input
                type="range"
                min="12"
                max="40"
                value="20"
                class="
                title-size-slider
                "
            >

            <span>
                40
            </span>

        </div>

    `;

}

export function applyTitleSize(
    widget,
    size
) {

    const title =
        widget.querySelector(
            ".widget-header"
        );

    if (!title) {
        return;
    }

    title.style.fontSize =
        size + "px";

}