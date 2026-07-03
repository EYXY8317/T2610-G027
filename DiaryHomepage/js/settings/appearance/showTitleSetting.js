export function getShowTitleSetting() {

    return `

        <div
            class="setting-row"
        >

            <span>
                Title
            </span>

            <div
                class="segment-button"
            >

                <button
                    class="
                    title-segment-option
                    active
                    "
                    data-value="true"
                >
                    Visible
                </button>

                <button
                    class="
                    title-segment-option
                    "
                    data-value="false"
                >
                    Hidden
                </button>

            </div>

        </div>

    `;

}

export function applyShowTitle(
    widget,
    visible
) {

    const title =
        widget.querySelector(
            ".widget-header"
        );

    if (!title) {
        return;
    }

    title.style.display =
        visible
            ? "flex"
            : "none";

}