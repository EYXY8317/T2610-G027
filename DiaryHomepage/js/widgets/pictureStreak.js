import { userScopedKey } from "../currentUser.js";

// "Picture Streak" 组件：让用户上传照片、按日期显示，支持单张切换
// 浏览（上一张/下一张）或自动轮播模式（按设定的时间间隔自动切换）。
// 支持同时存在多个实例（picture-streak-widget、
// picture-streak-widget-2、-3……），每个实例各自独立存自己的照片。
// The "Picture Streak" widget: lets the user upload photos shown by
// date, either browsed one at a time (prev/next buttons) or
// auto-scrolling on a configured time interval. Supports multiple
// simultaneous instances (picture-streak-widget,
// picture-streak-widget-2, -3, ...), each storing its own photos
// independently.

const SCROLL_INTERVALS = [
    { value: "30s", label: "Every 30 seconds", ms: 30_000 },
    { value: "1m",  label: "Every 1 minute",   ms: 60_000 },
    { value: "1h",  label: "Every 1 hour",     ms: 3_600_000 },
    { value: "1d",  label: "Every 1 day",      ms: 86_400_000 },
    { value: "1w",  label: "Every 1 week",     ms: 604_800_000 },
    { value: "1mo", label: "Every 1 month",    ms: 2_592_000_000 }
];

const DEFAULT_STATE = {
    displayMode: "single",
    showDateLabel: true,
    scrollInterval: "1d",
    photos: [],
    currentIndex: 0
};

// 早期版本里，第一个（唯一的）Picture Streak 实例用的 key 是
// "picture-streak-state"（没有 -widget 后缀）；后来改成支持多实例后，
// 每个实例的 key 变成 "<id>-state"。这里做一次性的迁移：如果旧 key
// 有数据、新 key 还没有，就把旧数据复制过去，让老用户的照片不会丢失。
// In an earlier version, the first (only) Picture Streak instance used
// the key "picture-streak-state" (no "-widget" suffix); after multi-
// instance support was added, each instance's key became "<id>-state".
// This does a one-time migration: if the old key has data and the new
// key doesn't yet, the old data is copied over so existing users don't
// lose their photos.
function getStorageKey(id) {
    // Backward compat: first instance may still have data under the old key
    if (id === "picture-streak-widget") {
        const legacy = localStorage.getItem(userScopedKey("picture-streak-state"));
        const current = localStorage.getItem(userScopedKey("picture-streak-widget-state"));
        if (legacy && !current) {
            localStorage.setItem(userScopedKey("picture-streak-widget-state"), legacy);
        }
    }
    return userScopedKey(`${id}-state`);
}

function getState(id) {
    const raw = localStorage.getItem(getStorageKey(id));
    if (!raw) return { ...DEFAULT_STATE };
    try { return { ...DEFAULT_STATE, ...JSON.parse(raw) }; }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(id, partial) {
    const next = { ...getState(id), ...partial };
    localStorage.setItem(getStorageKey(id), JSON.stringify(next));
    return next;
}

function formatDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderPhoto(photo, showDateLabel) {
    if (!photo) {
        return `<div class="ps-placeholder">Upload photos in settings</div>`;
    }
    const dateLabel = showDateLabel && photo.date
        ? `<div class="ps-date-label">${formatDate(photo.date)}</div>`
        : "";
    return `
        <div class="ps-photo-wrap">
            <img class="ps-photo" draggable="false" src="${photo.dataUrl}" alt="${photo.caption || ""}">
            ${dateLabel}
        </div>
    `;
}

// 两种显示模式："scroll"（轮播）把所有照片都渲染进 DOM，用 CSS
// 控制哪一张是 active（可见）的，配合下面的定时器切换；单张模式
// 只渲染当前这一张，配上手动的上一张/下一张按钮。
// Two display modes: "scroll" renders every photo into the DOM at once,
// with CSS controlling which one is "active" (visible), driven by the
// timer below; single mode only renders the current photo, with manual
// prev/next buttons.
function renderWidget(state) {
    const { photos, displayMode, showDateLabel, currentIndex } = state;

    if (!photos.length) {
        return `<div class="ps-body"><div class="ps-placeholder">Upload photos in settings</div></div>`;
    }

    if (displayMode === "scroll") {
        const items = photos.map((p, i) =>
            `<div class="ps-scroll-item${i === currentIndex ? " active" : ""}">${renderPhoto(p, showDateLabel)}</div>`
        ).join("");
        const dots = photos.length > 1
            ? `<div class="ps-dots">${photos.map((_, i) =>
                `<span class="ps-dot${i === currentIndex ? " active" : ""}"></span>`
            ).join("")}</div>`
            : "";
        return `<div class="ps-body"><div class="ps-scroll-track">${items}</div>${dots}</div>`;
    }

    return `
        <div class="ps-body">
            ${renderPhoto(photos[currentIndex] || photos[0], showDateLabel)}
            ${photos.length > 1 ? `
                <div class="ps-nav">
                    <button class="ps-prev">‹</button>
                    <span class="ps-counter">${currentIndex + 1} / ${photos.length}</span>
                    <button class="ps-next">›</button>
                </div>
            ` : ""}
        </div>
    `;
}

function rerender(id, state) {
    const content = document.querySelector(`#${CSS.escape(id)} .widget-content`);
    if (!content) return;
    content.innerHTML = renderWidget(state);
}

function updateState(id, partial) {
    const next = saveState(id, partial);
    rerender(id, next);
    return next;
}

// 每个组件实例（id）自己的自动轮播定时器，用 Map 存起来，方便
// 在设置变动时先清掉旧的定时器再重新开一个（避免同一个组件同时有
// 多个定时器一起跑）。
// Each widget instance (id) gets its own auto-scroll timer, tracked in a
// Map so that whenever settings change, the old timer can be cleared
// before starting a fresh one (avoids the same widget ending up with
// multiple timers running at once).
const scrollTimers = new Map();

function startScrollTimer(id, state) {
    if (scrollTimers.has(id)) {
        clearInterval(scrollTimers.get(id));
        scrollTimers.delete(id);
    }
    if (state.displayMode !== "scroll" || state.photos.length < 2) return;
    const interval = SCROLL_INTERVALS.find(i => i.value === state.scrollInterval);
    const ms = interval ? interval.ms : 86_400_000;
    const timer = setInterval(() => {
        const cur = getState(id);
        const next = (cur.currentIndex + 1) % cur.photos.length;
        updateState(id, { currentIndex: next });
    }, ms);
    scrollTimers.set(id, timer);
}

export function createPictureStreakWidget(id = "picture-streak-widget") {
    return `
        <div class="widget" id="${id}">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Picture Streak</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializePictureStreak(id = "picture-streak-widget") {
    const widget = document.getElementById(id);
    if (!widget) return;
    const state = getState(id);
    rerender(id, state);
    startScrollTimer(id, state);
    widget.addEventListener("click", event => {
        const prev = event.target.closest(".ps-prev");
        const next = event.target.closest(".ps-next");
        const cur = getState(id);
        if (prev && cur.photos.length) {
            updateState(id, { currentIndex: (cur.currentIndex - 1 + cur.photos.length) % cur.photos.length });
        }
        if (next && cur.photos.length) {
            updateState(id, { currentIndex: (cur.currentIndex + 1) % cur.photos.length });
        }
    });
}

export function getPictureStreakState(id = "picture-streak-widget") {
    return getState(id);
}

export function updatePictureStreakState(id, partial) {
    const next = updateState(id, partial);
    startScrollTimer(id, next);
    return next;
}

export function addPictureStreakPhoto(id, dataUrl, caption = "") {
    const state = getState(id);
    const photos = [...state.photos, {
        dataUrl,
        date: new Date().toISOString().slice(0, 10),
        caption
    }];
    return updatePictureStreakState(id, { photos });
}

export function updatePictureStreakPhoto(id, index, dataUrl) {
    const state = getState(id);
    const photos = state.photos.map((p, i) => i === index ? { ...p, dataUrl } : p);
    return updatePictureStreakState(id, { photos });
}

export function removePictureStreakPhoto(id, index) {
    const state = getState(id);
    const photos = state.photos.filter((_, i) => i !== index);
    const currentIndex = Math.min(state.currentIndex, Math.max(0, photos.length - 1));
    return updatePictureStreakState(id, { photos, currentIndex });
}

export { SCROLL_INTERVALS };
