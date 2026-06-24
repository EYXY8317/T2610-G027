import { pushHistory } from "../../home/historyManager.js";

const KEY = id => `${id}-appearance`;

let _debounceTimer  = null;
let _debounceBefore = null;
let _debounceWid    = null;

const DEFAULTS = {
    backgroundColor: "#ffffff",
    backgroundOpacity: 100,
    titleColor: "#000000",
    contentColor: "#000000",
    borderColor: "#ddd8cf",
    borderWidth: 1.5,
    showTitle: true,
    titleAlign: "left",
    titleScale: "3",
    showBorder: true,
    contentScale: "3"
};

// 3 = original/default size, 2 = noticeably smaller, 1 = much smaller (more space around content)
const CONTENT_SCALE_MAP = { "1": 0.75, "2": 0.85, "3": 1.0 };
const TITLE_SCALE_MAP   = { "1": 0.75, "2": 0.85, "3": 1.0 };

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
    const next    = { ...current, ...partial };
    localStorage.setItem(KEY(widgetId), JSON.stringify(next));

    // Debounced history: rapid slider drags collapse into one entry
    if (_debounceWid !== widgetId) {
        _debounceBefore = current;
        _debounceWid    = widgetId;
    }
    if (!_debounceBefore) _debounceBefore = current;

    const before = _debounceBefore;
    const after  = next;
    const wid    = widgetId;

    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
        if (JSON.stringify(before) !== JSON.stringify(after)) {
            pushHistory({
                revert() {
                    localStorage.setItem(KEY(wid), JSON.stringify(before));
                    const w = document.getElementById(wid);
                    if (w) applyWidgetAppearance(w, before);
                },
                apply() {
                    localStorage.setItem(KEY(wid), JSON.stringify(after));
                    const w = document.getElementById(wid);
                    if (w) applyWidgetAppearance(w, after);
                }
            });
        }
        _debounceBefore = null;
        _debounceWid    = null;
        _debounceTimer  = null;
    }, 800);
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
        header.style.color          = app.titleColor || "";
        header.style.display        = app.showTitle !== false ? "flex" : "none";
        header.style.justifyContent = app.titleAlign === "center" ? "center" : "";
    }

    const content = widget.querySelector(".widget-content");
    if (content) {
        content.style.color = app.contentColor || "";
    }

    const dcBtn = widget.querySelector(".dc-btn");
    if (dcBtn) {
        dcBtn.style.backgroundColor = app.titleColor || "";
        dcBtn.style.color = app.titleColor ? "#fff" : "";
    }

    if (app.showBorder !== false) {
        widget.style.border    = `${app.borderWidth ?? 1.5}px solid ${app.borderColor || "#ddd8cf"}`;
        widget.style.boxShadow = "";
    } else {
        widget.style.border    = "none";
        widget.style.boxShadow = "none";
    }

    const cs = CONTENT_SCALE_MAP[app.contentScale] ?? 1;
    widget.style.setProperty("--widget-content-scale", cs);

    const ts = TITLE_SCALE_MAP[app.titleScale] ?? 1;
    widget.style.setProperty("--widget-title-size-scale", ts);
}
