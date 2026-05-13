// ================= CURRENT WEATHER API =================

fetch("/weather")

.then(function(response) {

    return response.json();

})

.then(function(data) {

    console.log(data);

    // ================= TEMPERATURE =================

    const temperature =
        Math.round(data.main.temp);

    // ================= WEATHER =================

    const weather =
        data.weather[0].description;

    // ================= ICON =================

    const icon =
        data.weather[0].icon;

    // ================= LOCATION =================

    const location =
        data.name;

    // ================= UPDATE TEMP =================

    document.querySelector("#weather-temp")
        .textContent =
        temperature + "°C";

    // ================= UPDATE STATUS =================

    document.querySelector("#weather-status")
        .textContent =
        weather;

    // ================= UPDATE LOCATION =================

    document.querySelector("#weather-location")
        .textContent =
        location;

    // ================= UPDATE ICON =================

    document.querySelector("#weather-icon")
        .src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

});


// ================= FORECAST WEATHER API =================

fetch("/weather_forecast")

.then(function(response) {

    return response.json();

})

.then(function(data) {

    console.log(data);

    // ================= TOMORROW WEATHER =================

    const tomorrowContainer =
        document.querySelector("#tomorrow-weather");

    const tomorrow =
        data.list[8];

    const tomorrowTemp =
        Math.round(tomorrow.main.temp);

    const tomorrowWeather =
        tomorrow.weather[0].main;

    const tomorrowIcon =
        tomorrow.weather[0].icon;

    tomorrowContainer.innerHTML = `

        <div class="tomorrow-card">

            <div class="tomorrow-left">

                <img class="tomorrow-icon"
                     src="https://openweathermap.org/img/wn/${tomorrowIcon}@2x.png">

                <div>

                    <h3>

                        Tomorrow

                    </h3>

                    <p>

                        ${tomorrowWeather}

                    </p>

                </div>

            </div>

            <p class="tomorrow-temp">

                ${tomorrowTemp}°C

            </p>

        </div>

    `;

    // ================= WEEKLY WEATHER =================

    const weeklyContainer =
        document.querySelector("#weekly-weather");

    for(let i = 0; i < data.list.length; i += 8) {

        const dayData =
            data.list[i];

        // ================= RAW DATE =================

        const rawDate =
            dayData.dt_txt.split(" ")[0];

        // ================= DATE OBJECT =================

        const dateObject =
            new Date(rawDate);

        // ================= FORMAT DAY =================

        const date =
            dateObject.toLocaleDateString("en-US", {

                weekday: "short"

            });

        // ================= MAX TEMP =================

        const maxTemp =
            Math.round(dayData.main.temp_max);

        // ================= MIN TEMP =================

        const minTemp =
            Math.round(dayData.main.temp_min);

        // ================= ICON =================

        const weeklyIcon =
            dayData.weather[0].icon;

        // ================= ADD HTML =================

        weeklyContainer.innerHTML += `

            <div class="weekly-item">

                <p>

                    ${date}

                </p>

                <img class="weekly-icon"
                     src="https://openweathermap.org/img/wn/${weeklyIcon}.png">

                <div class="weekly-temp">

                    <p class="max-temp">

                        ${maxTemp}°

                    </p>

                    <p class="min-temp">

                        ${minTemp}°

                    </p>

                </div>

            </div>

        `;

    }

    // ================= CHART DATA =================

    const labels = [];

    const temperatures = [];

    for(let i = 0; i < 8; i++) {

        const item =
            data.list[i];

        const time =
            item.dt_txt.split(" ")[1];

        const temp =
            Math.round(item.main.temp);

        labels.push(time);

        temperatures.push(temp);

    }

    // ================= WEATHER CHART =================

    const ctx =
        document.querySelector("#weather-chart");

    new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Temperature",

                data: temperatures,

                borderColor: "#111111",

                backgroundColor: "rgba(255,200,120,0.18)",

                pointBackgroundColor: "#111111",

                pointBorderColor: "#ffffff",

                pointBorderWidth: 3,

                pointRadius: 5,

                borderWidth: 3,

                tension: 0.4,

                fill: true

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    display: false,

                    grid: {

                        display: false

                    },

                    border: {

                        display: false

                    }

                },

                x: {

                    grid: {

                        display: false

                    },

                    border: {

                        display: false

                    },

                    ticks: {

                        color: "gray",

                        font: {

                            size: 14

                        }

                    }

                }

            }

        }

    });

});