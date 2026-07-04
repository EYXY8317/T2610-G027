// 生成"最高连续记录"组件的设置面板内容——目前只有一个"显示模式"
// 切换（数字 / 热力图），其他几个标签页（style/location/graph）
// 暂时用不到，所以留空字符串。
// Builds the settings-panel content for the "highest streak" widget —
// currently just a "display mode" toggle (number / heatmap); the other
// tabs (style/location/graph) aren't used by this widget yet, so they're
// left as empty strings.

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
