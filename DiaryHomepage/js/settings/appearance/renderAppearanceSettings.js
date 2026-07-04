// 注意：这个函数目前看起来没有被真正使用（appearanceSettings.js 里
// 已经有了功能更完整的 getStyleTabHTML()/getAppearanceSectionsHTML()，
// 这份看起来是早期的、更简单的版本，只有一个写死的"标题显示/隐藏"
// 切换按钮，选中状态也是写死在 HTML 里的（active class 永远在
// "Visible"上），并没有根据实际设置值动态判断）。
// Note: this function doesn't appear to be actually used anywhere —
// appearanceSettings.js already has the more complete
// getStyleTabHTML()/getAppearanceSectionsHTML(); this looks like an
// earlier, simpler version with just one hardcoded "title visible/hidden"
// toggle, whose selected state is also hardcoded in the HTML (the active
// class is always on "Visible") rather than reflecting the real current
// setting.

export function renderAppearanceSettings() {

    return `

        <div
            class="setting-section"
        >

            <h3>
                Style
            </h3>

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
                        segment-option
                        active
                        "
                    >
                        Visible
                    </button>

                    <button
                        class="
                        segment-option
                        "
                    >
                        Hidden
                    </button>

                </div>

            </div>

        </div>

    `;

}
