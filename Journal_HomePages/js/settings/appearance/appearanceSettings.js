import {
    getFontSizeSetting
}
from "./fontSizeSetting.js";

import {
    getShowTitleSetting
}
from "./showTitleSetting.js";

import {
    getBorderSetting
}
from "./borderSetting.js";

import {
    getBackgroundOpacitySetting
}
from "./backgroundOpacitySetting.js";

export const PALETTE_CATEGORIES = [
    {
        id: "dopamine", name: "🌈 Dopamine",
        palettes: [
            { id: "dopamine-1", name: "Cherry Pop",    colors: ["#FF595E", "#FFCA3A", "#1982C4"] },
            { id: "dopamine-2", name: "Electric",      colors: ["#FF006E", "#8338EC", "#3A86FF"] },
            { id: "dopamine-3", name: "Citrus Burst",  colors: ["#FB5607", "#06D6A0", "#FFD166"] },
            { id: "dopamine-4", name: "Neon",          colors: ["#FF1744", "#00E5FF", "#651FFF"] },
            { id: "dopamine-5", name: "Tangerine",     colors: ["#F77F00", "#38B000", "#FF70A6"] },
        ]
    },
    {
        id: "coastal", name: "🌊 Coastal",
        palettes: [
            { id: "coastal-1", name: "Ocean",      colors: ["#0077B6", "#90E0EF", "#F8F9FA"] },
            { id: "coastal-2", name: "Deep Sea",   colors: ["#005F73", "#94D2BD", "#E9F5F9"] },
            { id: "coastal-3", name: "Azure",      colors: ["#118AB2", "#ADE8F4", "#F1FAEE"] },
            { id: "coastal-4", name: "Cobalt",     colors: ["#4361EE", "#CAF0F8", "#FFFFFF"] },
            { id: "coastal-5", name: "Navy Mist",  colors: ["#1D3557", "#A8DADC", "#F6FFF8"] },
        ]
    },
    {
        id: "wood", name: "🌳 Earthy",
        palettes: [
            { id: "wood-1", name: "Oak",    colors: ["#6F4E37", "#C8AD7F", "#F5F0E6"] },
            { id: "wood-2", name: "Walnut", colors: ["#4E3629", "#A67C52", "#EFE6D7"] },
            { id: "wood-3", name: "Maple",  colors: ["#8B6B4A", "#D9BF9E", "#FFF8F0"] },
            { id: "wood-4", name: "Teak",   colors: ["#7A5A3A", "#D7C2A4", "#FAF6EE"] },
            { id: "wood-5", name: "Cedar",  colors: ["#5C4033", "#B08968", "#F8F1E7"] },
        ]
    },
    {
        id: "minimal", name: "⚫🔵 Minimal",
        palettes: [
            { id: "minimal-1", name: "Midnight",   colors: ["#0F172A", "#64748B", "#F8FAFC"] },
            { id: "minimal-2", name: "Blueprint",  colors: ["#1E293B", "#3B82F6", "#FFFFFF"] },
            { id: "minimal-3", name: "Slate",      colors: ["#111827", "#60A5FA", "#E5E7EB"] },
            { id: "minimal-4", name: "Steel",      colors: ["#2B2D42", "#8D99AE", "#EDF2F4"] },
            { id: "minimal-5", name: "Graphite",   colors: ["#202124", "#4285F4", "#F1F3F4"] },
        ]
    },
    {
        id: "forest", name: "🌲 Forest",
        palettes: [
            { id: "forest-1", name: "Pine",  colors: ["#344E41", "#84A98C", "#CAD2C5"] },
            { id: "forest-2", name: "Moss",  colors: ["#3A5A40", "#A3B18A", "#DAD7CD"] },
            { id: "forest-3", name: "Fern",  colors: ["#386641", "#A7C957", "#F2E8CF"] },
            { id: "forest-4", name: "Grove", colors: ["#283618", "#606C38", "#FEFAE0"] },
            { id: "forest-5", name: "Jade",  colors: ["#2D6A4F", "#95D5B2", "#F1FAEE"] },
        ]
    },
    {
        id: "cute", name: "🍓 Cute",
        palettes: [
            { id: "cute-1", name: "Strawberry Milk", colors: ["#FFB3C6", "#FFD6A5", "#FFF8E8"] },
            { id: "cute-2", name: "Marshmallow",     colors: ["#DDBDF1", "#BDE0FE", "#F8F9FA"] },
            { id: "cute-3", name: "Bunny Garden",    colors: ["#FFC8DD", "#CDEAC0", "#FFFDF7"] },
            { id: "cute-4", name: "Peach Soda",      colors: ["#FFCAD4", "#A2D2FF", "#FDFCDC"] },
            { id: "cute-5", name: "Bear Milk Tea",   colors: ["#D4A373", "#FAEDCD", "#CCD5AE"] },
        ]
    },
];

// Flat list for backward compatibility
export const UNIVERSAL_PALETTES = PALETTE_CATEGORIES.flatMap(c => c.palettes);

export function getColorsTabHTML(savedApp = {}) {

    const bg       = savedApp.backgroundColor || "#ffffff";
    const titleC   = savedApp.titleColor      || "#000000";
    const contentC = savedApp.contentColor    || "#000000";
    const borderC  = savedApp.borderColor     || "#ddd8cf";

    function isActive(preset) {
        return preset.colors[0].toLowerCase() === bg.toLowerCase() &&
               preset.colors[1].toLowerCase() === titleC.toLowerCase() &&
               preset.colors[2].toLowerCase() === contentC.toLowerCase();
    }

    const palettesHTML = UNIVERSAL_PALETTES.map(p => {
        const active = isActive(p);
        const dots = p.colors.map(c =>
            `<span class="ap-color-dot" style="background:${c}"></span>`
        ).join("");
        return `
            <div class="ap-palette-card${active ? " active" : ""}" data-palette-id="${p.id}" data-colors='${JSON.stringify(p.colors)}'>
                <div class="ap-palette-dots">${dots}</div>
                <div class="ap-palette-name">${p.name}</div>
            </div>
        `;
    }).join("");

    return `

        <h3>Palette</h3>

        <div class="ap-palette-grid">
            ${palettesHTML}
        </div>

        <hr>

        <h3>Custom Colors</h3>

        <div class="setting-row">
            <span>Background</span>
            <input type="color" class="background-color-picker" value="${bg}">
        </div>

        <div class="setting-row title-color-row">
            <span>Title</span>
            <input type="color" class="title-color-picker" value="${titleC}">
        </div>

        <div class="setting-row">
            <span>Content</span>
            <input type="color" class="content-color-picker" value="${contentC}">
        </div>

        <div class="setting-row border-color-row" style="${savedApp.showBorder === false ? "display:none;" : ""}">
            <span>Border</span>
            <input type="color" class="border-color-picker" value="${borderC}">
        </div>

        <hr>

        <button class="apply-to-all-btn">Apply to All Widgets</button>

    `;

}

export function getStyleTabHTML() {

    return `

        <h3>Appearance</h3>

        ${getFontSizeSetting()}

        <hr>

        ${getShowTitleSetting()}

        <div class="setting-row title-align-row">
            <span>Title Align</span>
            <div class="segment-button title-align-segment">
                <button class="segment-option title-align-option active" data-value="left">Left</button>
                <button class="segment-option title-align-option" data-value="center">Center</button>
            </div>
        </div>

        <hr>

        ${getBorderSetting()}

        <hr>

        ${getBackgroundOpacitySetting()}

        <hr>

        <h3>Size</h3>

        <div class="setting-row">
            <span>Width</span>
            <div class="size-input-wrap">
                <input type="number" class="widget-width-input" min="80" max="1400" step="10" placeholder="—">
                <span class="size-input-unit">px</span>
            </div>
        </div>

        <div class="setting-row">
            <span>Height</span>
            <div class="size-input-wrap">
                <input type="number" class="widget-height-input" min="60" max="1200" step="10" placeholder="—">
                <span class="size-input-unit">px</span>
            </div>
        </div>

    `;

}

// Kept so any remaining callers don't break
export function getAppearanceSettings() {
    return getStyleTabHTML();
}

export function getAppearanceSectionsHTML(savedApp = {}) {
    const bg           = savedApp.backgroundColor || "#ffffff";
    const titleC       = savedApp.titleColor      || "#000000";
    const contentC     = savedApp.contentColor    || "#000000";
    const borderC      = savedApp.borderColor     || "#ddd8cf";
    const titleHidden  = savedApp.showTitle       === false;
    const borderHidden = savedApp.showBorder      === false;
    const curAlign        = savedApp.titleAlign      || "left";
    const curTitleScale   = savedApp.titleScale      || "3";
    const curContentScale = savedApp.contentScale    || "3";
    const opacity         = savedApp.backgroundOpacity ?? 100;

    function isActive(p) {
        return p.colors[0].toLowerCase() === bg.toLowerCase() &&
               p.colors[1].toLowerCase() === titleC.toLowerCase() &&
               p.colors[2].toLowerCase() === contentC.toLowerCase();
    }

    // Find which category the current palette belongs to (for default tab)
    let activeCatId = PALETTE_CATEGORIES[0].id;
    for (const cat of PALETTE_CATEGORIES) {
        if (cat.palettes.some(isActive)) { activeCatId = cat.id; break; }
    }

    function paletteCategoryHTML(cat) {
        const isActiveCat = cat.id === activeCatId;
        const cardsHTML = cat.palettes.map(p => {
            const dots = p.colors.map(c => `<span class="ap-color-dot" style="background:${c}"></span>`).join("");
            return `<div class="ap-palette-card${isActive(p) ? " active" : ""}" data-palette-id="${p.id}" data-colors='${JSON.stringify(p.colors)}'>
                <div class="ap-palette-dots">${dots}</div>
                <div class="ap-palette-name">${p.name}</div>
            </div>`;
        }).join("");
        return `<div class="palette-cat-grid${isActiveCat ? " active" : ""}" data-cat="${cat.id}">${cardsHTML}</div>`;
    }

    const chipBarHTML = PALETTE_CATEGORIES.map(cat =>
        `<button class="palette-cat-chip${cat.id === activeCatId ? " active" : ""}" data-cat="${cat.id}">${cat.name}</button>`
    ).join("");

    const allCatGridsHTML = PALETTE_CATEGORIES.map(paletteCategoryHTML).join("");

    const bw = savedApp.borderWidth ?? 1.5;
    const h  = titleHidden  ? "display:none;" : "";
    const b  = borderHidden ? "display:none;" : "";

    function section(label, bodyHTML, sectionKey = null) {
        const allBtn = sectionKey
            ? `<button class="color-apply-btn section-all-btn" data-section-all="${sectionKey}">All</button>`
            : "";
        return `
        <div class="setting-section">
            <div class="setting-section-toggle">
                <h3>${label}</h3>
                <div class="section-toggle-right">
                    ${allBtn}
                    <span class="setting-section-chevron">›</span>
                </div>
            </div>
            <div class="setting-section-body">
                ${bodyHTML}
            </div>
        </div>`;
    }

    return `
        ${section("Palette", `
            <div class="palette-cat-chips">${chipBarHTML}</div>
            ${allCatGridsHTML}
        `, "palette")}

        ${section("Colors", `
            <div class="setting-row">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="backgroundColor">All</button>
                    <span>Background</span>
                </div>
                <input type="color" class="background-color-picker" value="${bg}">
            </div>
            <div class="setting-row title-color-row" style="${h}">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="titleColor">All</button>
                    <span>Title</span>
                </div>
                <input type="color" class="title-color-picker" value="${titleC}">
            </div>
            <div class="setting-row">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="contentColor">All</button>
                    <span>Content</span>
                </div>
                <input type="color" class="content-color-picker" value="${contentC}">
            </div>
            <div class="setting-row border-color-row" style="${b}">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="borderColor">All</button>
                    <span>Border</span>
                </div>
                <input type="color" class="border-color-picker" value="${borderC}">
            </div>
            <div class="setting-row">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="backgroundOpacity">All</button>
                    <span>Opacity</span>
                </div>
                <span class="background-opacity-value">${opacity}%</span>
            </div>
            <div class="background-opacity-slider-row">
                <span>0</span>
                <input type="range" min="0" max="100" value="${opacity}" class="background-opacity-slider">
                <span>100</span>
            </div>
        `, "colors")}

        ${section("Title", `
            <div class="setting-row">
                <span>Visible</span>
                <div class="segment-button">
                    <button class="segment-option title-segment-option${!titleHidden ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option title-segment-option${titleHidden  ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
            <div class="setting-row title-size-row" style="${h}">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="titleScale">All</button>
                    <span>Size</span>
                </div>
                <div class="segment-button">
                    <button class="segment-option title-scale-option${curTitleScale === "1" ? " active" : ""}" data-value="1">1</button>
                    <button class="segment-option title-scale-option${curTitleScale === "2" ? " active" : ""}" data-value="2">2</button>
                    <button class="segment-option title-scale-option${curTitleScale === "3" ? " active" : ""}" data-value="3">3</button>
                </div>
            </div>
            <div class="setting-row title-align-row" style="${h}">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="titleAlign">All</button>
                    <span>Align</span>
                </div>
                <div class="segment-button">
                    <button class="segment-option title-align-option${curAlign === "left"   ? " active" : ""}" data-value="left">Left</button>
                    <button class="segment-option title-align-option${curAlign === "center" ? " active" : ""}" data-value="center">Center</button>
                </div>
            </div>
        `, "title")}

        ${section("Content", `
            <div class="setting-row">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="contentScale">All</button>
                    <span>Size</span>
                </div>
                <div class="segment-button content-scale-segment">
                    <button class="segment-option${curContentScale === "1" ? " active" : ""}" data-value="1">1</button>
                    <button class="segment-option${curContentScale === "2" ? " active" : ""}" data-value="2">2</button>
                    <button class="segment-option${curContentScale === "3" ? " active" : ""}" data-value="3">3</button>
                </div>
            </div>
        `, "content")}

        ${section("Border", `
            <div class="setting-row">
                <span>Visible</span>
                <div class="segment-button">
                    <button class="segment-option border-segment-option${!borderHidden ? " active" : ""}" data-value="true">Show</button>
                    <button class="segment-option border-segment-option${borderHidden  ? " active" : ""}" data-value="false">Hide</button>
                </div>
            </div>
            <div class="setting-row border-width-row" style="${b}">
                <div class="color-row-left">
                    <button class="apply-all-button color-apply-btn" data-all-key="borderWidth">All</button>
                    <span>Width</span>
                </div>
                <span class="border-width-value">${bw}px</span>
            </div>
            <div class="border-width-slider-row" style="${b}">
                <span>0.5</span>
                <input type="range" min="0.5" max="8" step="0.5" value="${bw}" class="border-width-slider">
                <span>8</span>
            </div>
        `, "border")}

        ${section("Size", `
            <div class="setting-row">
                <span>Width</span>
                <div class="size-input-wrap">
                    <input type="number" class="widget-width-input" min="80" max="1400" step="10" placeholder="—">
                    <span class="size-input-unit">px</span>
                </div>
            </div>
            <div class="setting-row">
                <span>Height</span>
                <div class="size-input-wrap">
                    <input type="number" class="widget-height-input" min="60" max="1200" step="10" placeholder="—">
                    <span class="size-input-unit">px</span>
                </div>
            </div>
        `)}

        <button class="apply-to-all-btn">
            Apply to All Widgets
            <span class="apply-to-all-sub">Colors · Border · Opacity</span>
        </button>
    `;
}
