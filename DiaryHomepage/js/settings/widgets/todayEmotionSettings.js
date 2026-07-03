import { getTodayEmotionState } from "../../widgets/todayEmotion.js";

export function getTodayEmotionSettings() {
    const state = getTodayEmotionState();
    return {

        style: "",

        location: "",

        graph: "",

        display: `
            <h3>Select Mode Settings</h3>
            <div class="setting-row">
                <span>Selected Effect</span>
                <div class="segment-button te-effect-segment">
                    <button class="segment-option active" data-value="border">Border</button>
                    <button class="segment-option" data-value="glow">Glow</button>
                    <button class="segment-option" data-value="scale">Scale</button>
                </div>
            </div>

            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip${state.showTitle !== false ? " active" : ""}" data-statekey="showTitle">Show Title</button>
            </div>
        `

    };
}
