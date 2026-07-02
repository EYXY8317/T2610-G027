let _username = null;

// Fetches the logged-in username from the server so client-side storage
// (mood/emotion widgets) can be namespaced per user and never leak
// between accounts sharing the same browser. Server-rendered pages (e.g.
// the diary page) can skip the network round trip by setting
// window.__CURRENT_USERNAME__ before this module runs.
export async function loadCurrentUser() {
    if (typeof window !== "undefined" && window.__CURRENT_USERNAME__) {
        _username = window.__CURRENT_USERNAME__;
        return _username;
    }
    try {
        const res = await fetch("/api/whoami");
        const data = await res.json();
        _username = data.username || "guest";
    } catch {
        _username = "guest";
    }
    return _username;
}

export function getCurrentUsername() {
    if (typeof window !== "undefined" && window.__CURRENT_USERNAME__) {
        return window.__CURRENT_USERNAME__;
    }
    return _username || "guest";
}

export function userScopedKey(baseKey) {
    return `${baseKey}::${getCurrentUsername()}`;
}

// All widget ids that can have per-widget localStorage caches (layout position/size,
// appearance/colors, and non-appearance "state"). Kept here so the sweep below and
// serverLayout.js agree on the same list.
export const JOURNAL_WIDGET_IDS = [
    "digital-clock-widget", "weather-hour-widget", "weather-day-widget", "weather-week-widget",
    "today-emotion-widget", "now-streak-widget", "high-streak-widget", "picture-streak-widget",
    "emotion-summary-widget", "quote-widget", "diary-card-widget"
];

// Bare (unscoped) keys that historically held per-account diary/journal data or
// still do for values that aren't tied to a specific widget id.
const JOURNAL_BARE_KEYS = [
    "diaryPaperType", "hidden-widgets", "active-template", "picture-streak-extra-instances",
    // legacy/unscoped fallbacks from before individual widgets were namespaced
    "quote-state", "diary-card-state", "high-streak-display", "now-streak-display", "picture-streak-state"
];

// Removes every locally-cached diary/journal widget value (layout, appearance, state,
// decorations) plus the diary editor's own unscoped preferences. Called whenever the
// logged-in account on this browser changes, so a new/different user never inherits
// another account's cached UI state, widget content, or diary preferences.
export function clearJournalLocalCache() {
    if (typeof localStorage === "undefined") return;

    let extraIds = [];
    try { extraIds = JSON.parse(localStorage.getItem("picture-streak-extra-instances")) || []; } catch {}

    [...JOURNAL_WIDGET_IDS, ...extraIds].forEach(id => {
        localStorage.removeItem(`${id}-layout`);
        localStorage.removeItem(`${id}-appearance`);
        localStorage.removeItem(`${id}-state`);
    });

    JOURNAL_BARE_KEYS.forEach(k => localStorage.removeItem(k));

    // Template-scoped decoration items are stored as "<template>:<widgetId>-deco" and
    // per-date canvas heights as "diary-canvas-height-<date>" — sweep by pattern since
    // template names / dates aren't enumerable up front.
    Object.keys(localStorage).forEach(key => {
        if (/:.+-deco$/.test(key) || key.startsWith("diary-canvas-height-")) {
            localStorage.removeItem(key);
        }
    });
}

// Compares the resolved username against the last account seen on this browser
// (tracked in a small unscoped pointer key — it holds only a username, no content).
// On mismatch, wipes all cached diary/journal localStorage so the newly active
// account starts from a clean slate instead of inheriting the previous account's
// widget state, layout, or diary preferences. Safe/no-op for repeat visits by the
// same account, so normal same-user page refreshes are unaffected.
const ACTIVE_USER_POINTER = "__lp_active_journal_user__";

export function ensureUserScopeFresh() {
    if (typeof localStorage === "undefined") return;
    const current = getCurrentUsername();
    const last = localStorage.getItem(ACTIVE_USER_POINTER);
    if (last !== current) {
        clearJournalLocalCache();
        localStorage.setItem(ACTIVE_USER_POINTER, current);
    }
}
