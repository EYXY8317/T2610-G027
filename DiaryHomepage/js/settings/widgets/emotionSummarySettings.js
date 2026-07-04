// 情绪总结组件的设置面板：图表类型（饼图/折线图/日历图）、折线图
// 颜色和粗细、时间范围（周/月/年/自定义日期区间）。
// Settings panel for the Emotion Summary widget: chart type
// (pie/line/calendar), line chart color and thickness, and time range
// (week/month/year/custom date range).

import {
    getEmotionSummaryState
}
from "../../widgets/emotionSummary.js";

function _effectiveGraphColor(state) {
    // 如果用户没有单独给这个组件设置过折线颜色，就跟随组件的
    // "标题颜色"外观设置（让默认状态下配色看起来是协调的一整套），
    // 只有用户主动改过折线颜色之后，才用他自己选的颜色。
    // If the user hasn't set a dedicated line color for this widget,
    // fall back to following the widget's own "title color" appearance
    // setting (so the default look is a coordinated color scheme) — only
    // once the user has actually changed the line color themselves does
    // their own chosen color take over.
    if (state.graphColor) return state.graphColor;
    try {
        const app = JSON.parse(localStorage.getItem("emotion-summary-widget-appearance") || "{}");
        return app.titleColor || "#1a1a1a";
    } catch { return "#1a1a1a"; }
}

export function getEmotionSummarySettings() {

    const state = getEmotionSummaryState();
    const lw = Number(state.graphLineWidth) || 2.5;
    const graphColor = _effectiveGraphColor(state);

    return {

        style: "",

        location: "",

        graph: `
            <h3>Chart Type</h3>
            <div class="setting-row">
                <span>View</span>
                <div class="segment-button es-display-segment">
                    <button class="segment-option${state.displayMode === "pie" ? " active" : ""}" data-value="pie">Pie</button>
                    <button class="segment-option${state.displayMode === "line" ? " active" : ""}" data-value="line">Line</button>
                    <button class="segment-option${state.displayMode === "calendar" ? " active" : ""}" data-value="calendar">Calendar</button>
                </div>
            </div>
            <h3>Graph Style</h3>
            <div class="setting-row">
                <span>Line Color</span>
                <input class="es-graph-color-picker" type="color" value="${graphColor}">
            </div>
            <div class="setting-row">
                <span>Line Width</span>
                <div class="segment-button es-line-width-segment">
                    <button class="segment-option${lw === 1.5 ? " active" : ""}" data-value="1.5">Thin</button>
                    <button class="segment-option${lw === 2.5 ? " active" : ""}" data-value="2.5">Medium</button>
                    <button class="segment-option${lw === 4 ? " active" : ""}" data-value="4">Thick</button>
                </div>
            </div>
        `,

        display: `
            <h3>Time Range</h3>
            <div class="setting-row">
                <span>Range</span>
                <div class="segment-button es-range-segment">
                    <button class="segment-option${state.timeRange === "week" ? " active" : ""}" data-value="week">Week</button>
                    <button class="segment-option${state.timeRange === "month" ? " active" : ""}" data-value="month">Month</button>
                    <button class="segment-option${state.timeRange === "year" ? " active" : ""}" data-value="year">Year</button>
                    <button class="segment-option${state.timeRange === "custom" ? " active" : ""}" data-value="custom">Custom</button>
                </div>
            </div>
            <div class="setting-row es-custom-range" style="${state.timeRange !== "custom" ? "display:none;" : ""}">
                <span>From</span>
                <input type="date" class="es-custom-start" value="${state.customStart || ""}">
            </div>
            <div class="setting-row es-custom-range" style="${state.timeRange !== "custom" ? "display:none;" : ""}">
                <span>To</span>
                <input type="date" class="es-custom-end" value="${state.customEnd || ""}">
            </div>
        `

    };

}
