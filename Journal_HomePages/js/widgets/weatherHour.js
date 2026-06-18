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

        const indices = [];
        for (let i = start; indices.length < 24 && i < allTemps.length; i += step) {
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

        const datasets = [
            {
                label: "Temperature",
                data: temperatures,
                borderColor: graphColor,
                borderWidth: lineWidth,
                tension: 0.3,
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
                            ticks: { font: { size: fontSize } },
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
