// 注意：这个文件里的函数名是 getWeatherHourSettings，跟 Weather Hour
// 组件真正在用的 weatherHourSettings.js 内容重复（同样的"频率/显示
// 图标/显示温度/图表颜色"设置项）。经过搜索确认，本文件（
// frequencySetting.js）在项目里没有任何地方 import 或引用它，
// 属于已经不再使用的遗留/重复文件。
// Note: this file's function is named getWeatherHourSettings, and
// duplicates the content that the Weather Hour widget actually uses from
// weatherHourSettings.js (the same Frequency/Show Icon/Show
// Temperature/Graph Color settings). Confirmed via search that this file
// (frequencySetting.js) isn't imported or referenced anywhere in the
// project — it's leftover/duplicate dead code no longer in use.

export function getWeatherHourSettings() {

    return `

        <h3>
            Graph
        </h3>

        <div
            class="setting-row"
        >

            <span>
                Frequency
            </span>

            <div
                class="
                segment-button
                frequency-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="1h"
                >
                    1H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="2h"
                >
                    2H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="3h"
                >
                    3H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="5h"
                >
                    5H
                </button>

            </div>

        </div>

        <div
            class="setting-row"
        >

            <span>
                Show Icon
            </span>

            <div
                class="
                segment-button
                show-icon-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="true"
                >
                    Show
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="false"
                >
                    Hide
                </button>

            </div>

        </div>

        <div
            class="setting-row"
        >

            <span>
                Show Temperature
            </span>

            <div
                class="
                segment-button
                show-temperature-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="true"
                >
                    Show
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="false"
                >
                    Hide
                </button>

            </div>

        </div>

        <div
            class="setting-row"
        >

            <span>
                Graph Color
            </span>

            <input
                class="
                graph-color-picker
                "
                type="color"
                value="#4A90E2"
            >

        </div>

    `;

}
