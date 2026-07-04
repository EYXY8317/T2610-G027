import {
    getWeatherConfig,
    toDisplayTemp,
    getWeatherIconEmoji
}
from "./weatherConfig.js";

import { getWidgetAppearance } from "../settings/appearance/widgetAppearance.js";

// "Weather Hour" 组件：用 Chart.js 画一条"未来 24 小时温度变化"的
// 折线图（可选叠加一条湿度曲线），鼠标悬停在线上会显示这个时间点的
// 天气图标、温度、体感温度。这些 export 出来的变量（showWeatherIcon
// 等）是给设置面板用的模块级共享状态——设置面板改了这些变量之后，
// 重新调用 renderWeatherHour() 就会用新的值重新画图。
// The "Weather Hour" widget: uses Chart.js to draw a "next 24 hours
// temperature" line graph (optionally overlaid with a humidity curve),
// showing the weather icon/temperature/feels-like temperature for that
// point in time on hover. The exported variables below (showWeatherIcon,
// etc.) are module-level shared state used by the settings panel — after
// the settings panel changes these variables, calling
// renderWeatherHour() again redraws the graph with the new values.

export let showWeatherIcon = true;
export let showWeatherTemperature = true;
export let showHumidity = false;
export let graphColor = "#4A90E2";
export let graphSize = 100;
export let chartFontSize = 11;

export function setGraphSize(value) { graphSize = value; }
export function setShowWeatherIcon(value) { showWeatherIcon = value; }
export function setShowWeatherTemperature(value) { showWeatherTemperature = value; }
export function setShowHumidity(value) { showHumidity = value; }
export function setGraphColor(value) { graphColor = value; }
export function setChartFontSize(value) { chartFontSize = Number(value); }

// 把十六进制颜色（如 "#4A90E2"）转换成 rgba(...) 格式，这样才能
// 指定透明度（alpha），用来画折线图下方那种"由深到透明"的渐变填充。
// Converts a hex color (like "#4A90E2") into rgba(...) format, so an
// alpha (transparency) value can be specified — used to draw the
// "solid fading to transparent" gradient fill under the line graph.
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

        // API 一口气返回了两天份（48 小时）的数据，这里找到第一个
        // "小时数 >= 现在这个小时"的位置，从那里开始往后取 24 小时，
        // 这样图表永远是从"现在"开始的未来 24 小时，而不是从午夜开始。
        // The API returns two full days (48 hours) of data in one go;
        // this finds the first index where the hour is >= the current
        // hour, then takes the next 24 hours from there — so the graph
        // always starts from "now" and shows the next 24 hours, instead
        // of starting from midnight.
        const startIndex = allTimes.findIndex(t => {
            const h = new Date(t).getHours();
            return h >= currentHour;
        });

        const start = startIndex < 0 ? 0 : startIndex;

        // Always collect all hours so hover works at any position;
        // labels and dots are shown only at the step interval.
        // 一律收集全部 24 个小时的数据点（保证鼠标悬停在任何位置都
        // 有对应的提示信息），至于要不要显示"频率间隔"（比如每 2/3/5
        // 小时显示一个点）则是另外由设置面板控制的显示层面的事。
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

        const contentColor = getWidgetAppearance("weather-hour-widget")?.contentColor || "#555555";
        const fontSize = Math.max(8, chartFontSize);
        const lineWidth = Math.max(2, Math.round(graphSize / 45));
        const dotHoverR = Math.max(5, lineWidth * 2.5);

        // 自定义 Chart.js 插件：在折线图的数据集画出来之前，先用
        // canvas 的渐变 API 生成一个"从上到下越来越透明"的渐变色，
        // 再把它设成折线图下方填充区域的颜色，营造出立体的光影效果。
        // Custom Chart.js plugin: before the line chart's dataset is
        // drawn, it uses the canvas gradient API to create a "fades from
        // solid to transparent, top to bottom" gradient, then sets it as
        // the line chart's area-fill color, giving it a layered shading
        // look.
        const gradientPlugin = {
            id: "areaGradient",
            beforeDatasetsDraw(chart) {
                const { ctx, chartArea: { top, bottom } } = chart;
                const grad = ctx.createLinearGradient(0, top, 0, bottom);
                grad.addColorStop(0,   hexToRgba(graphColor, 0.45));
                grad.addColorStop(0.5, hexToRgba(graphColor, 0.18));
                grad.addColorStop(1,   hexToRgba(graphColor, 0.00));
                chart.data.datasets[0].backgroundColor = grad;
            }
        };

        const datasets = [
            {
                label: "Temperature",
                data: temperatures,
                borderColor: graphColor,
                borderWidth: lineWidth,
                borderCapStyle: "round",
                borderJoinStyle: "round",
                tension: 0.4,
                fill: true,
                backgroundColor: hexToRgba(graphColor, 0.3),
                pointRadius: 0,
                pointHoverRadius: dotHoverR,
                pointHoverBackgroundColor: graphColor,
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2,
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
                pointRadius: 0,
                pointHoverRadius: dotHoverR,
                yAxisID: "y1"
            });
        }

        new Chart(
            document.getElementById("weather-hour-chart"),
            {
                type: "line",
                data: { labels, datasets },
                plugins: [gradientPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { right: 20, top: 6 } },
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
                            ticks: { display: false },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                font: { size: fontSize },
                                color: contentColor,
                                maxTicksLimit: 4,
                                callback: val => {
                                    const unit = getWeatherConfig().tempUnit;
                                    return toDisplayTemp(val, unit);
                                }
                            },
                            grid: {
                                display: true,
                                color: "rgba(0,0,0,0.05)",
                                drawBorder: false
                            }
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

// 用 ResizeObserver 监听组件大小变化，按组件宽度（相对 300px 基准）
// 算出图表文字应该多大，再重新渲染整个图表。
// Uses a ResizeObserver to watch for the widget's size changing,
// computes how large the chart's text should be based on the widget's
// width (relative to a 300px baseline), and re-renders the whole chart.
export function initWeatherHourFontScale() {
    const widget = document.getElementById("weather-hour-widget");
    if (!widget) return;
    new ResizeObserver(([entry]) => {
        const scale = entry.contentRect.width / 300;
        chartFontSize = Math.round(Math.max(8, Math.min(14, scale * 10)));
        renderWeatherHour();
    }).observe(widget);
}
