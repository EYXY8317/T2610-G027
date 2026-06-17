// Default layout and appearance applied once for first-time users.
// Each entry is only written if no saved data exists for that widget.
//
// Layout philosophy (1440px wide screen):
//   Left col  (x:30,  w:460) — personal / emotion widgets
//   Mid-left  (x:508, w:200) — weather snapshot + photo
//   Mid-right (x:726, w:460) — weather details (needs width)
//   Sidebar   (x:1204,w:220) — quote accent

const DEFAULTS = [

    // ── Digital Clock ─────────────────────────────────────────
    // Hero: time floats directly on the parchment background
    {
        id: "digital-clock-widget",
        layout:     { left: "30px",  top: "24px",  width: "460px", height: "110px" },
        appearance: { backgroundColor: "#ffffff", backgroundOpacity: 0,
                      showTitle: false, showBorder: false,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Today Emotion ─────────────────────────────────────────
    // Below clock, same width — personal daily check-in
    {
        id: "today-emotion-widget",
        layout:     { left: "30px",  top: "152px", width: "460px", height: "200px" },
        appearance: { backgroundColor: "#f5f3ef", backgroundOpacity: 100,
                      showTitle: true,  showBorder: true,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Now Streak ────────────────────────────────────────────
    // Dark ink card — maximum contrast against the parchment bg
    {
        id: "now-streak-widget",
        layout:     { left: "30px",  top: "370px", width: "214px", height: "170px" },
        appearance: { backgroundColor: "#1a1a1a", backgroundOpacity: 100,
                      showTitle: false, showBorder: false,
                      titleColor: "#F2EFE9", contentColor: "#F2EFE9" }
    },

    // ── High Streak ───────────────────────────────────────────
    // Beside Now Streak — white/dark pair reads as a visual unit
    {
        id: "high-streak-widget",
        layout:     { left: "260px", top: "370px", width: "220px", height: "170px" },
        appearance: { backgroundColor: "#ffffff", backgroundOpacity: 100,
                      showTitle: true,  showBorder: true,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Weather Day ───────────────────────────────────────────
    // Compact warm card in the mid-left slot — icon + temp at a glance
    {
        id: "weather-day-widget",
        layout:     { left: "508px", top: "24px",  width: "200px", height: "260px" },
        appearance: { backgroundColor: "#fffbee", backgroundOpacity: 100,
                      showTitle: false, showBorder: true,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Picture Streak ────────────────────────────────────────
    // Below Weather Day — photos fill the frame, no chrome
    {
        id: "picture-streak-widget",
        layout:     { left: "508px", top: "302px", width: "200px", height: "350px" },
        appearance: { backgroundColor: "#ffffff", backgroundOpacity: 0,
                      showTitle: false, showBorder: false,
                      titleColor: "#ffffff", contentColor: "#ffffff" }
    },

    // ── Weather Week ──────────────────────────────────────────
    // Wide table — needs horizontal space, top of mid-right column
    {
        id: "weather-week-widget",
        layout:     { left: "726px", top: "24px",  width: "460px", height: "260px" },
        appearance: { backgroundColor: "#ffffff", backgroundOpacity: 100,
                      showTitle: true,  showBorder: true,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Weather Hour ──────────────────────────────────────────
    // Below Week — borderless so the graph line bleeds to the edges
    {
        id: "weather-hour-widget",
        layout:     { left: "726px", top: "302px", width: "460px", height: "210px" },
        appearance: { backgroundColor: "#f5f3ef", backgroundOpacity: 100,
                      showTitle: true,  showBorder: false,
                      titleColor: "#888888", contentColor: "#555555" }
    },

    // ── Emotion Summary ───────────────────────────────────────
    // Bottom of mid-right — calendar of emotion dots
    {
        id: "emotion-summary-widget",
        layout:     { left: "726px", top: "530px", width: "460px", height: "270px" },
        appearance: { backgroundColor: "#F2EFE9", backgroundOpacity: 100,
                      showTitle: true,  showBorder: true,
                      titleColor: "#1a1a1a", contentColor: "#1a1a1a" }
    },

    // ── Quote ─────────────────────────────────────────────────
    // Right sidebar: tall parchment strip, no border — quote floats on the bg
    {
        id: "quote-widget",
        layout:     { left: "1204px", top: "24px", width: "220px", height: "640px" },
        appearance: { backgroundColor: "#F2EFE9", backgroundOpacity: 100,
                      showTitle: false, showBorder: false,
                      titleColor: "#888888", contentColor: "#888888" }
    },

];

function getNavbarHeight() {
    const nav = document.querySelector('.navbar');
    return nav ? nav.offsetHeight : 0;
}

function adjustedLayout(layout) {
    const navH = getNavbarHeight();
    return { ...layout, top: (parseInt(layout.top) + navH) + 'px' };
}

// Seed defaults only if no saved data exists (first-time user)
export function applyDefaultLayout() {
    DEFAULTS.forEach(({ id, layout, appearance }) => {
        if (!localStorage.getItem(`${id}-layout`)) {
            localStorage.setItem(`${id}-layout`, JSON.stringify(adjustedLayout(layout)));
        }
        if (!localStorage.getItem(`${id}-appearance`)) {
            localStorage.setItem(`${id}-appearance`, JSON.stringify(appearance));
        }
    });
}

// Force-overwrite all layout + appearance back to defaults (reset button)
export function resetToDefaultLayout() {
    DEFAULTS.forEach(({ id, layout, appearance }) => {
        localStorage.setItem(`${id}-layout`, JSON.stringify(adjustedLayout(layout)));
        localStorage.setItem(`${id}-appearance`, JSON.stringify(appearance));
    });
}
