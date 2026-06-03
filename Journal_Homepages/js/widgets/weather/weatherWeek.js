import {
    getWeatherWeek
}
from "../../services/weatherService.js";

export async function createWeatherWeek() {

    const forecast =
        await getWeatherWeek();

    return `

        <div class="weather-week">

            ${forecast.map(

                (day) => `

                    <div class="weather-week-day">

                        <div>
                            ${day.day}
                        </div>

                        <div>
                            ${day.icon}
                        </div>

                        <div>
                            ${day.temperature}°
                        </div>

                    </div>

                `

            ).join("")}

        </div>

    `;

}