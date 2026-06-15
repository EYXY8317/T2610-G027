const STORAGE_KEY = "now-streak-state";

const STREAK_TYPES = [
    { id: "journal",    label: "Journal Entry" },
    { id: "exercise",   label: "Exercise" },
    { id: "meditation", label: "Meditation" },
    { id: "reading",    label: "Reading" },
    { id: "custom",     label: "Custom" }
];

const DEFAULT_STATE = {
    streakType: "journal",
    customLabel: "My Streak",
    displayMode: "number",   // "number" | "heatmap"
    history: {}              // { "YYYY-MM-DD": true }
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

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function calculateStreak(history) {
    let streak = 0;
    const date = new Date();

    while (true) {
        const key = date.toISOString().slice(0, 10);
        if (!history[key]) {
            break;
        }
        streak++;
        date.setDate(date.getDate() - 1);
    }

    return streak;
}

function renderHeatmap(history) {
    const weeks = 15;
    const cells = [];
    const today = new Date();

    for (let w = weeks - 1; w >= 0; w--) {
        const col = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const key = date.toISOString().slice(0, 10);
            const active = !!history[key];
            col.push(`<div class="streak-cell${active ? " active" : ""}" title="${key}"></div>`);
        }
        cells.push(`<div class="streak-col">${col.join("")}</div>`);
    }

    return `<div class="streak-heatmap">${cells.join("")}</div>`;
}

function getStreakLabel(state) {
    if (state.streakType === "custom") {
        return state.customLabel || "My Streak";
    }
    return STREAK_TYPES.find(t => t.id === state.streakType)?.label || "Streak";
}

function renderWidget(state) {
    const history = state.history || {};
    const streak = calculateStreak(history);
    const label = getStreakLabel(state);
    const todayDone = !!history[todayKey()];

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-label">${label}</div>
                <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
                ${renderHeatmap(history)}
                <button class="streak-checkin-btn${todayDone ? " done" : ""}" data-widget="now-streak">
                    ${todayDone ? "✓ Done today" : "Check In"}
                </button>
            </div>
        `;
    }

    return `
        <div class="streak-body">
            <div class="streak-label">${label}</div>
            <div class="streak-number">${streak}<span class="streak-unit">days</span></div>
            <button class="streak-checkin-btn${todayDone ? " done" : ""}" data-widget="now-streak">
                ${todayDone ? "✓ Done today" : "Check In"}
            </button>
        </div>
    `;
}

function rerender(state) {
    const content = document.querySelector("#now-streak-widget .widget-content");
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

export function createNowStreakWidget() {
    return `
        <div class="widget" id="now-streak-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Now Streak</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeNowStreak() {
    const widget = document.getElementById("now-streak-widget");
    if (!widget) {
        return;
    }

    rerender(getState());

    widget.addEventListener("click", event => {
        const btn = event.target.closest(".streak-checkin-btn[data-widget='now-streak']");
        if (!btn) {
            return;
        }

        const state = getState();
        const key = todayKey();
        const history = { ...state.history };

        if (history[key]) {
            delete history[key];
        } else {
            history[key] = true;
        }

        updateState({ history });
    });
}

export function getNowStreakState() {
    return getState();
}

export function updateNowStreakState(partial) {
    return updateState(partial);
}

export { STREAK_TYPES };
