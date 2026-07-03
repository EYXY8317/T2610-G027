import {
    getPictureStreakState,
    SCROLL_INTERVALS
}
from "../../widgets/pictureStreak.js";

export function getPictureStreakSettings(widgetId = "picture-streak-widget") {

    const state = getPictureStreakState(widgetId);

    const photoList = state.photos.length
        ? state.photos.map((p, i) => `
            <div class="ps-settings-photo">
                <img src="${p.dataUrl}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                <span style="flex:1;font-size:12px;">${p.caption || formatDate(p.date)}</span>
                <button class="ps-remove-btn" data-index="${i}" style="border:none;background:none;cursor:pointer;color:#ef4444;font-size:14px;">✕</button>
            </div>
        `).join("")
        : `<div style="font-size:12px;color:#9ca3af;">No photos yet</div>`;

    return {

        style: "",

        location: "",

        graph: `
            <h3>Photos</h3>
            <div class="setting-row">
                <span>Upload Photo</span>
                <input class="ps-photo-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif">
            </div>
            <div class="ps-photo-list">${photoList}</div>
        `,

        display: `
            <h3>Mode</h3>
            <div class="setting-row">
                <span>Display Mode</span>
                <div class="segment-button ps-display-segment">
                    <button class="segment-option${state.displayMode === "single" ? " active" : ""}" data-value="single">Manual</button>
                    <button class="segment-option${state.displayMode === "scroll" ? " active" : ""}" data-value="scroll">Auto Scroll</button>
                </div>
            </div>
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip${state.showDateLabel ? " active" : ""}" data-statekey="showDateLabel">Date Label</button>
            </div>
            <h3>Options</h3>
            <div class="setting-row">
                <span>Scroll Interval</span>
                <select class="ps-interval-select">
                    ${SCROLL_INTERVALS.map(i =>
                        `<option value="${i.value}"${state.scrollInterval === i.value ? " selected" : ""}>${i.label}</option>`
                    ).join("")}
                </select>
            </div>
        `

    };

}

function formatDate(isoDate) {
    if (!isoDate) {
        return "";
    }
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
