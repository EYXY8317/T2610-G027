import { userScopedKey } from "../currentUser.js";

// Reuses the "reminder-overlay"/"reminder-card" classes from reminderPopup.js
// for a consistent backdrop + card look, layered with onboarding-specific
// classes for the larger, multi-section layout.

const ONBOARDING_SEEN_KEY = "hasSeenOnboarding";

const HOMEPAGE_WIDGETS = [
    { name: "Digital Clock widgets", desc: "The current time, in your chosen style." },
    { name: "Emotion Today Shortcut widgets", desc: "Quickly log how you're feeling right now." },
    { name: "Weather widgets", desc: "Hourly, daily, and weekly forecasts." },
    { name: "Now Streak / High Streak widgets", desc: "Your current and best journaling streaks." },
    { name: "Picture Streak widgets", desc: "Photo check-ins tied to your streak." },
    { name: "Emotion Summary widgets", desc: "A donut and line chart of your moods over time." },
    { name: "Quote widgets", desc: "A bit of daily inspiration." }
];

const SECTIONS = [
    {
        title: "Homepage Widgets",
        body: `
            <div class="onboarding-widget-grid">
                ${HOMEPAGE_WIDGETS.map(w => `
                    <div class="onboarding-widget-card">
                        <div class="onboarding-widget-name">${w.name}</div>
                        <div class="onboarding-widget-desc">${w.desc}</div>
                    </div>
                `).join("")}
            </div>
        `
    },
    {
        title: "Editing Your Dashboard",
        body: `
            <div class="onboarding-mini-list">
                <div class="onboarding-mini-item"><strong>Right-click a widget</strong> — opens its settings: colors, size, and options like display type.</div>
                <div class="onboarding-mini-item"><strong>⚙ Customize → Edit Layout</strong> — drag a widget to move it, drag its corner to resize, add or remove widgets.</div>
                <div class="onboarding-mini-item"><strong>⚙ Customize → 🌸 Deco</strong> — click any widget to add decorations to it.</div>
                <div class="onboarding-mini-item"><strong>⚙ Customize → Reset / Delete All</strong> — reset widgets to the default layout, or clear them all.</div>
            </div>
        `
    },
    {
        title: "Diary & Streaks",
        body: "Moods logged in the Diary sync here automatically. Streaks count consecutive days with a journal entry."
    }
];

function renderSection({ title, body }) {
    return `
        <div class="onboarding-section">
            <div class="onboarding-section-title">${title}</div>
            <div class="onboarding-section-body">${body}</div>
        </div>
    `;
}

export function showOnboardingGuide() {
    const overlay = document.createElement("div");
    overlay.className = "reminder-overlay onboarding-overlay";
    overlay.innerHTML = `
        <div class="reminder-card onboarding-card">
            <div class="reminder-title">Quick Guide</div>
            <div class="onboarding-sections">
                ${SECTIONS.map(renderSection).join("")}
            </div>
            <div class="reminder-actions">
                <button class="reminder-btn reminder-btn-primary" data-role="confirm">Got it</button>
            </div>
        </div>
    `;
    document.body.append(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-role="confirm"]').addEventListener("click", () => overlay.remove());

    return overlay;
}

function hasSeenOnboarding() {
    return localStorage.getItem(userScopedKey(ONBOARDING_SEEN_KEY)) === "true";
}

function markOnboardingSeen() {
    localStorage.setItem(userScopedKey(ONBOARDING_SEEN_KEY), "true");
}

// Injects the "?" help button into the navbar and, for first-time users on
// this account, auto-opens the guide once. The button itself always opens
// the guide on click regardless of whether it's already been seen.
export function initOnboardingGuide() {
    const navbarRight = document.querySelector(".navbar-right");
    if (!navbarRight || document.getElementById("onboarding-help-btn")) return;

    const helpBtn = document.createElement("button");
    helpBtn.id = "onboarding-help-btn";
    helpBtn.className = "onboarding-help-btn";
    helpBtn.title = "Help & Guide";
    helpBtn.textContent = "?";
    helpBtn.addEventListener("click", () => showOnboardingGuide());

    navbarRight.insertBefore(helpBtn, navbarRight.firstChild);

    if (!hasSeenOnboarding()) {
        showOnboardingGuide();
        markOnboardingSeen();
    }
}
