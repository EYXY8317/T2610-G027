import {
    getDiaryCardState,
    BOOK_OPTIONS
}
from "../../widgets/diaryCard.js";

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
