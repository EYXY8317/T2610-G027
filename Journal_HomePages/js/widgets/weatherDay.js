export function createWeatherDayWidget() {

    return `

        <div
            class="widget"
            id="weather-day-widget"
        >

            <div
                class="drag-handle"
                id="weather-day-drag-handle"
            >

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

            </div>

            <div class="widget-header">

                <span>
                    Weather Day
                </span>

                <button
                    class="widget-settings"
                >
                    ⚙
                </button>

            </div>

            <div class="widget-content">

                Daily Forecast

            </div>

            <div class="resize-handle">

                ↘

            </div>

        </div>

    `;

}