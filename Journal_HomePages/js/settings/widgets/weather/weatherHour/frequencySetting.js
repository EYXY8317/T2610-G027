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