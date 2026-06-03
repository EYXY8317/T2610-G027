import {
    getWeatherHour
}
from "../../services/weatherService.js";

export async function renderWeatherHourChart() {

    const hours =
        await getWeatherHour();

    const canvas =
        document.getElementById(
            "weatherHourChart"
        );

    new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels:

                    hours.map(

                        hour =>
                            hour.time

                    ),

                datasets: [

                    {

                        data:

                            hours.map(

                                hour =>
                                    hour.temperature

                            ),

                        tension: 0.45,

                        borderWidth: 3,

                        pointRadius: 0,

                        pointHoverRadius: 8,

                        pointHitRadius: 30

                    }

                ]

            },

            options: {

                interaction: {

                    intersect: false,

                    mode: "index"

                },

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        displayColors: false,

                        callbacks: {

                            title:

                                function(
                                    context
                                ) {

                                    const hour =
                                        hours[
                                            context[0]
                                                .dataIndex
                                        ];

                                    return hour.time;

                                },

                            label:

                                function() {

                                    return "";

                                },

                            afterLabel:

                                function(
                                    context
                                ) {

                                    const hour =
                                        hours[
                                            context
                                                .dataIndex
                                        ];

                                    return [

                                        `${hour.icon} ${hour.condition}`,

                                        `${hour.temperature}°C`

                                    ];

                                }

                        }

                    }

                },

                scales: {

                    x: {

                        grid: {

                            display: false

                        },

                        border: {

                            display: true

                        },

                        ticks: {

                            maxTicksLimit: 8

                        }

                    },

                    y: {

                        display: true,

                        grid: {

                            display: false

                        },

                        border: {

                            display: true

                        }

                    }

                }

            }

        }

    );

}