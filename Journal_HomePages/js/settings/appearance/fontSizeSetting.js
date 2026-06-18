export function getFontSizeSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Content Size
            </span>

            <button
                class="
                apply-all-button
                "
            >
                All
            </button>

        </div>

        <div
            class="
            content-size-value
            "
        >

            18px

        </div>

        <div
            class="
            content-size-slider-row
            "
        >

            <span>
                12
            </span>

            <input
                type="range"
                min="12"
                max="32"
                value="18"
                class="
                content-size-slider
                "
            >

            <span>
                32
            </span>

        </div>

    `;

}

export function applyFontSize(
    widget,
    size
) {

    const content =
        widget.querySelector(
            ".widget-content"
        );

    if (!content) {
        return;
    }

    content.style.fontSize =
        size + "px";

}