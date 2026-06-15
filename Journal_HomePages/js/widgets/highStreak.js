const STORAGE_KEY = "high-streak-state";

const DEFAULT_STATE = {
    displayMode: "number",    // "number" | "heatmap"
    celebrationEnabled: true,
    highStreak: 0,
    history: {}               // { "YYYY-MM-DD": true } (same as now-streak)
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

function renderWidget(state) {
    const todayDone = !!state.history[todayKey()];
    const currentStreak = calculateStreak(state.history);
    const high = Math.max(state.highStreak, currentStreak);

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-label">High Streak</div>
                <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
                <div class="hs-current">Current: ${currentStreak} days</div>
                ${renderHeatmap(state.history)}
                <button class="streak-checkin-btn${todayDone ? " done" : ""}" data-widget="high-streak">
                    ${todayDone ? "✓ Done today" : "Check In"}
                </button>
            </div>
        `;
    }

    return `
        <div class="streak-body">
            <div class="streak-label">High Streak</div>
            <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
            <div class="hs-current">Current: ${currentStreak} days</div>
            <button class="streak-checkin-btn${todayDone ? " done" : ""}" data-widget="high-streak">
                ${todayDone ? "✓ Done today" : "Check In"}
            </button>
        </div>
    `;
}

function rerender(state) {
    const content = document.querySelector("#high-streak-widget .widget-content");
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

function triggerCelebration() {
    const widget = document.getElementById("high-streak-widget");
    if (!widget) {
        return;
    }
    widget.classList.add("streak-celebrating");
    setTimeout(() => widget.classList.remove("streak-celebrating"), 600);
}

export function createHighStreakWidget() {
    return `
        <div class="widget" id="high-streak-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>High Streak</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeHighStreak() {
    const widget = document.getElementById("high-streak-widget");
    if (!widget) {
        return;
    }

    rerender(getState());

    widget.addEventListener("click", event => {
        const btn = event.target.closest(".streak-checkin-btn[data-widget='high-streak']");
        if (!btn) {
            return;
        }

        const state = getState();
        const key = todayKey();
        const history = { ...state.history };

        const wasDone = !!history[key];

        if (wasDone) {
            delete history[key];
        } else {
            history[key] = true;
        }

        const newStreak = calculateStreak(history);
        const newHigh = Math.max(state.highStreak, newStreak);
        const isNewRecord = !wasDone && newStreak > state.highStreak;

        updateState({
            history,
            highStreak: newHigh
        });

        if (isNewRecord && state.celebrationEnabled) {
            triggerCelebration();
        }
    });
}

export function getHighStreakState() {
    return getState();
}

export function updateHighStreakState(partial) {
    return updateState(partial);
}
