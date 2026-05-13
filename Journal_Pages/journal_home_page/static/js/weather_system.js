// ================= WEATHER API =================

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