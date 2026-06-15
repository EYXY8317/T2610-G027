const STORAGE_KEY = "today-emotion-state";

const DEFAULT_EMOJIS = ["😀", "😊", "🙂", "😐", "😔"];

const DEFAULT_STATE = {
    displayMode: "select",          // "select" | "slider"
    displayedEmojis: DEFAULT_EMOJIS,
    displayedCount: 5,
    // select mode
    selectedIndexes: [],
    selectionMode: "single",        // "single" | "multiple"
    selectedEffect: "border",       // "border" | "glow" | "scale"
    // slider mode
    sliderValues: [0, 0, 0, 0, 0], // percentages per emoji
    // shared
    showTitle: true,
    resetHour: 0
};

/* ── Storage ─────────────────────────────────────────────── */

function getSavedState() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return { ...DEFAULT_STATE };
    }

    try {

        const parsed = JSON.parse(raw);

        const displayedEmojis = Array.isArray(parsed.displayedEmojis)
            ? parsed.displayedEmojis.map(e => String(e || "").trim()).filter(Boolean)
            : DEFAULT_EMOJIS;

        const sliderValues = Array.isArray(parsed.sliderValues)
            ? parsed.sliderValues.slice(0, 5).map(v => Number(v) || 0)
            : [0, 0, 0, 0, 0];

        return {
            ...DEFAULT_STATE,
            ...parsed,
            displayedEmojis: displayedEmojis.length
                ? displayedEmojis.slice(0, 5)
                : DEFAULT_EMOJIS,
            displayedCount: Math.min(5, Math.max(1,
                Number(parsed.displayedCount) || DEFAULT_STATE.displayedCount)),
            selectedIndexes: Array.isArray(parsed.selectedIndexes)
                ? parsed.selectedIndexes
                : [],
            sliderValues
        };

    }
    catch {
        return { ...DEFAULT_STATE };
    }

}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ── Daily Reset ─────────────────────────────────────────── */

function checkDailyReset(state) {

    const now = new Date();
    const resetKey = `te-reset-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${state.resetHour}`;
    const lastReset = localStorage.getItem("today-emotion-last-reset");

    if (lastReset !== resetKey && now.getHours() >= state.resetHour) {

        localStorage.setItem("today-emotion-last-reset", resetKey);

        const resetState = {
            ...state,
            selectedIndexes: [],
            sliderValues: [0, 0, 0, 0, 0]
        };

        saveState(resetState);
        return resetState;

    }

    return state;

}


/* ── Render ──────────────────────────────────────────────── */

function renderSelectMode(state) {

    const emojis = state.displayedEmojis.slice(0, state.displayedCount);
    const selected = new Set(state.selectedIndexes);

    const buttons = emojis.map((emoji, i) => {

        const isSelected = selected.has(i);
        const effectClass = isSelected ? `selected effect-${state.selectedEffect}` : "unselected";

        return `
            <button
                type="button"
                class="te-emoji-btn ${effectClass}"
                data-index="${i}"
                aria-pressed="${isSelected}"
            >${emoji}</button>
        `;

    }).join("");

    let summary = "";

    if (state.selectedIndexes.length) {

        const parts = state.selectedIndexes
            .filter(i => i < emojis.length)
            .map(i => emojis[i])
            .join(" ");

        summary = `<div class="te-summary">${parts}</div>`;

    }

    return `
        <div class="te-emoji-row">${buttons}</div>
        ${summary}
    `;

}

function renderSliderMode(state) {

    const emojis = state.displayedEmojis.slice(0, state.displayedCount);
    const values = state.sliderValues.slice(0, state.displayedCount);

    const rows = emojis.map((emoji, i) => `
        <div class="te-slider-row">
            <span class="te-slider-emoji">${emoji}</span>
            <input
                type="range"
                class="te-pct-slider"
                data-index="${i}"
                min="0"
                max="100"
                value="${values[i] || 0}"
            >
            <span class="te-pct-label" data-index="${i}">${values[i] || 0}%</span>
        </div>
    `).join("");

    const dominantIdx = values.reduce((best, v, i) => v > (values[best] || 0) ? i : best, 0);
    const dominantEmoji = values[dominantIdx] > 0 ? emojis[dominantIdx] : null;
    const dominantLine = dominantEmoji
        ? `<div class="te-dominant">Most: ${dominantEmoji}</div>`
        : "";

    return `
        <div class="te-sliders">${rows}</div>
        ${dominantLine}
    `;

}

function renderWidget(state) {

    const contentMarkup = state.displayMode === "slider"
        ? renderSliderMode(state)
        : renderSelectMode(state);

    return `
        <div class="te-card">
            ${contentMarkup}
        </div>
    `;

}

function rerender(state) {

    const widget = document.getElementById("today-emotion-widget");

    if (!widget) {
        return;
    }

    const content = widget.querySelector(".widget-content");

    if (!content) {
        return;
    }

    content.innerHTML = renderWidget(state);

}

function updateState(partial) {

    const next = { ...getSavedState(), ...partial };
    saveState(next);
    rerender(next);
    return next;

}

/* ── Public API ──────────────────────────────────────────── */

export function createTodayEmotionWidget() {
    return `
        <div class="widget" id="today-emotion-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Today Emotion</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeTodayEmotion() {

    const widget = document.getElementById("today-emotion-widget");

    if (!widget) {
        return;
    }

    let state = getSavedState();
    state = checkDailyReset(state);
    rerender(state);

    /* emoji select clicks */
    widget.addEventListener("click", event => {

        const btn = event.target.closest(".te-emoji-btn");

        if (!btn) {
            return;
        }

        const index = Number(btn.dataset.index);
        const cur = getSavedState();

        if (cur.displayMode !== "select") {
            return;
        }

        if (cur.selectionMode === "single") {

            updateState({
                selectedIndexes: [index]
            });

        } else {

            const set = new Set(cur.selectedIndexes);

            if (set.has(index)) {
                set.delete(index);
            } else {
                set.add(index);
            }

            updateState({ selectedIndexes: Array.from(set) });

        }

    });

    /* percentage sliders — update DOM in-place while dragging, save on release */
    widget.addEventListener("input", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const i = Number(slider.dataset.index);
        const lbl = widget.querySelector(`.te-pct-label[data-index="${i}"]`);
        if (lbl) lbl.textContent = `${slider.value}%`;

        // update dominant emoji without rerender
        const cur = getSavedState();
        const emojis = cur.displayedEmojis.slice(0, cur.displayedCount);
        const liveValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const dominantIdx = liveValues.reduce((best, v, j) => v > liveValues[best] ? j : best, 0);
        const dominantEl = widget.querySelector(".te-dominant");
        if (dominantEl) {
            dominantEl.textContent = liveValues[dominantIdx] > 0
                ? `Most: ${emojis[dominantIdx]}`
                : "";
        }

    });

    widget.addEventListener("change", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const cur = getSavedState();
        const newValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const next = { ...cur, sliderValues: newValues };
        saveState(next);

    });

}

export function getTodayEmotionState() {
    return getSavedState();
}

export function updateTodayEmotionState(partial) {
    return updateState(partial);
}
