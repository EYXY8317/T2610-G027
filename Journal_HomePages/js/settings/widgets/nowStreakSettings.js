import { getNowStreakState } from "../../widgets/nowStreak.js";

export function getNowStreakSettings() {

    const state = getNowStreakState();

    return {

        style: "",

        location: "",

        graph: "",

        display: `
            <h3>Display</h3>
            <div class="setting-row">
                <span>Mode</span>
                <div class="segment-button ns-display-segment">
                    <button class="segment-option${state.displayMode === "number"  ? " active" : ""}" data-value="number">Number</button>
                    <button class="segment-option${state.displayMode === "heatmap" ? " active" : ""}" data-value="heatmap">Heatmap</button>
                </div>
            </div>
        `

    };

}
