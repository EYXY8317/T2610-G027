import {
    getQuoteState
}
from "../../widgets/quote.js";

export function getQuoteSettings() {

    const state = getQuoteState();

    const savedList = state.savedQuotes.length
        ? state.savedQuotes.map((q, i) => `
            <div class="quote-saved-item">
                <span style="flex:1;font-size:12px;">"${q.text.slice(0, 50)}${q.text.length > 50 ? "…" : ""}"</span>
                <button class="quote-remove-saved" data-index="${i}" style="border:none;background:none;cursor:pointer;color:#ef4444;">✕</button>
            </div>
        `).join("")
        : `<div style="font-size:12px;color:#9ca3af;">No saved quotes</div>`;

    return `

        <h3>System Quotes</h3>

        <div class="setting-row">
            <span>Category</span>
            <select class="quote-category-select">
                <option value="time"${state.systemCategory === "time" ? " selected" : ""}>Time</option>
                <option value="self"${state.systemCategory === "self" ? " selected" : ""}>Self Love</option>
                <option value="family"${state.systemCategory === "family" ? " selected" : ""}>Family</option>
                <option value="encouragement"${state.systemCategory === "encouragement" ? " selected" : ""}>Encouragement</option>
                <option value="inspiration"${state.systemCategory === "inspiration" ? " selected" : ""}>Inspiration</option>
            </select>
        </div>

        <h3>Rotation</h3>

        <div class="setting-row">
            <span>Auto Rotate</span>
            <div class="segment-button quote-auto-rotate-segment">
                <button class="segment-option${state.autoRotate ? " active" : ""}" data-value="true">Auto</button>
                <button class="segment-option${!state.autoRotate ? " active" : ""}" data-value="false">Manual</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Rotate Interval</span>
            <div class="segment-button quote-rotate-daily-segment" style="${!state.autoRotate ? "opacity:0.4;pointer-events:none;" : ""}">
                <button class="segment-option${state.rotateDaily ? " active" : ""}" data-value="true">Daily</button>
                <button class="segment-option${!state.rotateDaily ? " active" : ""}" data-value="false">Each Visit</button>
            </div>
        </div>

        <h3>Display</h3>

        <div class="setting-row">
            <span>Show Source</span>
            <div class="segment-button quote-source-segment">
                <button class="segment-option${state.showSource === "both" ? " active" : ""}" data-value="both">Both</button>
                <button class="segment-option${state.showSource === "system" ? " active" : ""}" data-value="system">System</button>
                <button class="segment-option${state.showSource === "user" ? " active" : ""}" data-value="user">Mine</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Font Style</span>
            <div class="segment-button quote-font-segment">
                <button class="segment-option${state.fontStyle === "serif" ? " active" : ""}" data-value="serif" style="font-family:Georgia,serif;">Serif</button>
                <button class="segment-option${state.fontStyle === "sans" ? " active" : ""}" data-value="sans">Sans</button>
                <button class="segment-option${state.fontStyle === "italic" ? " active" : ""}" data-value="italic" style="font-style:italic;font-family:Georgia,serif;">Italic</button>
                <button class="segment-option${state.fontStyle === "cursive" ? " active" : ""}" data-value="cursive" style="font-family:cursive;">Cursive</button>
            </div>
        </div>

        <h3>My Quotes</h3>

        <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
            <span>Add Quote</span>
            <textarea
                class="quote-user-text"
                rows="2"
                placeholder="Enter your quote here…"
                style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;resize:vertical;box-sizing:border-box;"
            ></textarea>
            <input
                class="quote-user-author"
                type="text"
                placeholder="Author (optional)"
                style="width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box;"
            >
            <button class="quote-add-btn" style="padding:6px 14px;border:none;background:#3b82f6;color:white;border-radius:6px;cursor:pointer;font-size:13px;">
                Add
            </button>
        </div>

        <h3>Saved Quotes</h3>

        <div class="quote-saved-list">${savedList}</div>

    `;

}
