// GitHub-contributions-style heatmap grid shared by the Now Streak and
// High Streak widgets, plus a fallback popup for when the widget card is
// too small to show the full grid inline.
// Now Streak 和 High Streak 组件共用的"贡献图"热力图渲染逻辑，以及
// 组件卡片太小、装不下完整格子时的兜底弹窗。

const WEEKS = 15;
const DAYS  = 7;

export function renderStreakHeatmap(dates) {
    const cells = [];
    const today = new Date();
    for (let w = WEEKS - 1; w >= 0; w--) {
        const col = [];
        for (let d = 0; d < DAYS; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const key = date.toISOString().slice(0, 10);
            col.push(`<div class="streak-cell${dates.has(key) ? " active" : ""}" title="${key}"></div>`);
        }
        cells.push(`<div class="streak-col">${col.join("")}</div>`);
    }
    return `<div class="streak-heatmap">${cells.join("")}</div>`;
}

// Shown instead of the inline grid when the widget card doesn't have room
// to display it without clipping — opens the full grid in an overlay.
// 当组件卡片没有足够空间完整显示格子时，用这个按钮代替内嵌的格子，
// 点击后在浮层里展示完整的热力图。
export function renderStreakHeatmapTrigger() {
    return `<button class="streak-heatmap-btn" type="button">View Heatmap</button>`;
}

export function openStreakHeatmapPopup(title, dates) {
    const overlay = document.createElement("div");
    overlay.className = "streak-heatmap-overlay";
    overlay.innerHTML = `
        <div class="streak-heatmap-card">
            <div class="streak-heatmap-card-header">
                <span>${title}</span>
                <button class="streak-heatmap-close" type="button">✕</button>
            </div>
            ${renderStreakHeatmap(dates)}
        </div>
    `;
    document.body.append(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".streak-heatmap-close").addEventListener("click", () => overlay.remove());
    return overlay;
}
