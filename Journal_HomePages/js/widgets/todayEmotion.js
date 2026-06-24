const STORAGE_KEY = "today-emotion-state";

const MOOD_ICON = { Happy: "😊", Sad: "😢", Angry: "😠" };

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
    showMost: true,
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

function archiveToHistory(state, dateISO) {
    const hasData = state.selectedIndexes.length > 0 || state.sliderValues.some(v => v > 0);
    if (!hasData) return state;
    const history = { ...(state.history || {}) };
    history[dateISO] = {
        selectedIndexes: [...state.selectedIndexes],
        sliderValues:    [...state.sliderValues],
        displayedEmojis: [...state.displayedEmojis]
    };
    return { ...state, history };
}

/* ── Daily Reset ─────────────────────────────────────────── */

function checkDailyReset(state) {

    const now = new Date();
    const resetKey = `te-reset-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${state.resetHour}`;
    const lastReset = localStorage.getItem("today-emotion-last-reset");

    if (lastReset !== resetKey && now.getHours() >= state.resetHour) {

        localStorage.setItem("today-emotion-last-reset", resetKey);

        // Archive previous day before clearing
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const archivedState = archiveToHistory(state, yesterday.toISOString().slice(0, 10));

        const resetState = {
            ...archivedState,
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

    return `
        <div class="te-emoji-row">${buttons}</div>
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
        </div>
    `).join("");

    const dominantIdx = values.reduce((best, v, i) => v > (values[best] || 0) ? i : best, 0);
    const dominantEmoji = state.showMost && values[dominantIdx] > 0 ? emojis[dominantIdx] : null;
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
        <div class="te-pct-popup"></div>
    `;

}

async function updateDiaryMoodBadge(widget) {
    try {
        const resp = await fetch("/diary_moods");
        const moods = await resp.json();
        const today = new Date().toISOString().slice(0, 10);
        const mood = moods[today] || "";
        const el = widget.querySelector(".te-diary-mood");
        if (!el) return;
        if (mood) {
            el.textContent = `${MOOD_ICON[mood] || ""} ${mood}`;
            el.className = `te-diary-mood mood-${mood.toLowerCase()}`;
        } else {
            el.textContent = "";
            el.className = "te-diary-mood";
        }
    } catch {
        // network unavailable — leave badge empty
    }
}

// Emoji sizing that responds to widget width:
//  - select mode: inverse scale (wider → smaller emojis)
//  - slider mode: fixed compact emoji so bar stretches longer
function applyTodayEmotionScale(widget, state) {
    const widgetW = widget.offsetWidth;
    if (!widgetW) return;

    if (state.displayMode === "select") {
        // Inverse: at 200px → ~48px emoji; at 350px → ~28px; wider → stays ~26px
        const emojiPx = Math.max(26, Math.min(48, Math.floor(9600 / widgetW)));
        widget.querySelectorAll(".te-emoji-btn").forEach(btn => {
            btn.style.fontSize = `${emojiPx}px`;
        });
    } else {
        // Slider: fix emoji at 24px so bar (flex:1) claims all the extra width
        widget.querySelectorAll(".te-slider-emoji").forEach(el => {
            el.style.fontSize = "24px";
        });
    }
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

    requestAnimationFrame(() => applyTodayEmotionScale(widget, state));

}

function updateState(partial) {

    const cur = getSavedState();
    const next = archiveToHistory({ ...cur, ...partial }, new Date().toISOString().slice(0, 10));
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

    widget.addEventListener("widgetresize", () => {
        applyTodayEmotionScale(widget, getSavedState());
    });

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

    /* percentage sliders — show popup while dragging, save on release */
    widget.addEventListener("input", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const popup = widget.querySelector(".te-pct-popup");
        if (popup) {
            const pct = Number(slider.value) / 100;
            const rect = slider.getBoundingClientRect();
            popup.textContent = `${slider.value}%`;
            popup.style.left = `${rect.left + pct * rect.width}px`;
            popup.style.top = `${rect.top}px`;
            popup.classList.add("visible");
        }

        // update dominant emoji without rerender
        const cur = getSavedState();
        const emojis = cur.displayedEmojis.slice(0, cur.displayedCount);
        const liveValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const dominantIdx = liveValues.reduce((best, v, j) => v > liveValues[best] ? j : best, 0);
        const dominantEl = widget.querySelector(".te-dominant");
        if (dominantEl) {
            dominantEl.textContent = cur.showMost && liveValues[dominantIdx] > 0
                ? `Most: ${emojis[dominantIdx]}`
                : "";
        }

    });

    window.addEventListener("pointerup", () => {
        const popup = widget.querySelector(".te-pct-popup");
        if (popup) popup.classList.remove("visible");
    });

    widget.addEventListener("change", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const cur = getSavedState();
        const newValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const next = archiveToHistory(
            { ...cur, sliderValues: newValues },
            new Date().toISOString().slice(0, 10)
        );
        saveState(next);

    });

}

export function getTodayEmotionState() {
    return getSavedState();
}

export function updateTodayEmotionState(partial) {
    return updateState(partial);
}
