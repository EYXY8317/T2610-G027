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

// "Weather Day" 组件：只显示"今天"这一天的详细天气（最高/最低/
// 平均温度可选一个当主要显示、体感温度、湿度、城市名、更新时间等），
// 并且会根据组件当前的实际大小，自动调整字体大小让内容刚好填满
// （既不会太挤溢出，也不会显得太小太空）。
// The "Weather Day" widget: shows detailed weather for just "today"
// (choosing one of high/low/average temperature as the main display,
// plus feels-like temperature, humidity, city name, update time, etc),
// and automatically adjusts its font size to fit the widget's actual
// current size (neither overflowing/too cramped, nor too small and
// empty-looking).

const STATE_KEY = "weather-day-state";

const DEFAULT_STATE = {
    showFeelsLike: true,
    showHumidity: true,
    showIcon: true,
    showUpdateTime: true,
    showCity: true,
    showRange: true,
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
    if (icon)  icon.style.fontSize  = `${Math.round(2.6  * base)}px`;
    const temp  = body.querySelector(".wd-temp");
    if (temp)  temp.style.fontSize  = `${Math.round(2.8  * base)}px`;
    const label = body.querySelector(".wd-temp-label");
    if (label) label.style.fontSize = `${Math.round(0.75 * base)}px`;
    body.querySelectorAll(".wd-range,.wd-feels,.wd-humidity,.wd-city,.wd-update").forEach(el => {
        el.style.fontSize = `${Math.round(0.85 * base)}px`;
    });
}

// 自动缩放算法：先用一个"已知的基准字号"（16px）把内容画一遍，
// 量出这份内容实际需要多宽/多高（scrollWidth/scrollHeight）；
// 再用"组件实际可用的宽高" ÷ "内容需要的宽高" 算出缩放倍数，
// 取宽度缩放和高度缩放中较小的那个（保证两个方向都不会溢出），
// 乘上基准字号，就是最终应该用的字号。
// Auto-scale algorithm: first renders the content at a known baseline
// font size (16px) to measure how much width/height it actually needs
// (scrollWidth/scrollHeight); then divides the widget's actually
// available width/height by that needed width/height to get a scale
// factor, taking whichever of the width-scale or height-scale is smaller
// (so neither direction overflows), and multiplies that by the baseline
// font size to get the final size to use.
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
        body.querySelector(".wd-temp")?.scrollWidth       || 0,
        body.querySelector(".wd-temp-label")?.scrollWidth || 0,
        body.querySelector(".wd-city")?.scrollWidth       || 0,
        body.querySelector(".wd-range")?.scrollWidth      || 0,
        body.querySelector(".wd-feels")?.scrollWidth      || 0,
        body.querySelector(".wd-humidity")?.scrollWidth   || 0,
        body.querySelector(".wd-update")?.scrollWidth     || 0,
        1
    );

    const scaleH = (contentH - 8) / naturalH;
    const scaleW = (widgetW  - 16) / maxNaturalW;
    const base   = Math.max(1, Math.round(DEFAULT_BASE * Math.min(scaleH, scaleW)));

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

        // Secondary temperature: omit whichever value is already shown as the main.
        // 次要温度：如果某个值已经被当作主要显示了，这里就不重复显示它。
        const secondaryParts = [
            state.tempDisplay !== "max" ? `↑ ${toDisplayTemp(tMax, unit)}` : "",
            state.tempDisplay !== "min" ? `↓ ${toDisplayTemp(tMin, unit)}` : ""
        ].filter(Boolean);
        const rangeLine = state.showRange && secondaryParts.length > 0
            ? `<div class="wd-range">${secondaryParts.join(" &nbsp; ")}</div>`
            : "";

        const updateLine = state.showUpdateTime
            ? `<div class="wd-update">Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>`
            : "";

        const cityLine = state.showCity
            ? `<div class="wd-city">📍 ${config.cityName}</div>`
            : "";

        container.innerHTML = `
            <div class="wd-body">
                ${icon}
                <div class="wd-temp">${mainTemp}</div>
                <div class="wd-temp-label">${rangeLabel}</div>
                ${rangeLine}
                ${feelsLine}
                ${humidityLine}
                ${cityLine}
                ${updateLine}
            </div>
        `;

        // 用 requestAnimationFrame 等浏览器先把上面这段 HTML 真正画到
        // 屏幕上，才能量出正确的 offsetWidth/offsetHeight，再执行
        // 自动缩放；同时只在第一次渲染时注册"组件被手动调整大小"的
        // 监听器，避免重复注册。
        // Uses requestAnimationFrame to wait for the browser to actually
        // paint the HTML above before measuring offsetWidth/offsetHeight
        // and running the auto-scale; also only registers the "widget was
        // manually resized" listener on the first render, to avoid
        // registering it more than once.
        requestAnimationFrame(() => {
            const widget = document.getElementById("weather-day-widget");
            applyWeatherDayScale(widget);
            autoExpandWidget("weather-day-widget");

            if (!_wdResizeObserver && widget) {
                _wdResizeObserver = true;
                widget.addEventListener("widgetresize", () => applyWeatherDayScale(widget));
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
