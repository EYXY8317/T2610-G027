import {
    getWeatherConfig,
    toDisplayTemp,
    getWeatherIconEmoji
}
from "./weatherConfig.js";

const STATE_KEY = "weather-day-state";

const DEFAULT_STATE = {
    showFeelsLike: true,
    showHumidity: true,
    showIcon: true,
    showUpdateTime: true,
    tempDisplay: "max"   // "max" | "min" | "avg"
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

export function createWeatherDayWidget() {

    return `
        <div class="widget" id="weather-day-widget">
            <div class="drag-handle" id="weather-day-drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Weather Day</span>
            </div>
            <div class="widget-content" id="weather-day-content">
                Loading...
            </div>
            <div class="resize-handle">↘</div>
        </div>
    `;

}

async function fetchDayData(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
        `apparent_temperature_max,apparent_temperature_min,` +
        `relative_humidity_2m_max,relative_humidity_2m_min` +
        `&forecast_days=1`;

    const response = await fetch(url);
    return response.json();

}

export async function renderWeatherDay() {

    const container = document.getElementById("weather-day-content");

    if (!container) {
        return;
    }

    container.innerHTML = `<div class="wd-loading">Loading…</div>`;

    try {

        const config = getWeatherConfig();
        const state = getState();
        const data = await fetchDayData(config.latitude, config.longitude);

        const d = data.daily;
        const unit = config.tempUnit;

        const tMax = d.temperature_2m_max[0];
        const tMin = d.temperature_2m_min[0];
        const tAvg = (tMax + tMin) / 2;
        const feelsMax = d.apparent_temperature_max[0];
        const feelsMin = d.apparent_temperature_min[0];
        const humidity = Math.round(
            (d.relative_humidity_2m_max[0] + d.relative_humidity_2m_min[0]) / 2
        );
        const code = d.weather_code[0];

        const mainTemp =
            state.tempDisplay === "min" ? toDisplayTemp(tMin, unit)
            : state.tempDisplay === "avg" ? toDisplayTemp(tAvg, unit)
            : toDisplayTemp(tMax, unit);

        const icon = state.showIcon
            ? `<div class="wd-icon">${getWeatherIconEmoji(code)}</div>`
            : "";

        const rangeLabel =
            state.tempDisplay === "min" ? "Min"
            : state.tempDisplay === "avg" ? "Avg"
            : "Max";

        const feelsLine = state.showFeelsLike
            ? `<div class="wd-feels">Feels ${toDisplayTemp(feelsMax, unit)} / ${toDisplayTemp(feelsMin, unit)}</div>`
            : "";

        const humidityLine = state.showHumidity
            ? `<div class="wd-humidity">💧 ${humidity}%</div>`
            : "";

        const rangeLine = `
            <div class="wd-range">
                ↑ ${toDisplayTemp(tMax, unit)} &nbsp; ↓ ${toDisplayTemp(tMin, unit)}
            </div>
        `;

        const updateLine = state.showUpdateTime
            ? `<div class="wd-update">Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>`
            : "";

        const cityLine = `<div class="wd-city">${config.cityName}</div>`;

        container.innerHTML = `
            <div class="wd-body">
                ${icon}
                <div class="wd-temp">${mainTemp}</div>
                <div class="wd-temp-label">${rangeLabel} Temperature</div>
                ${rangeLine}
                ${feelsLine}
                ${humidityLine}
                ${cityLine}
                ${updateLine}
            </div>
        `;

    }
    catch (err) {
        container.innerHTML = `<div class="wd-error">Failed to load weather.</div>`;
        console.error("Weather day error:", err);
    }

}

export function getWeatherDayState() {
    return getState();
}

export function updateWeatherDayState(partial) {
    const next = saveState(partial);
    renderWeatherDay();
    return next;
}
