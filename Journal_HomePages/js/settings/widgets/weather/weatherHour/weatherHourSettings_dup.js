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
                    data-value="24h"
                >
                    24H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="12h"
                >
                    12H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="6h"
                >
                    6H
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

            <div
                class="setting-row"
            >

                <span>
                    Graph Size
                </span>

                <input
                    class="
                    graph-size-slider
                    "
                    type="range"
                    min="50"
                    max="200"
                    value="100"
                >

                <span
                    class="
                    graph-size-value
                    "
                >
                    100%
                </span>

            </div>

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
