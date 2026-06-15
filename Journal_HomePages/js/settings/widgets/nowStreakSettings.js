import {
    getNowStreakState,
    STREAK_TYPES
}
from "../../widgets/nowStreak.js";

export function getNowStreakSettings() {

    const state = getNowStreakState();

    return `

        <h3>Streak Type</h3>

        <div class="setting-row">
            <span>Type</span>
            <select class="ns-type-select">
                ${STREAK_TYPES.map(t =>
                    `<option value="${t.id}"${state.streakType === t.id ? " selected" : ""}>${t.label}</option>`
                ).join("")}
            </select>
        </div>

        <div class="setting-row">
            <span>Custom Label</span>
            <input
                class="ns-custom-label"
                type="text"
                value="${state.customLabel || ""}"
                placeholder="My Streak"
                style="flex:1;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;"
            >
        </div>

        <h3>Display</h3>

        <div class="setting-row">
            <span>Mode</span>
            <div class="segment-button ns-display-segment">
                <button class="segment-option${state.displayMode === "number" ? " active" : ""}" data-value="number">Number</button>
                <button class="segment-option${state.displayMode === "heatmap" ? " active" : ""}" data-value="heatmap">Heatmap</button>
            </div>
        </div>

    `;

}
