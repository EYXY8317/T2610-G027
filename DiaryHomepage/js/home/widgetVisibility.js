const KEY = "hidden-widgets";

export function getHiddenWidgets() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
}

export function hideWidget(widgetId) {
    const hidden = getHiddenWidgets();
    if (!hidden.includes(widgetId)) {
        localStorage.setItem(KEY, JSON.stringify([...hidden, widgetId]));
    }
}

export function showWidget(widgetId) {
    const hidden = getHiddenWidgets();
    localStorage.setItem(KEY, JSON.stringify(hidden.filter(id => id !== widgetId)));
}

export function clearHiddenWidgets() {
    localStorage.removeItem(KEY);
}
