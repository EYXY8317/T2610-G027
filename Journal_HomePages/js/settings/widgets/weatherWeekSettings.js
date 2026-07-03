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
            <h3>Days</h3>
            <div class="setting-row">
                <span>Show Days</span>
                <div class="segment-button ww-days-segment">
                    <button class="segment-option${state.showDays === 3 ? " active" : ""}" data-value="3">3</button>
                    <button class="segment-option${state.showDays === 5 ? " active" : ""}" data-value="5">5</button>
                    <button class="segment-option${state.showDays === 7 ? " active" : ""}" data-value="7">7</button>
                </div>
            </div>
<<<<<<< HEAD
            <h3>Show / Hide</h3>
            <div class="setting-row">
                <span>Weather Icon</span>
                <div class="segment-button ww-icon-segment">
                    <button class="segment-option${state.showIcon ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option${!state.showIcon ? " active" : ""}" data-value="false">Hide</button>
                </div>
=======
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip${state.showIcon ? " active" : ""}" data-statekey="showIcon">Weather Icon</button>
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
            </div>
        `

    };

}
