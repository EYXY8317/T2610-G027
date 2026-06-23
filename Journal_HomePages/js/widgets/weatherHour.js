import {
    getWeatherConfig,
    toDisplayTemp,
    getWeatherIconEmoji
}
from "./weatherConfig.js";

export let weatherFrequency = "1h";
export let showWeatherIcon = true;
export let showWeatherTemperature = true;
export let showHumidity = false;
export let graphColor = "#4A90E2";
export let graphSize = 100;
export let chartFontSize = 11;

export function setGraphSize(value) { graphSize = value; }
export function setWeatherFrequency(value) { weatherFrequency = value; }
export function setShowWeatherIcon(value) { showWeatherIcon = value; }
export function setShowWeatherTemperature(value) { showWeatherTemperature = value; }
export function setShowHumidity(value) { showHumidity = value; }
export function setGraphColor(value) { graphColor = value; }
export function setChartFontSize(value) { chartFontSize = Number(value); }

function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.length === 3 ? h[0]+h[0] : h.slice(0,2), 16);
    const g = parseInt(h.length === 3 ? h[1]+h[1] : h.slice(2,4), 16);
    const b = parseInt(h.length === 3 ? h[2]+h[2] : h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export function createWeatherHourWidget() {

    return `
        <div class="widget" id="weather-hour-widget">
            <div class="drag-handle" id="weather-hour-drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Weather Hours</span>
            </div>
            <div class="widget-content" id="weather-hour-content">
                Loading...
            </div>
            <div class="resize-handle">↘</div>
        </div>
    `;

}

async function fetchWeatherHourData(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
        `&forecast_days=2`;

    const response = await fetch(url);
    return response.json();

}

function getIntervalStep(freq) {
    const map = { "1h": 1, "2h": 2, "3h": 3, "4h": 4, "5h": 5 };
    return map[freq] || 1;
}

export async function renderWeatherHour() {

    const container = document.getElementById("weather-hour-content");

    if (!container) {
        return;
    }

    container.innerHTML = `<div style="padding:16px;color:#9ca3af;font-size:14px;">Loading…</div>`;

    try {

        const config = getWeatherConfig();
        const data = await fetchWeatherHourData(config.latitude, config.longitude);

        const now = new Date();
        const currentHour = now.getHours();

        const allTemps = data.hourly.temperature_2m;
        const allHumidity = data.hourly.relative_humidity_2m;
        const allFeelsLike = data.hourly.apparent_temperature;
        const allCodes = data.hourly.weather_code;
        const allTimes = data.hourly.time;

        const step = getIntervalStep(weatherFrequency);

        const startIndex = allTimes.findIndex(t => {
            const h = new Date(t).getHours();
            return h >= currentHour;
        });

        const start = startIndex < 0 ? 0 : startIndex;

        // Always collect all hours so hover works at any position;
        // labels and dots are shown only at the step interval.
        const indices = [];
        for (let i = start; indices.length < 24 && i < allTemps.length; i++) {
            indices.push(i);
        }

        const temperatures = indices.map(i => allTemps[i]);
        const humidity = indices.map(i => allHumidity[i]);
        const feelsLike = indices.map(i => allFeelsLike[i]);
        const weatherCodes = indices.map(i => allCodes[i]);
        const times = indices.map(i => allTimes[i]);

        const labels = times.map(t => {
            const d = new Date(t);
            return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        });

        container.innerHTML = `<canvas id="weather-hour-chart"></canvas>`;

        const fontSize = Math.max(8, chartFontSize);
        const lineWidth = Math.max(1, Math.round(graphSize / 50));

        const canvas = document.getElementById("weather-hour-chart");
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 160);
        gradient.addColorStop(0, hexToRgba(graphColor, 0.35));
        gradient.addColorStop(1, hexToRgba(graphColor, 0.00));

        // Show point dots only at the step interval; intermediate hours have invisible points
        const dotR      = Math.max(2, lineWidth * 1.5);
        const dotHoverR = Math.max(4, lineWidth * 2);
        const pointRadii      = temperatures.map((_, i) => i % step === 0 ? dotR      : 0);
        const pointHoverRadii = temperatures.map((_, i) => i % step === 0 ? dotHoverR : dotHoverR);

        const datasets = [
            {
                label: "Temperature",
                data: temperatures,
                borderColor: graphColor,
                borderWidth: lineWidth,
                tension: 0.3,
                fill: true,
                backgroundColor: gradient,
                pointRadius: pointRadii,
                pointHoverRadius: pointHoverRadii,
                yAxisID: "y"
            }
        ];

        if (showHumidity) {
            datasets.push({
                label: "Humidity %",
                data: humidity,
                borderColor: "#6366f1",
                borderWidth: lineWidth,
                tension: 0.3,
                borderDash: [5, 3],
                pointRadius: pointRadii,
                pointHoverRadius: pointHoverRadii,
                yAxisID: "y1"
            });
        }

        new Chart(
            document.getElementById("weather-hour-chart"),
            {
                type: "line",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            mode: "nearest",
                            intersect: false,
                            titleFont: { size: fontSize },
                            bodyFont: { size: fontSize },
                            callbacks: {
                                label: context => {
                                    const i = context.dataIndex;
                                    const dsLabel = context.dataset.label;

                                    if (dsLabel === "Humidity %") {
                                        return `💧 ${humidity[i]}%`;
                                    }

                                    let text = "";

                                    if (showWeatherIcon) {
                                        text += getWeatherIconEmoji(weatherCodes[i]) + " ";
                                    }

                                    if (showWeatherTemperature) {
                                        const unit = getWeatherConfig().tempUnit;
                                        text += toDisplayTemp(temperatures[i], unit);
                                        text += ` (feels ${toDisplayTemp(feelsLike[i], unit)})`;
                                    }

                                    return text;
                                }
                            }
                        },
                        legend: { display: showHumidity }
                    },
                    scales: {
                        x: {
                            ticks: {
                                font: { size: fontSize },
                                maxRotation: 0,
                                minRotation: 0,
                                autoSkip: false,
                                // Only show labels at the step interval
                                callback: (val, index) => index % step === 0 ? labels[index] : null
                            },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                font: { size: fontSize },
                                callback: val => {
                                    const unit = getWeatherConfig().tempUnit;
                                    return toDisplayTemp(val, unit);
                                }
                            },
                            grid: { display: false }
                        },
                        ...(showHumidity ? {
                            y1: {
                                position: "right",
                                ticks: {
                                    font: { size: fontSize },
                                    callback: val => `${val}%`
                                },
                                grid: { display: false }
                            }
                        } : {})
                    }
                }
            }
        );

    }
    catch (err) {
        container.innerHTML = `<div style="padding:16px;color:#ef4444;font-size:13px;">Failed to load weather data.</div>`;
        console.error("Weather hour fetch error:", err);
    }

}

export function initWeatherHourFontScale() {
    const widget = document.getElementById("weather-hour-widget");
    if (!widget) return;
    new ResizeObserver(([entry]) => {
        const scale = entry.contentRect.width / 300;
        chartFontSize = Math.round(Math.max(8, Math.min(14, scale * 10)));
        renderWeatherHour();
    }).observe(widget);
}
