import { getHighStreakState } from "../../widgets/highStreak.js";

export function getHighStreakSettings() {

    const state = getHighStreakState();

    return {

        style: "",

        location: "",

        graph: "",

        display: `
            <h3>Display Elements</h3>
            <div class="setting-row">
                <span>Mode</span>
                <div class="segment-button hs-display-segment">
                    <button class="segment-option${state.displayMode === "number"  ? " active" : ""}" data-value="number">Number</button>
                    <button class="segment-option${state.displayMode === "heatmap" ? " active" : ""}" data-value="heatmap">Heatmap</button>
                </div>
            </div>
        `

    };

}
