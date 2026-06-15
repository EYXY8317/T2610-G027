import {
    getCityList,
    getWeatherConfig
}
from "../../widgets/weatherConfig.js";

import {
    getWeatherDayState
}
from "../../widgets/weatherDay.js";

export function getWeatherDaySettings() {

    const config = getWeatherConfig();
    const state = getWeatherDayState();
    const cities = getCityList();

    return {

        style: "",

        location: `
            <h3>City</h3>
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
        `,

        graph: "",

        display: `
            <h3>Temperature</h3>
            <div class="setting-row">
                <span>Display</span>
                <div class="segment-button wd-temp-display-segment">
                    <button class="segment-option${state.tempDisplay === "max" ? " active" : ""}" data-value="max">Max</button>
                    <button class="segment-option${state.tempDisplay === "min" ? " active" : ""}" data-value="min">Min</button>
                    <button class="segment-option${state.tempDisplay === "avg" ? " active" : ""}" data-value="avg">Avg</button>
                </div>
            </div>
            <h3>Show / Hide</h3>
            <div class="setting-row">
                <span>Feels Like</span>
                <div class="segment-button wd-feels-segment">
                    <button class="segment-option${state.showFeelsLike ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option${!state.showFeelsLike ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
            <div class="setting-row">
                <span>Humidity</span>
                <div class="segment-button wd-humidity-segment">
                    <button class="segment-option${state.showHumidity ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option${!state.showHumidity ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
            <div class="setting-row">
                <span>Weather Icon</span>
                <div class="segment-button wd-icon-segment">
                    <button class="segment-option${state.showIcon ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option${!state.showIcon ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
            <div class="setting-row">
                <span>Update Time</span>
                <div class="segment-button wd-update-time-segment">
                    <button class="segment-option${state.showUpdateTime ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option${!state.showUpdateTime ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
        `

    };

}
