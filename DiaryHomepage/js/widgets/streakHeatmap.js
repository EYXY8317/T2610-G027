// GitHub-contributions-style heatmap grid shared by the Now Streak and
// High Streak widgets.
// Now Streak 和 High Streak 组件共用的"贡献图"热力图渲染逻辑。

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
