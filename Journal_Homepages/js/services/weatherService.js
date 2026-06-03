import {
    getCurrentLocation
}
from "./locationService.js";

function getWeatherInfo(
    weatherCode
) {

    const weatherMap = {

        0: {
            icon: "☀️",
            condition: "Clear Sky"
        },

        1: {
            icon: "🌤️",
            condition: "Mainly Clear"
        },

        2: {
            icon: "⛅",
            condition: "Partly Cloudy"
        },

        3: {
            icon: "☁️",
            condition: "Cloudy"
        },

        61: {
            icon: "🌧️",
            condition: "Rain"
        },

        63: {
            icon: "🌧️",
            condition: "Moderate Rain"
        },

        65: {
            icon: "⛈️",
            condition: "Heavy Rain"
        }

    };

    return (
        weatherMap[weatherCode]
        ||
        {
            icon: "☁️",
            condition: "Unknown"
        }
    );

}

export async function getWeatherDay() {

    const location =
        await getCurrentLocation();

    const response =
        await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code`

        );

    const data =
        await response.json();

    const weatherInfo =
        getWeatherInfo(
            data.current.weather_code
        );

    return {

        icon:
            weatherInfo.icon,

        condition:
            weatherInfo.condition,

        temperature:
            data.current.temperature_2m,

        humidity:
            data.current.relative_humidity_2m,

        feelsLike:
            data.current.apparent_temperature,

        updated:
            "Now"

    };

}

export async function getWeatherWeek() {

    const location =
        await getCurrentLocation();

    const response =
        await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max&timezone=auto`

        );

    const data =
        await response.json();

    return data.daily.time
        .slice(0, 7)
        .map(

            (
                date,
                index
            ) => {

                const weatherInfo =
                    getWeatherInfo(

                        data.daily.weather_code[index]

                    );

                return {

                    day:

                        new Date(date)
                            .toLocaleDateString(

                                "en-US",

                                {
                                    weekday:
                                        "short"
                                }

                            ),

                    icon:
                        weatherInfo.icon,

                    temperature:

                        Math.round(

                            data.daily
                                .temperature_2m_max[index]

                        )

                };

            }

        );

}