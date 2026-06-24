const STORAGE_KEY = "high-streak-display";

const DEFAULT_STATE = {
    displayMode:        "number",
    celebrationEnabled: true,
    lastKnownHigh:      0        // persisted so we can detect new records across sessions
};

function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    try { return { ...DEFAULT_STATE, ...JSON.parse(raw) }; }
    catch { return { ...DEFAULT_STATE }; }
}

function saveState(partial) {
    const next = { ...getState(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
}

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

// Current streak: consecutive days ending today (or yesterday)
function calculateStreak(dates) {
    const date = new Date();
    if (!dates.has(date.toISOString().slice(0, 10))) {
        date.setDate(date.getDate() - 1);
    }
    let streak = 0;
    while (true) {
        const key = date.toISOString().slice(0, 10);
        if (!dates.has(key)) break;
        streak++;
        date.setDate(date.getDate() - 1);
    }
    return streak;
}

// Best ever streak across all journal entries
function calculateHighStreak(dates) {
    if (dates.size === 0) return 0;
    const sorted = [...dates].sort();
    let max = 0, cur = 0;
    for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
            cur = 1;
        } else {
            const diff = Math.round(
                (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
            );
            cur = diff === 1 ? cur + 1 : 1;
        }
        if (cur > max) max = cur;
    }
    return max;
}

function renderHeatmap(dates) {
    const weeks = 15;
    const cells = [];
    const today = new Date();
    for (let w = weeks - 1; w >= 0; w--) {
        const col = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (w * 7 + (6 - d)));
            const key = date.toISOString().slice(0, 10);
            col.push(`<div class="streak-cell${dates.has(key) ? " active" : ""}" title="${key}"></div>`);
        }
        cells.push(`<div class="streak-col">${col.join("")}</div>`);
    }
    return `<div class="streak-heatmap">${cells.join("")}</div>`;
}

function renderWidget(dates, state) {
    const high = calculateHighStreak(dates);

    if (state.displayMode === "heatmap") {
        return `
            <div class="streak-body">
                <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
                ${renderHeatmap(dates)}
            </div>`;
    }

    return `
        <div class="streak-body">
            <div class="streak-number">${high}<span class="streak-unit">days best</span></div>
        </div>`;
}

async function fetchJournalDates() {
    try {
        const res  = await fetch("/journal_dates");
        const data = await res.json();
        return new Set(data.dates || []);
    } catch {
        return new Set();
    }
}

function triggerCelebration() {
    const widget = document.getElementById("high-streak-widget");
    if (!widget) return;
    widget.classList.add("streak-celebrating");
    setTimeout(() => widget.classList.remove("streak-celebrating"), 600);
}

function rerender(dates, state) {
    const content = document.querySelector("#high-streak-widget .widget-content");
    if (!content) return;
    content.innerHTML = renderWidget(dates, state);
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

export async function initializeHighStreak() {
    const widget = document.getElementById("high-streak-widget");
    if (!widget) return;

    const dates = await fetchJournalDates();
    const state = getState();
    const high  = calculateHighStreak(dates);

    // Celebrate if we've hit a new record since last session
    if (state.celebrationEnabled && high > state.lastKnownHigh) {
        saveState({ lastKnownHigh: high });
        triggerCelebration();
    }

    rerender(dates, getState());
}

export function getHighStreakState() {
    return getState();
}

export function updateHighStreakState(partial) {
    const next = saveState(partial);
    fetchJournalDates().then(dates => rerender(dates, next));
    return next;
}
