import { widgets } from "./widgetRegistry.js";
import { getHiddenWidgets } from "../home/widgetVisibility.js";
import { getExtraPictureInstances } from "../home/addWidgetPanel.js";
import { createPictureStreakWidget } from "./pictureStreak.js";

export function renderWidgets() {
    const hidden = getHiddenWidgets();
    const base = widgets
        .filter(w => !hidden.includes(`${w.id}-widget`))
        .map(w => w.create())
        .join("");

    const extras = getExtraPictureInstances()
        .map(id => createPictureStreakWidget(id))
        .join("");

    return base + extras;
}
