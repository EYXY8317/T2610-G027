import { applyTemplate } from "./layoutTemplates.js";

// Seed defaults only if no saved data exists (first-time user)
export function applyDefaultLayout() {
    if (!localStorage.getItem("digital-clock-widget-layout")) {
        applyTemplate("cozy-dashboard");
    }
}

// Force-overwrite all layout + appearance back to defaults (reset button)
export function resetToDefaultLayout() {
    applyTemplate("cozy-dashboard");
}
