import {
    getWeatherConfig,
    toDisplayTemp,
    getWeatherIconEmoji
}
from "./weatherConfig.js";

import {
    autoExpandWidget
}
from "../dashboard/expandWidget.js";

const STATE_KEY = "weather-week-state";

const DEFAULT_STATE = {
    showDays: 7,          // 3 | 5 | 7
    showFeelsLike: false,
    showHumidity: false,
    showIcon: true,
    tempDisplay: "max"    // "max" | "min" | "avg"
};

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

        const rows = Array.from({ length: days }, (_, i) => {

            const date = new Date(d.time[i]);
            const weekday = WEEKDAYS[date.getDay()];
            const isToday = i === 0;

            const tMax = d.temperature_2m_max[i];
            const tMin = d.temperature_2m_min[i];
            const tAvg = (tMax + tMin) / 2;
            const feelsMax = d.apparent_temperature_max[i];
            const feelsMin = d.apparent_temperature_min[i];
            const humidity = Math.round(
                (d.relative_humidity_2m_max[i] + d.relative_humidity_2m_min[i]) / 2
            );
            const code = d.weather_code[i];

            const mainTemp =
                state.tempDisplay === "min" ? toDisplayTemp(tMin, unit)
                : state.tempDisplay === "avg" ? toDisplayTemp(tAvg, unit)
                : toDisplayTemp(tMax, unit);

            const icon = state.showIcon
                ? `<span class="ww-icon">${getWeatherIconEmoji(code)}</span>`
                : "";

            const feels = state.showFeelsLike
                ? `<span class="ww-extra">↕${toDisplayTemp(feelsMax, unit)}</span>`
                : "";

            const hum = state.showHumidity
                ? `<span class="ww-extra">💧${humidity}%</span>`
                : "";

            return `
                <div class="ww-row${isToday ? " today" : ""}">
                    <span class="ww-day">${isToday ? "Today" : weekday}</span>
                    ${icon}
                    <span class="ww-range">↑${toDisplayTemp(tMax, unit)} ↓${toDisplayTemp(tMin, unit)}</span>
                    <span class="ww-main">${mainTemp}</span>
                    ${feels}
                    ${hum}
                </div>
            `;

        }).join("");

        container.innerHTML = `<div class="ww-table">${rows}</div>`;

        // After render: expand if content overflows, warn if no space available
        requestAnimationFrame(() => autoExpandWidget("weather-week-widget"));

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
