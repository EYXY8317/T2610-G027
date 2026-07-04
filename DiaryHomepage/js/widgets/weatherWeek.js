import {
    getWeatherConfig,
    getWeatherIconEmoji
}
from "./weatherConfig.js";

// "Weather Week" 组件：显示未来 7 天（或用户设置的天数）的每日
// 最高/最低温度和天气图标，数据来自 Open-Meteo 免费天气 API。
// The "Weather Week" widget: shows the daily high/low temperature and
// weather icon for the next 7 days (or however many the user configures),
// using data from the free Open-Meteo weather API.

const STATE_KEY = "weather-week-state";

const DEFAULT_STATE = {
    showDays: 7,
    showIcon: true
};

function toShortTemp(celsius, unit) {
    if (unit === "fahrenheit") return Math.round(celsius * 9 / 5 + 32) + "°";
    return Math.round(celsius) + "°";
}

function getState() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) {
        return { ...DEFAULT_STATE };
    }
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
    catch {
        return { ...DEFAULT_STATE };
    }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(STATE_KEY, JSON.stringify(next));
    return next;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function createWeatherWeekWidget() {

    return `
        <div class="widget" id="weather-week-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Weather Week</span>
            </div>
            <div class="widget-content" id="weather-week-content">
                Loading...
            </div>
            <div class="resize-handle">↘</div>
        </div>
    `;

}

// 向 Open-Meteo API 请求未来 7 天的每日天气数据（天气代码、
// 最高/最低温度、体感温度、湿度）。
// Requests the next 7 days of daily weather data from the Open-Meteo
// API (weather code, high/low temperature, "feels like" temperature,
// humidity).

async function fetchWeekData(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
        `apparent_temperature_max,apparent_temperature_min,` +
        `relative_humidity_2m_max,relative_humidity_2m_min` +
        `&forecast_days=7`;

    const response = await fetch(url);
    return response.json();

}

export async function renderWeatherWeek() {

    const container = document.getElementById("weather-week-content");

    if (!container) {
        return;
    }

    container.innerHTML = `<div class="wd-loading">Loading…</div>`;

    try {

        const config = getWeatherConfig();
        const state = getState();
        const data = await fetchWeekData(config.latitude, config.longitude);
        const unit = config.tempUnit;

        const d = data.daily;
        const days = Math.min(state.showDays, d.time.length);

        // 每一天生成一个"列"：星期几、天气图标（可选）、最高/最低温。
        // Builds one "column" per day: weekday name, weather icon
        // (optional), and high/low temperature.
        const cols = Array.from({ length: days }, (_, i) => {

            const date = new Date(d.time[i]);
            const weekday = WEEKDAYS[date.getDay()];
            const isToday = i === 0;
            const tMax = d.temperature_2m_max[i];
            const tMin = d.temperature_2m_min[i];
            const code = d.weather_code[i];

            const icon = state.showIcon
                ? `<span class="ww-icon">${getWeatherIconEmoji(code)}</span>`
                : "";

            return `
                <div class="ww-col${isToday ? " today" : ""}">
                    <span class="ww-day">${weekday}</span>
                    ${icon}
                    <div class="ww-temps">
                        <span class="ww-max">${toShortTemp(tMax, unit)}</span>
                        <span class="ww-min">${toShortTemp(tMin, unit)}</span>
                    </div>
                </div>
            `;

        }).join("");

        container.innerHTML = `<div class="ww-grid">${cols}</div>`;

    }
    catch (err) {
        container.innerHTML = `<div class="wd-error">Failed to load weather.</div>`;
        console.error("Weather week error:", err);
    }

}

export function getWeatherWeekState() {
    return getState();
}

export function updateWeatherWeekState(partial) {
    const next = saveState(partial);
    renderWeatherWeek();
    return next;
}
