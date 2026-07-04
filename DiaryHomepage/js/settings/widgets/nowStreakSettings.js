// 跟 highStreakSettings.js 是同一套结构，只是针对"当前连续记录"
// 组件而不是"最高连续记录"组件——生成同样的"显示模式"（数字/热力图）
// 切换选项。
// Same structure as highStreakSettings.js, just for the "current streak"
// widget instead of the "highest streak" widget — builds the same
// "display mode" (number/heatmap) toggle.

import { getNowStreakState } from "../../widgets/nowStreak.js";

export function getNowStreakSettings() {

    const state = getNowStreakState();

    return {

        style: "",

        location: "",

        graph: "",

        display: `
            <h3>Display Elements</h3>
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
