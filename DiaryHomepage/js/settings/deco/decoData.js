// "装饰"（deco）是可以贴在组件上的贴纸/图案。这个文件负责装饰品
// 数据的增删改查，全部存在 localStorage 里；每个组件的装饰列表
// 用 "当前模板:组件id-deco" 这样的 key 分开存放，所以切换到不同的
// 首页模板（active-template）时，各自的装饰不会互相混在一起。
// "Deco" items are sticker-like decorations that can be placed on top of
// a widget. This file handles CRUD for deco data, all stored in
// localStorage; each widget's deco list is stored under a
// "current-template:widgetId-deco" key, so switching to a different home
// page template (active-template) keeps each template's decorations
// separate rather than mixing them together.

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
    // 用"当前时间戳 + 一小段随机字符"拼出一个几乎不可能重复的 id，
    // 不需要依赖后端来分配唯一编号。
    // Combines the current timestamp with a short random string to build
    // an id that's virtually guaranteed to be unique, without needing a
    // backend to assign one.
    const id = `deco-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const w = 100, h = 100;
    const widgetW = widget?.offsetWidth  || 300;
    const widgetH = widget?.offsetHeight || 200;
    // 新加的装饰默认贴在组件的正中央。
    // A newly added decoration defaults to being centered on the widget.
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
    // Object.assign(item, changes)：把 changes 里的字段直接合并覆盖到
    // 找到的这个 item 上（比如只改 x/y 或者只改 opacity），而不用
    // 把整个装饰对象重新构造一遍。
    // Object.assign(item, changes): merges the fields from changes
    // directly onto the found item (e.g. updating just x/y or just
    // opacity), without needing to reconstruct the whole decoration
    // object from scratch.
    if (item) { Object.assign(item, changes); saveDecoItems(widgetId, items); }
    return items;
}

export function clearDecoItems(widgetId) {
    localStorage.removeItem(KEY(widgetId));
}
