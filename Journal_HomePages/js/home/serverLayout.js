const WIDGET_IDS = [
    "digital-clock-widget",
    "weather-hour-widget",
    "weather-day-widget",
    "weather-week-widget",
    "today-emotion-widget",
    "now-streak-widget",
    "high-streak-widget",
    "picture-streak-widget",
    "emotion-summary-widget",
    "quote-widget",
    "diary-card-widget",
];

// Fetch this user's layout from the server and write it into localStorage.
// Called once on page load before anything renders.
export async function loadLayoutFromServer() {
    try {
        const res = await fetch("/api/home-layout");
        if (!res.ok) return;
        const data = await res.json();
        if (!data || Object.keys(data).length === 0) return;
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });
    } catch {}
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

    const allIds = [...WIDGET_IDS, ...extraIds];
    allIds.forEach(id => {
        const layout     = localStorage.getItem(`${id}-layout`);
        const appearance = localStorage.getItem(`${id}-appearance`);
        const state      = localStorage.getItem(`${id}-state`);
        if (layout)     { try { data[`${id}-layout`]     = JSON.parse(layout);     } catch {} }
        if (appearance) { try { data[`${id}-appearance`] = JSON.parse(appearance); } catch {} }
        if (state)      { try { data[`${id}-state`]      = JSON.parse(state);      } catch {} }
    });
    const hidden = localStorage.getItem("hidden-widgets");
    if (hidden) { try { data["hidden-widgets"] = JSON.parse(hidden); } catch {} }

    return fetch("/api/home-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).catch(() => {});
}
