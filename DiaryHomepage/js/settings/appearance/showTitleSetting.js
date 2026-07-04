// "是否显示标题栏"这个设置的 HTML，以及真正应用它的函数
// （直接切换 .widget-header 的 display 样式）。
// The HTML for the "show title bar" setting, plus the function that
// actually applies it (toggling .widget-header's display style directly).

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
