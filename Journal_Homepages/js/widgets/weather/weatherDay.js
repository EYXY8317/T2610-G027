import {
    getWeatherDay
}
from "../../services/weatherService.js";

export async function createWeatherDay() {

    const weather =
        await getWeatherDay();

    return `

        <div class="weather-day">

            <div class="weather-icon">
                ${weather.icon}
            </div>

            <div class="weather-temperature">
                ${weather.temperature}°C
            </div>

            <div class="weather-condition">
                ${weather.condition}
            </div>

            <div class="weather-details">

                <div class="weather-feels-like">
                    Feels Like ${weather.feelsLike}°C
                </div>

                <div class="weather-humidity">
                    Humidity ${weather.humidity}%
                </div>

                <div class="weather-updated">
                    Updated ${weather.updated}
                </div>

            </div>

        </div>

    `;

}