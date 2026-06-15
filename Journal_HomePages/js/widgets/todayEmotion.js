const STORAGE_KEY = "today-emotion-state";

const DEFAULT_EMOJIS = ["😀", "😊", "🙂", "😐", "😔"];

const MOOD_LABELS = {
    "😀": "Great",
    "😊": "Happy",
    "🙂": "Good",
    "😐": "Neutral",
    "😔": "Sad"
};

const DEFAULT_STATE = {
    emotionType: "emoji",
    selectedMoodIndex: 2,
    selectedMoodIndexes: [2],
    displayedEmojis: DEFAULT_EMOJIS,
    displayedCount: 5,
    emojiSize: 64,
    textSize: 18,
    showTitle: true,
    showCurrentMood: true,
    selectionMode: "single",
    selectedEffect: "border",
    ratingValue: 5,
    customImage: "",
    emojiPercentages: { 0: 100, 1: 0, 2: 0, 3: 0, 4: 0 },
    resetHour: 0
};

function getSavedState() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return { ...DEFAULT_STATE };
    }

    try {

        const parsed = JSON.parse(raw);

        const displayedEmojis = Array.isArray(parsed.displayedEmojis)
            ? parsed.displayedEmojis.map(e => String(e || "").trim()).filter(Boolean)
            : DEFAULT_STATE.displayedEmojis;

        return {
            ...DEFAULT_STATE,
            ...parsed,
            displayedEmojis: displayedEmojis.length
                ? displayedEmojis.slice(0, 5)
                : DEFAULT_STATE.displayedEmojis,
            displayedCount: Math.min(5, Math.max(1,
                Number(parsed.displayedCount) || DEFAULT_STATE.displayedCount)),
            emojiSize: Math.min(120, Math.max(24,
                Number(parsed.emojiSize) || DEFAULT_STATE.emojiSize)),
            textSize: Math.min(50, Math.max(10,
                Number(parsed.textSize) || DEFAULT_STATE.textSize)),
            ratingValue: Math.min(10, Math.max(1,
                Number(parsed.ratingValue) || DEFAULT_STATE.ratingValue)),
            selectedMoodIndexes: Array.isArray(parsed.selectedMoodIndexes)
                ? parsed.selectedMoodIndexes
                : DEFAULT_STATE.selectedMoodIndexes,
            emojiPercentages: parsed.emojiPercentages || DEFAULT_STATE.emojiPercentages,
            resetHour: typeof parsed.resetHour === "number"
                ? parsed.resetHour
                : DEFAULT_STATE.resetHour
        };

    }
    catch {
        return { ...DEFAULT_STATE };
    }

}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function checkDailyReset(state) {

    const now = new Date();
    const resetKey = `today-emotion-reset-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${state.resetHour}`;
    const lastReset = localStorage.getItem("today-emotion-last-reset");

    if (lastReset !== resetKey && now.getHours() >= state.resetHour) {

        localStorage.setItem("today-emotion-last-reset", resetKey);

        const resetState = {
            ...state,
            selectedMoodIndex: 0,
            selectedMoodIndexes: [0],
            emojiPercentages: { 0: 100, 1: 0, 2: 0, 3: 0, 4: 0 },
            ratingValue: 5
        };

        saveState(resetState);

        return resetState;

    }

    return state;

}

function getSelectedIndexes(state) {
    return state.selectionMode === "multiple"
        ? state.selectedMoodIndexes
        : [state.selectedMoodIndex];
}

function getMoodLabel(emoji) {
    return MOOD_LABELS[emoji] || "Mood";
}

function getEffectiveEmojis(state) {
    const values = state.displayedEmojis.slice(0, 5);
    return values.length ? values : DEFAULT_EMOJIS;
}

function normalizePercentages(percentages, selectedIndexes) {

    if (!selectedIndexes.length) {
        return percentages;
    }

    const total = selectedIndexes.reduce(
        (sum, i) => sum + (Number(percentages[i]) || 0),
        0
    );

    if (total === 0) {

        const equal = Math.floor(100 / selectedIndexes.length);
        const remainder = 100 - equal * selectedIndexes.length;
        const result = { ...percentages };

        selectedIndexes.forEach((i, idx) => {
            result[i] = equal + (idx === 0 ? remainder : 0);
        });

        return result;

    }

    return percentages;

}

function renderEmojiButtons(state) {

    const emojis = getEffectiveEmojis(state).slice(0, state.displayedCount);
    const selectedIndexes = new Set(getSelectedIndexes(state));

    return emojis.map((emoji, index) => {

        const isSelected = selectedIndexes.has(index);
        const classes = ["today-emotion-button"];

        if (isSelected) {
            classes.push("selected");
            classes.push(`effect-${state.selectedEffect}`);
        }

        return `
            <button
                type="button"
                class="${classes.join(" ")}"
                data-index="${index}"
                aria-pressed="${isSelected}"
            >
                ${emoji}
            </button>
        `;

    }).join("");

}

function renderPercentageSliders(state) {

    const emojis = getEffectiveEmojis(state).slice(0, state.displayedCount);
    const selectedIndexes = getSelectedIndexes(state);

    if (!selectedIndexes.length) {
        return "";
    }

    const percentages = normalizePercentages(
        state.emojiPercentages,
        selectedIndexes
    );

    const total = selectedIndexes.reduce(
        (sum, i) => sum + (Number(percentages[i]) || 0),
        0
    );

    const sliders = selectedIndexes.map(index => {

        const emoji = emojis[index] || "?";
        const pct = Number(percentages[index]) || 0;

        return `
            <div class="emotion-pct-row">
                <span class="emotion-pct-emoji">${emoji}</span>
                <input
                    type="range"
                    class="emotion-pct-slider"
                    data-index="${index}"
                    min="0"
                    max="100"
                    value="${pct}"
                >
                <span class="emotion-pct-value" data-index="${index}">${pct}%</span>
            </div>
        `;

    }).join("");

    const totalClass = total === 100
        ? "emotion-pct-total ok"
        : "emotion-pct-total error";

    return `
        <div class="emotion-pct-sliders">
            ${sliders}
            <div class="${totalClass}">Total: ${total}%</div>
        </div>
    `;

}

function renderCurrentMood(state) {

    if (!state.showCurrentMood) {
        return "";
    }

    if (state.emotionType === "rating") {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${state.ratingValue} / 10</span>
            </div>
        `;
    }

    if (state.emotionType === "image") {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${state.customImage ? "Custom Image" : "Upload an image in settings"}</span>
            </div>
        `;
    }

    const values = getEffectiveEmojis(state).slice(0, state.displayedCount);
    const selectedIndexes = getSelectedIndexes(state).filter(
        i => i >= 0 && i < values.length
    );

    if (!selectedIndexes.length) {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">No mood selected</span>
            </div>
        `;
    }

    if (state.selectionMode === "multiple" && selectedIndexes.length > 1) {
        const parts = selectedIndexes.map(i => {
            const e = values[i];
            const pct = Number(state.emojiPercentages?.[i]) || 0;
            return `${e} ${pct}%`;
        });

        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${parts.join(" · ")}</span>
            </div>
        `;
    }

    const emoji = values[selectedIndexes[0]];
    const label = getMoodLabel(emoji);

    return `
        <div class="today-emotion-current">
            <span class="today-emotion-current-label">Current Mood</span>
            <span class="today-emotion-current-value">${emoji} ${label}</span>
        </div>
    `;

}

function renderRating(state) {
    return `
        <div class="today-emotion-rating-row">
            <div class="today-emotion-rating-label">
                <span>😡</span>
                <span>1</span>
                <span>●</span>
                <span>10</span>
                <span>😀</span>
            </div>
            <input
                type="range"
                class="today-emotion-rating-slider"
                min="1"
                max="10"
                value="${state.ratingValue}"
            >
            <div class="today-emotion-rating-value">${state.ratingValue}</div>
        </div>
    `;
}

function renderImageMode(state) {
    return `
        <div class="today-emotion-image-mode">
            ${state.customImage
                ? `<img class="today-emotion-image" src="${state.customImage}" alt="Custom mood image">`
                : `<div class="today-emotion-image-placeholder">Upload JPG, PNG or WEBP in settings</div>`
            }
        </div>
    `;
}

function renderWidget(state) {

    const titleMarkup = state.showTitle
        ? `<div class="today-emotion-card-title">Today's Emotion</div>`
        : "";

    let contentMarkup;

    if (state.emotionType === "rating") {

        contentMarkup = renderRating(state);

    } else if (state.emotionType === "image") {

        contentMarkup = renderImageMode(state);

    } else {

        const showSliders = state.selectionMode === "multiple"
            && getSelectedIndexes(state).length > 1;

        contentMarkup = `
            <div class="today-emotion-buttons">
                ${renderEmojiButtons(state)}
            </div>
            ${showSliders ? renderPercentageSliders(state) : ""}
        `;

    }

    return `
        <div class="today-emotion-card">
            ${titleMarkup}
            ${contentMarkup}
            ${renderCurrentMood(state)}
        </div>
    `;

}

function renderTodayEmotionContainer(state) {

    const widget = document.getElementById("today-emotion-widget");

    if (!widget) {
        return;
    }

    widget.style.setProperty("--today-emoji-size", `${state.emojiSize}px`);
    widget.style.setProperty("--today-text-size", `${state.textSize}px`);

    const content = widget.querySelector(".widget-content");

    if (!content) {
        return;
    }

    content.innerHTML = renderWidget(state);

}

function rebalancePercentages(percentages, changedIndex, newValue, selectedIndexes) {

    const others = selectedIndexes.filter(i => i !== changedIndex);

    if (!others.length) {
        const result = { ...percentages };
        result[changedIndex] = 100;
        return result;
    }

    const clamped = Math.max(0, Math.min(100, newValue));
    const remaining = 100 - clamped;

    const oldOthersTotal = others.reduce(
        (sum, i) => sum + (Number(percentages[i]) || 0),
        0
    );

    const result = { ...percentages };
    result[changedIndex] = clamped;

    if (oldOthersTotal === 0) {

        const equal = Math.floor(remaining / others.length);
        const rem = remaining - equal * others.length;

        others.forEach((i, idx) => {
            result[i] = equal + (idx === 0 ? rem : 0);
        });

    } else {

        others.forEach(i => {
            result[i] = Math.round(
                (Number(percentages[i]) || 0) / oldOthersTotal * remaining
            );
        });

        // fix rounding drift
        const actual = selectedIndexes.reduce((s, i) => s + result[i], 0);
        const drift = 100 - actual;

        if (drift !== 0) {
            result[others[0]] = Math.max(0, result[others[0]] + drift);
        }

    }

    return result;

}

function updateState(partial) {

    const state = { ...getSavedState(), ...partial };

    if (state.selectionMode === "single") {
        state.selectedMoodIndexes = [state.selectedMoodIndex];
    }

    if (state.selectionMode === "multiple") {
        state.selectedMoodIndex = state.selectedMoodIndexes[0] ?? state.selectedMoodIndex;
    }

    if (state.displayedEmojis.length < 5) {
        state.displayedEmojis = [
            ...state.displayedEmojis,
            ...DEFAULT_EMOJIS
        ].slice(0, 5);
    }

    saveState(state);
    renderTodayEmotionContainer(state);
    return state;

}

export function createTodayEmotionWidget() {
    return `
        <div class="widget" id="today-emotion-widget">
            <div class="drag-handle" id="today-emotion-drag-handle">
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
            <div class="widget-content" id="today-emotion-content">
                Loading...
            </div>
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
    renderTodayEmotionContainer(state);

    widget.addEventListener("click", event => {

        const button = event.target.closest(".today-emotion-button");

        if (!button) {
            return;
        }

        const index = Number(button.dataset.index);
        const currentState = getSavedState();

        if (currentState.emotionType !== "emoji") {
            return;
        }

        if (currentState.selectionMode === "single") {

            const percentages = { ...currentState.emojiPercentages };

            for (const k of Object.keys(percentages)) {
                percentages[k] = 0;
            }

            percentages[index] = 100;

            updateState({
                selectedMoodIndex: index,
                selectedMoodIndexes: [index],
                emojiPercentages: percentages
            });

        } else {

            const selectedMoodIndexes = new Set(currentState.selectedMoodIndexes);

            if (selectedMoodIndexes.has(index)) {
                selectedMoodIndexes.delete(index);
            } else {
                selectedMoodIndexes.add(index);
            }

            const newIndexes = Array.from(selectedMoodIndexes);

            let percentages = { ...currentState.emojiPercentages };
            percentages[index] = 0;
            percentages = normalizePercentages(percentages, newIndexes);

            updateState({
                selectedMoodIndexes: newIndexes,
                selectedMoodIndex: newIndexes[0] ?? index,
                emojiPercentages: percentages
            });

        }

    });

    widget.addEventListener("input", event => {

        const ratingSlider = event.target.closest(".today-emotion-rating-slider");

        if (ratingSlider) {
            updateState({ ratingValue: Number(ratingSlider.value) });
            return;
        }

        const pctSlider = event.target.closest(".emotion-pct-slider");

        if (pctSlider) {

            const changedIndex = Number(pctSlider.dataset.index);
            const newValue = Number(pctSlider.value);
            const currentState = getSavedState();
            const selectedIndexes = getSelectedIndexes(currentState);

            const pctValueEl = widget.querySelector(
                `.emotion-pct-value[data-index="${changedIndex}"]`
            );

            const newPercentages = rebalancePercentages(
                currentState.emojiPercentages,
                changedIndex,
                newValue,
                selectedIndexes
            );

            if (pctValueEl) {
                pctValueEl.textContent = `${newPercentages[changedIndex]}%`;
            }

            // update sibling sliders live
            selectedIndexes.forEach(i => {
                if (i !== changedIndex) {
                    const sibling = widget.querySelector(
                        `.emotion-pct-slider[data-index="${i}"]`
                    );
                    const siblingValue = widget.querySelector(
                        `.emotion-pct-value[data-index="${i}"]`
                    );

                    if (sibling) {
                        sibling.value = newPercentages[i];
                    }

                    if (siblingValue) {
                        siblingValue.textContent = `${newPercentages[i]}%`;
                    }
                }
            });

            const total = selectedIndexes.reduce(
                (s, i) => s + (newPercentages[i] || 0),
                0
            );

            const totalEl = widget.querySelector(".emotion-pct-total");

            if (totalEl) {
                totalEl.textContent = `Total: ${total}%`;
                totalEl.className = total === 100
                    ? "emotion-pct-total ok"
                    : "emotion-pct-total error";
            }

            updateState({ emojiPercentages: newPercentages });

        }

    });

}

export function getTodayEmotionState() {
    return getSavedState();
}

export function updateTodayEmotionState(partial) {
    return updateState(partial);
}
