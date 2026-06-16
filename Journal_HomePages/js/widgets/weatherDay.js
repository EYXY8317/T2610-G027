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

let _wdResizeObserver = null;

function _applyFontSizes(body, base) {
    const icon  = body.querySelector(".wd-icon");
    if (icon)  icon.style.fontSize  = `${Math.max(12, Math.round(2.6  * base))}px`;
    const temp  = body.querySelector(".wd-temp");
    if (temp)  temp.style.fontSize  = `${Math.max(12, Math.round(2.8  * base))}px`;
    const label = body.querySelector(".wd-temp-label");
    if (label) label.style.fontSize = `${Math.max(3, Math.round(0.75 * base))}px`;
    body.querySelectorAll(".wd-range,.wd-feels,.wd-humidity,.wd-city,.wd-update").forEach(el => {
        el.style.fontSize = `${Math.max(3, Math.round(0.85 * base))}px`;
    });
}

function applyWeatherDayScale(widget) {
    if (!widget) return;
    const body = widget.querySelector(".wd-body");
    if (!body) return;

    const headerH  = widget.querySelector(".widget-header")?.offsetHeight ?? 36;
    const contentH = widget.offsetHeight - headerH;
    const widgetW  = widget.offsetWidth;

    // Measure at a known base, then scale to fill available space
    const DEFAULT_BASE = 16;
    _applyFontSizes(body, DEFAULT_BASE);

    const naturalH = body.scrollHeight;
    const maxNaturalW = Math.max(
        body.querySelector(".wd-temp")?.scrollWidth  || 0,
        body.querySelector(".wd-city")?.scrollWidth  || 0,
        body.querySelector(".wd-range")?.scrollWidth || 0,
        body.querySelector(".wd-feels")?.scrollWidth || 0,
        1
    );

    const scaleH = (contentH - 8) / naturalH;
    const scaleW = (widgetW  - 16) / maxNaturalW;
    const base   = Math.max(4, Math.round(DEFAULT_BASE * Math.min(scaleH, scaleW)));

    _applyFontSizes(body, base);
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

        requestAnimationFrame(() => {
            const widget = document.getElementById("weather-day-widget");
            applyWeatherDayScale(widget);
            autoExpandWidget("weather-day-widget");

            if (!_wdResizeObserver && widget) {
                _wdResizeObserver = new ResizeObserver(() => {
                    requestAnimationFrame(() => applyWeatherDayScale(widget));
                });
                _wdResizeObserver.observe(widget);
            }
        });

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
