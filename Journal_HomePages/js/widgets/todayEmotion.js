const STORAGE_KEY = "today-emotion-state";

const DEFAULT_EMOJIS = [
    "😀",
    "😊",
    "🙂",
    "😐",
    "😔"
];

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
    customImage: ""
};

function getSavedState() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return { ...DEFAULT_STATE };
    }

    try {
        const parsed = JSON.parse(raw);

        const displayedEmojis = Array.isArray(parsed.displayedEmojis)
            ? parsed.displayedEmojis.map(emoji => String(emoji || "").trim()).filter(Boolean)
            : DEFAULT_STATE.displayedEmojis;

        const state = {
            ...DEFAULT_STATE,
            ...parsed,
            displayedEmojis: displayedEmojis.length
                ? displayedEmojis.slice(0, 5)
                : DEFAULT_STATE.displayedEmojis,
            displayedCount: Math.min(
                5,
                Math.max(1, Number(parsed.displayedCount) || DEFAULT_STATE.displayedCount)
            ),
            emojiSize: Math.min(120, Math.max(24, Number(parsed.emojiSize) || DEFAULT_STATE.emojiSize)),
            textSize: Math.min(50, Math.max(10, Number(parsed.textSize) || DEFAULT_STATE.textSize)),
            ratingValue: Math.min(10, Math.max(1, Number(parsed.ratingValue) || DEFAULT_STATE.ratingValue)),
            selectionMode: parsed.selectionMode || DEFAULT_STATE.selectionMode,
            selectedEffect: parsed.selectedEffect || DEFAULT_STATE.selectedEffect,
            emotionType: parsed.emotionType || DEFAULT_STATE.emotionType,
            showTitle: parsed.showTitle !== undefined ? parsed.showTitle : DEFAULT_STATE.showTitle,
            showCurrentMood: parsed.showCurrentMood !== undefined ? parsed.showCurrentMood : DEFAULT_STATE.showCurrentMood,
            customImage: parsed.customImage || DEFAULT_STATE.customImage
        };

        if (!Array.isArray(state.selectedMoodIndexes)) {
            state.selectedMoodIndexes = DEFAULT_STATE.selectedMoodIndexes;
        }

        if (typeof state.selectedMoodIndex !== "number") {
            state.selectedMoodIndex = DEFAULT_STATE.selectedMoodIndex;
        }

        return state;
    }
    catch (error) {
        console.warn("Failed to parse today emotion state:", error);
        return { ...DEFAULT_STATE };
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

    return values.length
        ? values
        : DEFAULT_EMOJIS;
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
        if (!state.customImage) {
            return `
                <div class="today-emotion-current">
                    <span class="today-emotion-current-label">Current Mood</span>
                    <span class="today-emotion-current-value">Upload an image in settings</span>
                </div>
            `;
        }

        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">Custom Image</span>
            </div>
        `;
    }

    const values = getEffectiveEmojis(state).slice(0, state.displayedCount);
    const selectedIndexes = getSelectedIndexes(state).filter(index => index >= 0 && index < values.length);

    if (!selectedIndexes.length) {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">No mood selected</span>
            </div>
        `;
    }

    const firstIndex = selectedIndexes[0];
    const emoji = values[firstIndex] || values[0];
    const label = getMoodLabel(emoji);

    if (state.selectionMode === "multiple" && selectedIndexes.length > 1) {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${emoji} ${label} +${selectedIndexes.length - 1} more</span>
            </div>
        `;
    }

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

    const contentMarkup = state.emotionType === "rating"
        ? renderRating(state)
        : state.emotionType === "image"
            ? renderImageMode(state)
            : `
                <div class="today-emotion-buttons">
                    ${renderEmojiButtons(state)}
                </div>
            `;

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

function updateState(partial) {
    const state = {
        ...getSavedState(),
        ...partial
    };

    if (state.selectionMode === "single") {
        state.selectedMoodIndexes = [state.selectedMoodIndex];
    }

    if (state.selectionMode === "multiple") {
        state.selectedMoodIndex = state.selectedMoodIndexes[0] ?? state.selectedMoodIndex;
    }

    if (state.displayedEmojis.length < 5) {
        state.displayedEmojis = [...state.displayedEmojis, ...DEFAULT_EMOJIS].slice(0, 5);
    }

    saveState(state);
    renderTodayEmotionContainer(state);
    return state;
}

export function createTodayEmotionWidget() {
    return `
        <div
            class="widget"
            id="today-emotion-widget"
        >
            <div
                class="drag-handle"
                id="today-emotion-drag-handle"
            >
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>
                    Today Emotion
                </span>
            </div>
            <div
                class="widget-content"
                id="today-emotion-content"
            >
                Loading...
            </div>
            <div class="resize-handle">
                ↘
            </div>
        </div>
    `;
}

export function initializeTodayEmotion() {
    const widget = document.getElementById("today-emotion-widget");
    if (!widget) {
        return;
    }

    const state = getSavedState();
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
            updateState({
                selectedMoodIndex: index,
                selectedMoodIndexes: [index]
            });
        }
        else {
            const selectedMoodIndexes = new Set(currentState.selectedMoodIndexes);
            if (selectedMoodIndexes.has(index)) {
                selectedMoodIndexes.delete(index);
            }
            else {
                selectedMoodIndexes.add(index);
            }

            updateState({
                selectedMoodIndexes: Array.from(selectedMoodIndexes),
                selectedMoodIndex: Array.from(selectedMoodIndexes)[0] ?? index
            });
        }
    });

    widget.addEventListener("input", event => {
        const slider = event.target.closest(".today-emotion-rating-slider");
        if (!slider) {
            return;
        }

        updateState({
            ratingValue: Number(slider.value)
        });
    });
}

export function getTodayEmotionState() {
    return getSavedState();
}

export function updateTodayEmotionState(partial) {
    return updateState(partial);
}
