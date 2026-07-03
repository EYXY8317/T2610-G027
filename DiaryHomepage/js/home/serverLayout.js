import { JOURNAL_WIDGET_IDS as WIDGET_IDS } from "../currentUser.js";

function getActiveTemplate() {
    return localStorage.getItem("active-template") || "cozy-dashboard";
}

// Fetch this user's layout from the server and write it into localStorage.
// Returns true if server had saved data (existing user), false if new/empty (first-time user).
export async function loadLayoutFromServer() {
    try {
        const res = await fetch("/api/home-layout");
        if (!res.ok) return false;
        const data = await res.json();
        if (!data || Object.keys(data).length === 0) return false;
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });
        return true;
    } catch {
        return false;
    }
}

// Push all layout / appearance / hidden state from localStorage up to the server.
// Returns a Promise (callers can await if they need to before a reload).
export function syncLayoutToServer() {
    const data = {};

    // Extra picture streak instances
    const extraKey = "picture-streak-extra-instances";
    const extraRaw = localStorage.getItem(extraKey);
    const extraIds = extraRaw ? (() => { try { return JSON.parse(extraRaw); } catch { return []; } })() : [];
    if (extraRaw) { try { data[extraKey] = JSON.parse(extraRaw); } catch {} }

    const activeTemplate = getActiveTemplate();
    const allIds = [...WIDGET_IDS, ...extraIds];
    allIds.forEach(id => {
        const layout     = localStorage.getItem(`${id}-layout`);
        const appearance = localStorage.getItem(`${id}-appearance`);
        const state      = localStorage.getItem(`${id}-state`);
        const deco       = localStorage.getItem(`${activeTemplate}:${id}-deco`);
        if (layout)     { try { data[`${id}-layout`]     = JSON.parse(layout);     } catch {} }
        if (appearance) { try { data[`${id}-appearance`] = JSON.parse(appearance); } catch {} }
        if (state)      { try { data[`${id}-state`]      = JSON.parse(state);      } catch {} }
        if (deco)       { try { data[`${activeTemplate}:${id}-deco`] = JSON.parse(deco); } catch {} }
    });
    const hidden = localStorage.getItem("hidden-widgets");
    if (hidden) { try { data["hidden-widgets"] = JSON.parse(hidden); } catch {} }
    const activeTpl = localStorage.getItem("active-template");
    if (activeTpl) { data["active-template"] = activeTpl; }

    return fetch("/api/home-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).catch(() => {});
}
