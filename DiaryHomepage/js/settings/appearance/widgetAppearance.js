import { pushHistory } from "../../home/historyManager.js";

// 每个组件的"外观"设置（背景色、透明度、标题/内容颜色、边框、缩放
// 比例等）统一存取的地方。所有外观设置面板（颜色选择器、滑块等）
// 都通过这里读取/保存数据，再由 applyWidgetAppearance() 把这些设置
// 真正应用到组件的 DOM 上。
// Central get/save point for each widget's "appearance" settings
// (background color, opacity, title/content color, border, scale, etc).
// Every appearance settings panel (color pickers, sliders) reads/writes
// through here, and applyWidgetAppearance() is what actually applies
// those settings onto the widget's DOM.

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
// 3 = 原始/默认大小，2 = 明显缩小，1 = 更小（内容周围留白更多）
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

// 保存外观设置，并且用"防抖"（debounce）方式记录一条撤销/重做历史：
// 拖动颜色滑块时会连续触发很多次保存，如果每次都记一条历史，撤销一次
// 只会退回一点点、要按很多次撤销才能回到拖动前的样子。这里用
// setTimeout 等待 800 毫秒没有新的变动，才把"这次拖动前 -> 拖动后"
// 合并成一条历史记录，一次撤销就能整个还原。
// Saves the appearance settings and records one debounced undo/redo
// history entry: dragging a color slider fires many rapid saves in a
// row — if every single one were recorded as history, undoing once
// would only revert a tiny amount, requiring many undo presses to get
// back to before the drag started. This waits (via setTimeout) for 800ms
// of no further changes, then merges "before this drag -> after this
// drag" into a single history entry, so one undo restores it all at once.

export function saveWidgetAppearance(widgetId, partial) {
    const current = getWidgetAppearance(widgetId) || { ...DEFAULTS };
    const next    = { ...current, ...partial };
    localStorage.setItem(KEY(widgetId), JSON.stringify(next));

    // Debounced history: rapid slider drags collapse into one entry
    // 防抖历史记录：快速连续拖动滑块会被合并成一条记录
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

// 把保存好的外观设置真正应用到这个组件的 DOM 元素上（背景色+透明度
// 合成、标题/内容颜色、边框显示与否、内容/标题的缩放比例等）。
// Actually applies the saved appearance settings onto this widget's DOM
// element (combining background color + opacity, title/content color,
// whether the border shows, content/title scale, etc).

export function applyWidgetAppearance(widget, app) {
    if (!widget || !app) return;

    // Combine color + opacity into rgba so both are always in sync
    // 把颜色和透明度合成一个 rgba 值，保证两者永远同步一致
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

    const sourceTag = widget.querySelector(".quote-source-tag");
    if (sourceTag) {
        sourceTag.style.color = app.titleColor || "";
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
