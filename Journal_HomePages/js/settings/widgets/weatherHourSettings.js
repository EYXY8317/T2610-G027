import {
    getCityList,
    getWeatherConfig
}
from "../../widgets/weatherConfig.js";

export function getWeatherHourSettings() {

    const config = getWeatherConfig();
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

        <h3>Graph</h3>

        <div class="setting-row">
            <span>Interval</span>
            <div class="segment-button frequency-segment">
                <button class="segment-option active" data-value="1h">1H</button>
                <button class="segment-option" data-value="2h">2H</button>
                <button class="segment-option" data-value="3h">3H</button>
                <button class="segment-option" data-value="4h">4H</button>
                <button class="segment-option" data-value="5h">5H</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Graph Color</span>
            <input class="graph-color-picker" type="color" value="#4A90E2">
        </div>

        <div class="setting-row">
            <span>Graph Size</span>
            <div>
                <input class="graph-size-slider" type="range" min="50" max="150" value="100">
                <span class="graph-size-value">100%</span>
            </div>
        </div>

        <h3>Display</h3>

        <div class="setting-row">
            <span>Temperature Unit</span>
            <div class="segment-button temp-unit-segment">
                <button class="segment-option${config.tempUnit !== "fahrenheit" ? " active" : ""}" data-value="celsius">°C</button>
                <button class="segment-option${config.tempUnit === "fahrenheit" ? " active" : ""}" data-value="fahrenheit">°F</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Icon (tooltip)</span>
            <div class="segment-button show-icon-segment">
                <button class="segment-option active" data-value="true">Show</button>
                <button class="segment-option" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Temperature (tooltip)</span>
            <div class="segment-button show-temperature-segment">
                <button class="segment-option active" data-value="true">Show</button>
                <button class="segment-option" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Humidity</span>
            <div class="segment-button show-humidity-segment">
                <button class="segment-option" data-value="true">Show</button>
                <button class="segment-option active" data-value="false">Hide</button>
            </div>
        </div>

    `;

}
