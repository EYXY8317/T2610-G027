import {
    getQuoteState
}
from "../../widgets/quote.js";

const ALL_CATEGORIES = [
    { key: "time",         label: "Time" },
    { key: "self",         label: "Self Love" },
    { key: "family",       label: "Family" },
    { key: "encouragement",label: "Encouragement" },
    { key: "inspiration",  label: "Inspiration" }
];

export function getQuoteSettings() {

    const state = getQuoteState();
    const cats    = state.systemCategories || ["encouragement"];
    const sources = state.showSources     || ["system", "user"];

    const savedList = state.savedQuotes.length
        ? state.savedQuotes.map((q, i) => `
            <div class="quote-saved-item">
                <div class="quote-saved-text">"${q.text}"${q.author ? ` — ${q.author}` : ""}</div>
                <button class="quote-remove-saved" data-index="${i}">✕</button>
            </div>
        `).join("")
        : `<div style="font-size:12px;color:#9ca3af;margin-top:4px;">No saved quotes</div>`;

    return {

        style: `
            <h3>Font</h3>
            <div class="setting-row">
                <span>Font Style</span>
                <div class="segment-button quote-font-segment">
                    <button class="segment-option${state.fontStyle === "serif"   ? " active" : ""}" data-value="serif"   style="font-family:Georgia,serif;">Serif</button>
                    <button class="segment-option${state.fontStyle === "sans"    ? " active" : ""}" data-value="sans">Sans</button>
                    <button class="segment-option${state.fontStyle === "italic"  ? " active" : ""}" data-value="italic"  style="font-style:italic;font-family:Georgia,serif;">Italic</button>
                    <button class="segment-option${state.fontStyle === "cursive" ? " active" : ""}" data-value="cursive" style="font-family:cursive;">Cursive</button>
                </div>
            </div>
        `,

        location: "",

        graph: "",

        display: `
            <h3>Categories</h3>
            <div class="quote-cat-chips">
                ${ALL_CATEGORIES.map(c => `
                    <button class="quote-cat-btn segment-option${cats.includes(c.key) ? " active" : ""}" data-cat="${c.key}">${c.label}</button>
                `).join("")}
            </div>

            <h3>Rotation</h3>
            <div class="setting-row">
                <span>Auto Rotate</span>
                <div class="segment-button quote-auto-rotate-segment">
                    <button class="segment-option${state.autoRotate  ? " active" : ""}" data-value="true">Auto</button>
                    <button class="segment-option${!state.autoRotate ? " active" : ""}" data-value="false">Manual</button>
                </div>
            </div>
            <div class="setting-row">
                <span>Rotate Interval</span>
                <div class="segment-button quote-rotate-daily-segment" style="${!state.autoRotate ? "opacity:0.4;pointer-events:none;" : ""}">
                    <button class="segment-option${state.rotateDaily  ? " active" : ""}" data-value="true">Daily</button>
                    <button class="segment-option${!state.rotateDaily ? " active" : ""}" data-value="false">Each Visit</button>
                </div>
            </div>

            <h3>Source</h3>
            <div class="quote-src-chips">
                <button class="quote-src-btn segment-option${sources.includes("system") ? " active" : ""}" data-src="system">System</button>
                <button class="quote-src-btn segment-option${sources.includes("user")   ? " active" : ""}" data-src="user">Mine</button>
            </div>

            <h3>My Quotes</h3>
            <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
                <span>Add Quote</span>
                <textarea
                    class="quote-user-text"
                    rows="2"
                    placeholder="Enter your quote here..."
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
        `

    };

}
