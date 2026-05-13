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

    // ================= HOURLY CONTAINER =================

    const hourlyContainer =
        document.querySelector("#hourly-weather");

    // ================= LOOP FORECAST =================

    for(let i = 0; i < 5; i++) {

        const item =
            data.list[i];

        // ================= TIME =================

        const time =
            item.dt_txt.split(" ")[1];

        // ================= TEMP =================

        const temp =
            Math.round(item.main.temp);

        // ================= HOURLY ICON =================

        const hourlyIcon =
            item.weather[0].icon;

        // ================= ADD HTML =================

        hourlyContainer.innerHTML += `

            <div class="hourly-item">

                <p class="hourly-time">

                    ${time}

                </p>

                <img class="hourly-icon"
                     src="https://openweathermap.org/img/wn/${hourlyIcon}.png">

                <p class="hourly-temp">

                    ${temp}°C

                </p>

            </div>

        `;

    }

});