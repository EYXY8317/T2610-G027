const STORAGE_KEY = "picture-streak-state";

const SCROLL_INTERVALS = [
    { value: "1h",  label: "Every 1 hour",  ms: 3_600_000 },
    { value: "1d",  label: "Every 1 day",   ms: 86_400_000 },
    { value: "1w",  label: "Every 1 week",  ms: 604_800_000 },
    { value: "1mo", label: "Every 1 month", ms: 2_592_000_000 }
];

const DEFAULT_STATE = {
    displayMode: "single",   // "single" | "scroll"
    showDateLabel: true,
    scrollInterval: "1d",
    photos: [],              // [{ dataUrl, date, caption }]
    currentIndex: 0
};

function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return { ...DEFAULT_STATE };
    }
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
    catch {
        return { ...DEFAULT_STATE };
    }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
}

function formatDate(isoDate) {
    if (!isoDate) {
        return "";
    }
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
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
            <img class="ps-photo" src="${photo.dataUrl}" alt="${photo.caption || ""}">
            ${dateLabel}
        </div>
    `;

}

function renderWidget(state) {

    const { photos, displayMode, showDateLabel, currentIndex } = state;

    if (!photos.length) {
        return `
            <div class="ps-body">
                <div class="ps-placeholder">Upload photos in settings</div>
            </div>
        `;
    }

    if (displayMode === "scroll") {

        const items = photos.map((p, i) =>
            `<div class="ps-scroll-item${i === currentIndex ? " active" : ""}">${
                renderPhoto(p, showDateLabel)
            }</div>`
        ).join("");

        const dots = photos.length > 1
            ? `<div class="ps-dots">${photos.map((_, i) =>
                `<span class="ps-dot${i === currentIndex ? " active" : ""}"></span>`
            ).join("")}</div>`
            : "";

        return `
            <div class="ps-body">
                <div class="ps-scroll-track">${items}</div>
                ${dots}
            </div>
        `;

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

function rerender(state) {
    const content = document.querySelector("#picture-streak-widget .widget-content");
    if (!content) {
        return;
    }
    content.innerHTML = renderWidget(state);
}

function updateState(partial) {
    const next = saveState(partial);
    rerender(next);
    return next;
}

let scrollTimer = null;

function startScrollTimer(state) {

    if (scrollTimer) {
        clearInterval(scrollTimer);
        scrollTimer = null;
    }

    if (state.displayMode !== "scroll" || state.photos.length < 2) {
        return;
    }

    const interval = SCROLL_INTERVALS.find(i => i.value === state.scrollInterval);
    const ms = interval ? interval.ms : 86_400_000;

    scrollTimer = setInterval(() => {
        const cur = getState();
        const next = (cur.currentIndex + 1) % cur.photos.length;
        updateState({ currentIndex: next });
    }, ms);

}

export function createPictureStreakWidget() {
    return `
        <div class="widget" id="picture-streak-widget">
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

export function initializePictureStreak() {

    const widget = document.getElementById("picture-streak-widget");

    if (!widget) {
        return;
    }

    const state = getState();
    rerender(state);
    startScrollTimer(state);

    widget.addEventListener("click", event => {

        const prev = event.target.closest(".ps-prev");
        const next = event.target.closest(".ps-next");
        const cur = getState();

        if (prev && cur.photos.length) {
            const idx = (cur.currentIndex - 1 + cur.photos.length) % cur.photos.length;
            updateState({ currentIndex: idx });
        }

        if (next && cur.photos.length) {
            const idx = (cur.currentIndex + 1) % cur.photos.length;
            updateState({ currentIndex: idx });
        }

    });

}

export function getPictureStreakState() {
    return getState();
}

export function updatePictureStreakState(partial) {
    const next = updateState(partial);
    startScrollTimer(next);
    return next;
}

export function addPictureStreakPhoto(dataUrl, caption = "") {
    const state = getState();
    const photos = [...state.photos, {
        dataUrl,
        date: new Date().toISOString().slice(0, 10),
        caption
    }];
    return updatePictureStreakState({ photos });
}

export function removePictureStreakPhoto(index) {
    const state = getState();
    const photos = state.photos.filter((_, i) => i !== index);
    const currentIndex = Math.min(state.currentIndex, Math.max(0, photos.length - 1));
    return updatePictureStreakState({ photos, currentIndex });
}

export { SCROLL_INTERVALS };
