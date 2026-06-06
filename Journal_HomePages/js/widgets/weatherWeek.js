export function createWeatherWeekWidget() {

    return `

        <div
            class="widget"
            id="weather-week-widget"
        >

            <div
                class="drag-handle"
            >

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>

            </div>

            <div class="widget-header">

                Weather Week

            </div>

            <div
                class="widget-content"
                id="weather-week-content"
            >

                Loading...

            </div>

            <div
                class="resize-handle"
            >

                ↘

            </div>

        </div>

    `;

}

export async function getWeatherWeekData() {

    const response =
        await fetch(

            "https://api.open-meteo.com/v1/forecast?latitude=3.03&longitude=101.75&daily=weather_code,temperature_2m_max"

        );

    return await response.json();

}

export async function renderWeatherWeek() {

    const container =
        document.getElementById(
            "weather-week-content"
        );

    if (!container) {
        return;
    }

    const data =
        await getWeatherWeekData();

    const temperatures =
        data.daily.temperature_2m_max;

    container.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                gap:10px;
            "
        >

            ${temperatures
                .slice(0,7)
                .map(
                    temperature =>

                        `
                        <div>

                            ${temperature}°

                        </div>
                        `
                )
                .join("")
            }

        </div>

    `;

}