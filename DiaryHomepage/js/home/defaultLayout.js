import { ZOEY_DEFAULT_LAYOUT } from "./zoeyDefaultLayout.js";
import { DEFAULT_PICTURE_STREAK_PHOTO } from "./defaultPictureStreakPhoto.js";
import { getCurrentUsername } from "../currentUser.js";

// Writes every key of ZOEY's saved layout straight into localStorage, exactly
// as loadLayoutFromServer() does for a server-fetched layout — no scaling,
// no reference-grid conversion, so the result is pixel-identical to ZOEY's.
//
// `seedPhoto` is only true for brand-new accounts (applyDefaultLayout). Picture
// Streak's photo content lives under a per-account key (unlike -layout/-appearance,
// which are shared bare keys synced to the server), so it's handled separately
// instead of being blasted with ZOEY's own baked-in photos on every reset.
function applyZoeyLayout(seedPhoto) {
    Object.entries(ZOEY_DEFAULT_LAYOUT).forEach(([key, value]) => {
        if (key === "picture-streak-widget-state" && value && Array.isArray(value.photos)) {
            const scopedKey = `picture-streak-widget-state::${getCurrentUsername()}`;
            if (seedPhoto && !localStorage.getItem(scopedKey)) {
                localStorage.setItem(scopedKey, JSON.stringify({
                    ...value,
                    photos: [{
                        dataUrl: DEFAULT_PICTURE_STREAK_PHOTO,
                        date: new Date().toISOString().slice(0, 10),
                        caption: ""
                    }]
                }));
            }
            // Reset Layout (seedPhoto=false): leave the account's own photos alone.
            return;
        }
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });
}

// Seed defaults only if no saved data exists (first-time user)
export function applyDefaultLayout() {
    if (!localStorage.getItem("digital-clock-widget-layout")) {
        applyZoeyLayout(true);
    }
}

// Force-overwrite all layout + appearance back to defaults (reset button)
export function resetToDefaultLayout() {
    applyZoeyLayout(false);
}
