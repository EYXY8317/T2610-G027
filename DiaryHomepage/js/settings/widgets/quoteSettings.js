import {
    getQuoteState
}
from "../../widgets/quote.js";

// Quote 组件设置面板：可以选字体样式、要显示哪些分类的名言、要不要
// 自动轮播、名言来源（系统内置 / 自己添加），以及自己添加、查看、
// 删除保存的名言。
// The Quote widget's settings panel: choose the font style, which
// categories of quotes to show, whether to auto-rotate, the quote source
// (built-in system quotes vs. your own), and add/view/remove your own
// saved quotes.

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

    // 把用户自己保存的每条名言渲染成一行，附带一个"✕"删除按钮
    // （data-index 记住是列表中的第几条，方便点击时定位删除）。
    // Renders each of the user's saved quotes as one row, with an "✕"
    // remove button (data-index remembers which position in the list it
    // is, so the click handler knows which one to delete).
    const savedList = state.savedQuotes.length
        ? state.savedQuotes.map((q, i) => `
            <div class="quote-saved-item">
                <div class="quote-saved-text">"${q.text}"${q.author ? ` — ${q.author}` : ""}</div>
                <button class="quote-remove-saved" data-index="${i}">✕</button>
            </div>
        `).join("")
        : `<div style="font-size:12px;color:#9ca3af;margin-top:4px;">No saved quotes</div>`;

    // 返回值分成好几个"区块"（style/location/graph/display），是因为
    // 设置弹窗把不同组件的设置项，按统一的标签分类展示（样式/位置/
    // 图表/显示），这个组件只用到 style 和 display 两个区块，
    // 其余留空字符串即可。
    // The return value is split into several "sections"
    // (style/location/graph/display) because the settings popup groups
    // every widget's settings under the same shared tab categories
    // (Style/Location/Graph/Display) — this widget only uses the style
    // and display sections, so the rest are left as empty strings.

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
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip${state.showAuthor !== false ? " active" : ""}" data-statekey="showAuthor">Author</button>
                <button class="toggle-chip${state.showSourceTag !== false ? " active" : ""}" data-statekey="showSourceTag">Source Tag</button>
            </div>

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
            <div class="setting-row" style="${!state.autoRotate ? "display:none;" : ""}">
                <span>Rotate Interval</span>
                <div class="segment-button quote-rotate-daily-segment">
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
