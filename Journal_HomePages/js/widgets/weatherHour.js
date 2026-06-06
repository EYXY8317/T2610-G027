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

            <div
                class="widget-content"
                id="weather-hour-content"
            >

                Loading...

            </div>

            <div class="resize-handle">

                ↘

            </div>

        </div>

    `;

}

export async function getWeatherData() {

    const response =
        await fetch(

            "https://api.open-meteo.com/v1/forecast?latitude=3.03&longitude=101.75&current=temperature_2m,weather_code"

        );

    return await response.json();

}

export async function renderWeatherHour() {

    const container =
        document.getElementById(
            "weather-hour-content"
        );

    if (!container) {
        return;
    }

    const data =
        await getWeatherData();

    const temperature =
        Math.round(
            data.current.temperature_2m
        );

    container.innerHTML = `

        <div>

            ${temperature}°C

        </div>

    `;

}