import {
    getEmotionSummaryState
}
from "../../widgets/emotionSummary.js";

function _effectiveGraphColor(state) {
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
