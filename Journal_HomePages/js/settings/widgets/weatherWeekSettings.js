import {
    getCityList,
    getWeatherConfig
}
from "../../widgets/weatherConfig.js";

import {
    getWeatherWeekState
}
from "../../widgets/weatherWeek.js";

export function getWeatherWeekSettings() {

    const config = getWeatherConfig();
    const state = getWeatherWeekState();
    const cities = getCityList();

    return `

        <h3>Location</h3>

        <div class="setting-row">
            <span>City</span>
            <select class="weather-city-select">
                ${cities.map(c =>
                    `<option value="${c.lat},${c.lon}"${
                        Math.abs(c.lat - config.latitude) < 0.1 &&
                        Math.abs(c.lon - config.longitude) < 0.1
                            ? " selected"
                            : ""
                    }>${c.name}</option>`
                ).join("")}
            </select>
        </div>

        <h3>Temperature</h3>

        <div class="setting-row">
            <span>Unit</span>
            <div class="segment-button temp-unit-segment">
                <button class="segment-option${config.tempUnit !== "fahrenheit" ? " active" : ""}" data-value="celsius">°C</button>
                <button class="segment-option${config.tempUnit === "fahrenheit" ? " active" : ""}" data-value="fahrenheit">°F</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Display</span>
            <div class="segment-button ww-temp-display-segment">
                <button class="segment-option${state.tempDisplay === "max" ? " active" : ""}" data-value="max">Max</button>
                <button class="segment-option${state.tempDisplay === "min" ? " active" : ""}" data-value="min">Min</button>
                <button class="segment-option${state.tempDisplay === "avg" ? " active" : ""}" data-value="avg">Avg</button>
            </div>
        </div>

        <h3>Show / Hide</h3>

        <div class="setting-row">
            <span>Days</span>
            <div class="segment-button ww-days-segment">
                <button class="segment-option${state.showDays === 3 ? " active" : ""}" data-value="3">3</button>
                <button class="segment-option${state.showDays === 5 ? " active" : ""}" data-value="5">5</button>
                <button class="segment-option${state.showDays === 7 ? " active" : ""}" data-value="7">7</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Weather Icon</span>
            <div class="segment-button ww-icon-segment">
                <button class="segment-option${state.showIcon ? " active" : ""}" data-value="true">Show</button>
                <button class="segment-option${!state.showIcon ? " active" : ""}" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Feels Like</span>
            <div class="segment-button ww-feels-segment">
                <button class="segment-option${state.showFeelsLike ? " active" : ""}" data-value="true">Show</button>
                <button class="segment-option${!state.showFeelsLike ? " active" : ""}" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Humidity</span>
            <div class="segment-button ww-humidity-segment">
                <button class="segment-option${state.showHumidity ? " active" : ""}" data-value="true">Show</button>
                <button class="segment-option${!state.showHumidity ? " active" : ""}" data-value="false">Hide</button>
            </div>
        </div>

    `;

}
