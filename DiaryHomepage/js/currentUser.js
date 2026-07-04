let _username = null;

// Fetches the logged-in username from the server so client-side storage
// (mood/emotion widgets) can be namespaced per user and never leak
// between accounts sharing the same browser. Server-rendered pages (e.g.
// the diary page) can skip the network round trip by setting
// window.__CURRENT_USERNAME__ before this module runs.
// 从服务器获取当前登录用户的用户名，这样客户端本地存储（心情/情绪
// 组件用到的数据）就能按用户各自区分，不会在同一台浏览器换账号登录时
// 互相泄露/混淆。服务器端渲染的页面（比如日记页面）可以提前设置
// window.__CURRENT_USERNAME__，跳过这一次网络请求。

export async function loadCurrentUser() {
    if (typeof window !== "undefined" && window.__CURRENT_USERNAME__) {
        _username = window.__CURRENT_USERNAME__;
        return _username;
    }
    try {
        const res = await fetch("/api/whoami");
        const data = await res.json();
        _username = data.username || "guest";
    } catch {
        _username = "guest";
    }
    return _username;
}

export function getCurrentUsername() {
    if (typeof window !== "undefined" && window.__CURRENT_USERNAME__) {
        return window.__CURRENT_USERNAME__;
    }
    return _username || "guest";
}

export function userScopedKey(baseKey) {
    return `${baseKey}::${getCurrentUsername()}`;
}

// All widget ids that can have per-widget localStorage caches (layout position/size,
// appearance/colors, and non-appearance "state"). Kept here so the sweep below and
// serverLayout.js agree on the same list.
// 每一种"可能有自己独立的 localStorage 缓存"（布局位置/大小、外观/
// 颜色、以及非外观的"状态"）的组件 id。放在这里统一维护，
// 是为了让下面的清理逻辑和 serverLayout.js 用的是同一份列表，
// 不会两边写的不一致。

export const JOURNAL_WIDGET_IDS = [
    "digital-clock-widget", "weather-hour-widget", "weather-day-widget", "weather-week-widget",
    "today-emotion-widget", "now-streak-widget", "high-streak-widget", "picture-streak-widget",
    "emotion-summary-widget", "quote-widget", "diary-card-widget"
];

// Bare (unscoped) keys that historically held per-account diary/journal data or
// still do for values that aren't tied to a specific widget id.
// 一些"裸的"（没有加用户名后缀的）key，历史上曾经用来存每个账号的
// 日记数据，或者现在仍然用来存"不属于某个具体组件"的数据。

const JOURNAL_BARE_KEYS = [
    "diaryPaperType", "hidden-widgets", "active-template", "picture-streak-extra-instances",
    // legacy/unscoped fallbacks from before individual widgets were namespaced
    // 早期各组件数据还没有按用户区分之前，遗留下来的旧 key
    "quote-state", "diary-card-state", "high-streak-display", "now-streak-display", "picture-streak-state"
];

// Removes every locally-cached diary/journal widget value (layout, appearance, state,
// decorations) plus the diary editor's own unscoped preferences. Called whenever the
// logged-in account on this browser changes, so a new/different user never inherits
// another account's cached UI state, widget content, or diary preferences.
// 清空所有本地缓存的日记/首页组件数据（布局、外观、状态、装饰），
// 以及日记编辑器自己那些没有按用户区分的偏好设置。每当这台浏览器上
// 登录的账号发生变化时就会调用这个函数，确保新登录/换了的用户
// 不会继承上一个账号缓存下来的界面状态、组件内容或日记偏好设置。

export function clearJournalLocalCache() {
    if (typeof localStorage === "undefined") return;

    let extraIds = [];
    try { extraIds = JSON.parse(localStorage.getItem("picture-streak-extra-instances")) || []; } catch {}

    [...JOURNAL_WIDGET_IDS, ...extraIds].forEach(id => {
        localStorage.removeItem(`${id}-layout`);
        localStorage.removeItem(`${id}-appearance`);
        localStorage.removeItem(`${id}-state`);
    });

    JOURNAL_BARE_KEYS.forEach(k => localStorage.removeItem(k));

    // Template-scoped decoration items are stored as "<template>:<widgetId>-deco" and
    // per-date canvas heights as "diary-canvas-height-<date>" — sweep by pattern since
    // template names / dates aren't enumerable up front.
    // 按模板区分的装饰数据存成 "<模板名>:<组件id>-deco" 这样的 key 格式，
    // 每个日期各自的画布高度存成 "diary-canvas-height-<日期>"——
    // 因为模板名字和日期数值没办法提前一个个列举出来，所以改用
    // 正则表达式按"模式"扫描所有 key，把匹配的都清掉。

    Object.keys(localStorage).forEach(key => {
        if (/:.+-deco$/.test(key) || key.startsWith("diary-canvas-height-")) {
            localStorage.removeItem(key);
        }
    });
}

// Compares the resolved username against the last account seen on this browser
// (tracked in a small unscoped pointer key — it holds only a username, no content).
// On mismatch, wipes all cached diary/journal localStorage so the newly active
// account starts from a clean slate instead of inheriting the previous account's
// widget state, layout, or diary preferences. Safe/no-op for repeat visits by the
// same account, so normal same-user page refreshes are unaffected.
// 把当前解析出来的用户名，跟"这台浏览器上一次见到的账号"做比较
// （用一个很小的、没有按用户区分的指针 key 记录——它只存一个用户名，
// 不存任何实际内容）。如果对不上，就清空所有缓存的日记/首页数据，
// 让刚登录的这个（新的/不同的）账号从干净的状态开始，而不是继承
// 上一个账号的组件状态、布局或日记偏好。如果还是同一个账号访问，
// 这个函数什么都不会做，正常刷新页面不受影响。

const ACTIVE_USER_POINTER = "__lp_active_journal_user__";

export function ensureUserScopeFresh() {
    if (typeof localStorage === "undefined") return;
    const current = getCurrentUsername();
    const last = localStorage.getItem(ACTIVE_USER_POINTER);
    if (last !== current) {
        clearJournalLocalCache();
        localStorage.setItem(ACTIVE_USER_POINTER, current);
    }
}
