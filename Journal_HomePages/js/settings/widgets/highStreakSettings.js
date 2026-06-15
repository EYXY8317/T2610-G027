import {
    getHighStreakState
}
from "../../widgets/highStreak.js";

export function getHighStreakSettings() {

    const state = getHighStreakState();

    return {

        style: "",

        location: "",

        graph: "",

        display: `
            <h3>Display</h3>
            <div class="setting-row">
                <span>Mode</span>
                <div class="segment-button hs-display-segment">
                    <button class="segment-option${state.displayMode === "number" ? " active" : ""}" data-value="number">Number</button>
                    <button class="segment-option${state.displayMode === "heatmap" ? " active" : ""}" data-value="heatmap">Heatmap</button>
                </div>
            </div>
            <h3>Celebration</h3>
            <div class="setting-row">
                <span>Animation on Record</span>
                <div class="segment-button hs-celebrate-segment">
                    <button class="segment-option${state.celebrationEnabled ? " active" : ""}" data-value="true">ON</button>
                    <button class="segment-option${!state.celebrationEnabled ? " active" : ""}" data-value="false">OFF</button>
                </div>
            </div>
            <h3>Data</h3>
            <div class="setting-row">
                <span>Reset High Score</span>
                <button class="hs-reset-btn" style="padding:6px 14px;border:1px solid #d1d5db;border-radius:6px;background:white;cursor:pointer;font-size:13px;color:#ef4444;">
                    Reset
                </button>
            </div>
        `

    };

}
