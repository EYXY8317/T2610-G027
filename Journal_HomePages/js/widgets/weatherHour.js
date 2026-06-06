export function createWeatherHourWidget() {

    return `

        <div
            class="widget"
            id="weather-hour-widget"
        >

            <div
                class="drag-handle"
                id="weather-hour-drag-handle"
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
                    Weather Hour
                </span>

            </div>

            <div class="widget-content">

                Hourly Forecast

            </div>

            <div class="resize-handle">

                ↘

            </div>

        </div>

    `;

}