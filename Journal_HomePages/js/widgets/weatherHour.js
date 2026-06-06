export let weatherFrequency =
    "24h";

export let showWeatherIcon =
    true;

export let showWeatherTemperature =
    true;

export let graphColor =
    "#4A90E2";

export let graphSize =
    100;

export function setGraphSize(
    value
) {

    graphSize =
        value;

}

export function setWeatherFrequency(
    value
) {

    weatherFrequency =
        value;

}

export function setShowWeatherIcon(
    value
) {

    showWeatherIcon =
        value;

}

export function setShowWeatherTemperature(
    value
) {

    showWeatherTemperature =
        value;

}

export function setGraphColor(
    value
) {

    graphColor =
        value;

}

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
                style="
                    height:220px;
                "
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

            "https://api.open-meteo.com/v1/forecast?latitude=3.03&longitude=101.75&hourly=temperature_2m,weather_code"

        );

    return await response.json();

}

function getWeatherIcon(
    code
) {

    if (
        code === 0
    ) {
        return "☀️";
    }

    if (
        code <= 3
    ) {
        return "⛅";
    }

    if (
        code <= 48
    ) {
        return "☁️";
    }

    if (
        code <= 67
    ) {
        return "🌧️";
    }

    return "🌩️";

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

    let temperatures;

    let weatherCodes;

    if (
        weatherFrequency ===
        "24h"
    ) {

        temperatures =
            data.hourly.temperature_2m
                .slice(
                    0,
                    24
                );

        weatherCodes =
            data.hourly.weather_code
                .slice(
                    0,
                    24
                );

    }

    else if (
        weatherFrequency ===
        "12h"
    ) {

        temperatures =
            data.hourly.temperature_2m
                .filter(
                    (
                        value,
                        index
                    ) =>
                        index % 2 === 0
                )
                .slice(
                    0,
                    12
                );

        weatherCodes =
            data.hourly.weather_code
                .filter(
                    (
                        value,
                        index
                    ) =>
                        index % 2 === 0
                )
                .slice(
                    0,
                    12
                );

    }

    else {

        temperatures =
            data.hourly.temperature_2m
                .filter(
                    (
                        value,
                        index
                    ) =>
                        index % 4 === 0
                )
                .slice(
                    0,
                    6
                );

        weatherCodes =
            data.hourly.weather_code
                .filter(
                    (
                        value,
                        index
                    ) =>
                        index % 4 === 0
                )
                .slice(
                    0,
                    6
                );

    }

    const times =
        data.hourly.time
            .slice(
                0,
                temperatures.length
            );

    const labels =
        times.map(
            time => {

                const date =
                    new Date(
                        time
                    );

                return date
                    .toLocaleTimeString(
                        [],
                        {

                            hour:
                                "numeric",

                            minute:
                                "2-digit"

                        }
                    );

            }
        );

    container.innerHTML = `

        <canvas
            id="weather-hour-chart"
        ></canvas>

    `;

    const widget =
        document.getElementById(
            "weather-hour-widget"
        );

    const widgetWidth =
        widget.offsetWidth;

    const fontSize =
        Math.max(
            10,
            Math.floor(
                (
                    widgetWidth *
                    graphSize
                ) / 3500
            )
        );

    const lineWidth =
        Math.max(
            2,
            Math.floor(
                widgetWidth / 180
            )
        );

    const chartCanvas =
        document.getElementById(
            "weather-hour-chart"
        );

    new Chart(

        chartCanvas,

        {

            type: "line",

            data: {

                labels:
                    labels,

                datasets: [

                    {

                        label:
                            "Temperature",

                        data:
                            temperatures,

                        borderColor:
                            graphColor,

                        borderWidth:
                            lineWidth,

                        tension:
                            0.3
                    }

                ]

            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                plugins: {

                    tooltip: {

                        titleFont: {

                            size:
                                fontSize

                        },

                        bodyFont: {

                            size:
                                fontSize

                        },

                        callbacks: {

                            label:
                                context => {

                                    const index =
                                        context.dataIndex;

                                    let text =
                                        "";

                                    if (
                                        showWeatherIcon
                                    ) {

                                        text +=
                                            getWeatherIcon(
                                                weatherCodes[
                                                    index
                                                ]
                                            );

                                    }

                                    if (
                                        showWeatherTemperature
                                    ) {

                                        text +=
                                            " " +
                                            temperatures[
                                                index
                                            ] +
                                            "°C";

                                    }

                                    return text;

                                }

                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {

                            font: {

                                size:
                                    fontSize

                            }

                        },

                        grid: {

                            display:
                                false

                        }

                    },

                    y: {
                        ticks: {

                            font: {

                                size:
                                    fontSize

                            }

                        },

                        grid: {

                            display:
                                false

                        }

                    }

                }

            }

        }

    );

}