const KEY = id => `${id}-appearance`;

const DEFAULTS = {
    backgroundColor: "#ffffff",
    backgroundOpacity: 100,
    titleColor: "#000000",
    contentColor: "#000000",
    showTitle: true,
    showBorder: true,
    contentScale: "3"
};

// 3 = original/default size, 2 = noticeably smaller, 1 = much smaller (more space around content)
const CONTENT_SCALE_MAP = { "1": 0.75, "2": 0.85, "3": 1.0 };

export function getWidgetAppearance(widgetId) {
    const raw = localStorage.getItem(KEY(widgetId));
    if (!raw) return null;
    try {
        return { ...DEFAULTS, ...JSON.parse(raw) };
    }
    catch {
        return null;
    }
}

export function saveWidgetAppearance(widgetId, partial) {
    const current = getWidgetAppearance(widgetId) || { ...DEFAULTS };
    localStorage.setItem(KEY(widgetId), JSON.stringify({ ...current, ...partial }));
}

export function applyWidgetAppearance(widget, app) {
    if (!widget || !app) return;

    // Combine color + opacity into rgba so both are always in sync
    const hex = app.backgroundColor || "#ffffff";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = (app.backgroundOpacity ?? 100) / 100;
    widget.style.background = "";
    widget.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
    widget.style.setProperty("--widget-shadow-a", (a * 0.10).toFixed(3));

    const header = widget.querySelector(".widget-header");
    if (header) {
        header.style.color   = app.titleColor || "";
        header.style.display  = app.showTitle !== false ? "flex" : "none";
    }

    const content = widget.querySelector(".widget-content");
    if (content) {
        content.style.color = app.contentColor || "";
    }

    widget.style.border    = app.showBorder !== false ? "" : "none";
    widget.style.boxShadow = app.showBorder !== false ? "" : "none";

    const cs = CONTENT_SCALE_MAP[app.contentScale] ?? 1;
    widget.style.setProperty("--widget-content-scale", cs);
}
