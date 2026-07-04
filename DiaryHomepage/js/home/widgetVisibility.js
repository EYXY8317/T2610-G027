// 记录"用户手动隐藏了哪些组件"，存成一份 id 列表放在 localStorage 里
// （key 是 "hidden-widgets"）。隐藏的组件仍然存在于布局数据里，
// 只是不会被渲染出来；"恢复显示"的时候，只需要把它的 id 从这份
// 隐藏列表里移除即可，不需要重新创建组件或恢复它的位置数据。
// Tracks "which widgets the user manually hid", storing a list of widget
// ids in localStorage (key "hidden-widgets"). Hidden widgets still exist
// in the layout data — they just aren't rendered; "showing" one again
// just removes its id from this hidden list, no need to recreate the
// widget or restore its position data.

const KEY = "hidden-widgets";

export function getHiddenWidgets() {
    // JSON.parse 失败（比如存储的内容损坏）时安全地退回空数组，
    // 而不是让整个页面因为一条坏数据而报错崩溃。
    // Falls back safely to an empty array if JSON.parse fails (e.g. the
    // stored content is corrupted), instead of letting the whole page
    // crash over one bad piece of data.
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
