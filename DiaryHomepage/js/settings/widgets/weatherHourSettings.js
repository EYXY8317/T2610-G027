// "每小时天气"组件的设置面板：图表颜色/大小、城市选择（从预设城市
// 列表里挑，并且自动判断当前配置的经纬度对应哪个城市该显示"已选中"）、
// 温度单位（摄氏/华氏）、要显示哪些信息（湿度/图标/温度）。
// Settings panel for the "Weather Hour" widget: graph color/size, city
// selection (picked from a preset city list, automatically figuring out
// which city matches the current configured lat/lon so it shows as
// "selected"), temperature unit (Celsius/Fahrenheit), which info to show
// (humidity/icon/temperature).

import {
    getCityList,
    getWeatherConfig
}
from "../../widgets/weatherConfig.js";

import {
    showWeatherIcon,
    showWeatherTemperature,
    showHumidity
}
from "../../widgets/weatherHour.js";

export function getWeatherHourSettings() {

    const config = getWeatherConfig();
    const cities = getCityList();

    return {

        style: `
            <h3>Graph Style</h3>
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
        `,

        location: `
            <h3>City</h3>
            <div class="setting-row">
                <span>City</span>
                <select class="weather-city-select">
                    ${cities.map(c =>
                        // Math.abs(...) < 0.1：经纬度是浮点数，直接用 ==
                        // 比较可能因为极小的精度误差而永远不相等，所以用
                        // "差值小于 0.1"这种近似相等的判断方式，来找出
                        // 当前配置对应的是列表里哪一个城市。
                        // Math.abs(...) < 0.1: lat/lon are floating-point
                        // numbers, so comparing with == could fail to
                        // match due to tiny precision errors — an
                        // "approximately equal" check (difference under
                        // 0.1) is used instead to find which city in the
                        // list matches the current config.
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
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip wh-humidity-chip${showHumidity ? " active" : ""}">Humidity</button>
                <button class="toggle-chip wh-icon-chip${showWeatherIcon ? " active" : ""}">Icon</button>
                <button class="toggle-chip wh-temp-chip${showWeatherTemperature ? " active" : ""}">Temperature</button>
            </div>
        `

    };

}
