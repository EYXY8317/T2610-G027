// "单日天气"组件的设置面板：城市/温度单位（做法跟 weatherHourSettings.js
// 一样），这个组件特有的"主要显示哪个温度"（最高/最低/平均）以及
// 一长串"要不要显示"的开关（副温度、城市名、体感温度、湿度、图标、
// 更新时间）。
// Settings panel for the "Weather Day" widget: city/temperature unit
// (same approach as weatherHourSettings.js), plus this widget's own
// "which temperature to feature" (max/min/avg) and a longer list of
// show/hide toggles (secondary temp, city name, feels-like, humidity,
// icon, update time).

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
            <h3>Main Temperature</h3>
            <div class="setting-row">
                <span>Display</span>
                <div class="segment-button wd-temp-display-segment">
                    <button class="segment-option${state.tempDisplay === "max" ? " active" : ""}" data-value="max">Max</button>
                    <button class="segment-option${state.tempDisplay === "min" ? " active" : ""}" data-value="min">Min</button>
                    <button class="segment-option${state.tempDisplay === "avg" ? " active" : ""}" data-value="avg">Avg</button>
                </div>
            </div>
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip${state.showRange ? " active" : ""}" data-statekey="showRange">Sec. Temp</button>
                <button class="toggle-chip${state.showCity ? " active" : ""}" data-statekey="showCity">City</button>
                <button class="toggle-chip${state.showFeelsLike ? " active" : ""}" data-statekey="showFeelsLike">Feels Like</button>
                <button class="toggle-chip${state.showHumidity ? " active" : ""}" data-statekey="showHumidity">Humidity</button>
                <button class="toggle-chip${state.showIcon ? " active" : ""}" data-statekey="showIcon">Icon</button>
                <button class="toggle-chip${state.showUpdateTime ? " active" : ""}" data-statekey="showUpdateTime">Update Time</button>
            </div>
        `

    };

}
