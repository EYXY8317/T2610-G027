function getActiveTemplate() {
    return localStorage.getItem("active-template") || "default";
}

const KEY = id => `${getActiveTemplate()}:${id}-deco`;

export function getDecoItems(widgetId) {
    const raw = localStorage.getItem(KEY(widgetId));
    if (!raw) return [];
    try { return JSON.parse(raw); }
    catch { return []; }
}

export function saveDecoItems(widgetId, items) {
    localStorage.setItem(KEY(widgetId), JSON.stringify(items));
}

export function addDecoItem(widgetId, src, widget) {
    const items = getDecoItems(widgetId);
    const id = `deco-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const w = 100, h = 100;
    const widgetW = widget?.offsetWidth  || 300;
    const widgetH = widget?.offsetHeight || 200;
    const x = Math.max(0, Math.floor((widgetW - w) / 2));
    const y = Math.max(0, Math.floor((widgetH - h) / 2));
    items.push({ id, src, x, y, w, h, opacity: 1, rotation: 0 });
    saveDecoItems(widgetId, items);
    return items;
}

export function removeDecoItem(widgetId, itemId) {
    const items = getDecoItems(widgetId).filter(s => s.id !== itemId);
    saveDecoItems(widgetId, items);
    return items;
}

export function updateDecoItem(widgetId, itemId, changes) {
    const items = getDecoItems(widgetId);
    const item = items.find(s => s.id === itemId);
    if (item) { Object.assign(item, changes); saveDecoItems(widgetId, items); }
    return items;
}

export function clearDecoItems(widgetId) {
    localStorage.removeItem(KEY(widgetId));
}
