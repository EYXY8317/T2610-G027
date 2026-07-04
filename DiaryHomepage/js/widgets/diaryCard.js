import {
    getWidgetAppearance,
    applyWidgetAppearance
} from "../settings/appearance/widgetAppearance.js";
import { userScopedKey } from "../currentUser.js";

// "Diary"组件：首页上用来快速跳转到日记页面的卡片，可以选择三种
// 封面图案（书皮），并且有两种显示模式——"button"（显示封面+标题+
// 简介+"打开日记"按钮）或"direct"（只显示一张铺满整个卡片的封面图，
// 点击卡片任何地方都能直接跳转，更简洁）。
// The "Diary" widget: a card on the home page for quickly jumping to the
// diary page, with a choice of three cover designs (book skins) and two
// display modes — "button" (shows the cover + title + blurb + an "Open
// Diary" button) or "direct" (shows just a full-card cover image, where
// clicking anywhere on the card jumps straight to the diary — a more
// minimal look).

export const BOOK_OPTIONS = [
    { label: "Black Classic",   src: "/diary_home_static/assets/books/book1.png", scale: 0.88 },
    { label: "Pink Strawberry", src: "/diary_home_static/assets/books/book2.png", scale: 0.78 },
    { label: "Brown Leather",   src: "/diary_home_static/assets/books/book3.png", scale: 0.88 },
];

const STORAGE_KEY = "diary-card-state";

const DEFAULT_STATE = {
    activeBook: 0,
    mode: "button"
};

function getState() {
    const raw = localStorage.getItem(userScopedKey(STORAGE_KEY));
    if (!raw) return { ...DEFAULT_STATE };
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(userScopedKey(STORAGE_KEY), JSON.stringify(next));
    return next;
}

function renderContent(state) {
    const book = BOOK_OPTIONS[state.activeBook] || BOOK_OPTIONS[0];
    const scaleStyle = book.scale ? ` style="transform:scale(${book.scale});transform-origin:center;"` : "";

    if (state.mode === "direct") {
        return `
            <div class="dc-body dc-direct">
                <div class="dc-cover dc-cover-full">
                    <img class="dc-cover-img" src="${book.src}" alt="${book.label}"${scaleStyle}>
                </div>
            </div>
        `;
    }

    return `
        <div class="dc-body">
            <div class="dc-cover">
                <img class="dc-cover-img" src="${book.src}" alt="${book.label}"${scaleStyle}>
            </div>
            <div class="dc-info">
                <h2 class="dc-title">Diary</h2>
                <div class="dc-divider"></div>
                <p class="dc-subtitle">Your personal space to write, reflect and grow.</p>
                <a class="dc-btn" href="/diary">Open Diary →</a>
            </div>
        </div>
    `;
}

function attachDirectClick(content) {
    const body = content.querySelector(".dc-body.dc-direct");
    if (body) {
        body.addEventListener("click", () => {
            window.location.href = "/diary";
        });
    }
}

export function createDiaryCardWidget() {
    return `
        <div class="widget" id="diary-card-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header"><span>Diary</span></div>
            <div class="widget-content" id="diary-card-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeDiaryCard() {
    const content = document.getElementById("diary-card-content");
    if (!content) return;

    const state = getState();
    content.innerHTML = renderContent(state);
    attachDirectClick(content);
}

export function getDiaryCardState() {
    return getState();
}

export function updateDiaryCardState(partial) {
    const next = saveState(partial);
    const content = document.getElementById("diary-card-content");
    if (content) {
        content.innerHTML = renderContent(next);
        attachDirectClick(content);
    }
    const widgetEl = document.getElementById("diary-card-widget");
    const savedApp = getWidgetAppearance("diary-card-widget");
    if (widgetEl && savedApp) applyWidgetAppearance(widgetEl, savedApp);
    return next;
}
