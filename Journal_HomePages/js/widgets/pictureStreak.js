const SCROLL_INTERVALS = [
    { value: "1h",  label: "Every 1 hour",  ms: 3_600_000 },
    { value: "1d",  label: "Every 1 day",   ms: 86_400_000 },
    { value: "1w",  label: "Every 1 week",  ms: 604_800_000 },
    { value: "1mo", label: "Every 1 month", ms: 2_592_000_000 }
];

const DEFAULT_STATE = {
    displayMode: "single",
    showDateLabel: true,
    scrollInterval: "1d",
    photos: [],
    currentIndex: 0
};

function getStorageKey(id) {
    // Backward compat: first instance may still have data under the old key
    if (id === "picture-streak-widget") {
        const legacy = localStorage.getItem("picture-streak-state");
        const current = localStorage.getItem("picture-streak-widget-state");
        if (legacy && !current) {
            localStorage.setItem("picture-streak-widget-state", legacy);
        }
    }
    return `${id}-state`;
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

export function removePictureStreakPhoto(id, index) {
    const state = getState(id);
    const photos = state.photos.filter((_, i) => i !== index);
    const currentIndex = Math.min(state.currentIndex, Math.max(0, photos.length - 1));
    return updatePictureStreakState(id, { photos, currentIndex });
}

export { SCROLL_INTERVALS };
