// 生成"日记卡片"组件的设置面板：可选的几本"书"的封面预览格子
// （点哪个就把 activeBook 换成哪个），以及"进入日记"的方式
// （点按钮 / 直接点卡片）这两组设置。
// Builds the settings-panel content for the "Diary Card" widget: a grid
// of selectable "book" cover previews (clicking one switches activeBook
// to it), plus the "how you enter the diary" mode (via a button / by
// clicking the card directly).

import {
    getDiaryCardState,
    BOOK_OPTIONS
} from "../../widgets/diaryCard.js";

export function getDiaryCardSettings() {
    const state = getDiaryCardState();

    const bookSlots = BOOK_OPTIONS.map((book, i) => {
        const isActive = state.activeBook === i;
        return `
            <div class="dc-book-slot${isActive ? " active" : ""}" data-index="${i}">
                <div class="dc-slot-preview">
                    <img class="dc-slot-img" src="${book.src}" alt="${book.label}">
                </div>
                <div class="dc-slot-label">${book.label}</div>
                <button class="dc-slot-select-btn${isActive ? " active" : ""}" data-index="${i}">
                    ${isActive ? "✓ Active" : "Select"}
                </button>
            </div>
        `;
    }).join("");

    return {
        display: `
            <div class="setting-section-label">Choose Book</div>
            <div class="dc-book-slots">${bookSlots}</div>
            <hr>
            <div class="setting-row">
                <span>Entry Mode</span>
                <div class="segment-button dc-mode-segment">
                    <button class="segment-option${state.mode === "button" ? " active" : ""}" data-value="button">Button</button>
                    <button class="segment-option${state.mode === "direct" ? " active" : ""}" data-value="direct">Direct</button>
                </div>
            </div>
        `
    };
}
