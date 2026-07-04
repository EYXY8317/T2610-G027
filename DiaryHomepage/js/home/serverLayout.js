// 负责把首页布局数据在"浏览器本地 localStorage"和"服务器"之间
// 双向同步：登录用户的布局不再只存在自己电脑上，换一台设备登录
// 也能看到同样的布局。
// Handles syncing the home-page layout data both ways between "browser
// localStorage" and "the server": a logged-in user's layout no longer
// lives only on their own computer — logging in on a different device
// shows the same layout.

import { JOURNAL_WIDGET_IDS as WIDGET_IDS } from "../currentUser.js";

function getActiveTemplate() {
    return localStorage.getItem("active-template") || "cozy-dashboard";
}

// Fetch this user's layout from the server and write it into localStorage.
// Returns true if server had saved data (existing user), false if new/empty (first-time user).
// 从服务器拉取这个用户的布局，写进 localStorage。
// 如果服务器上有已保存的数据（老用户）就返回 true，
// 如果是全新/空的（第一次使用的新用户）就返回 false。

export async function loadLayoutFromServer() {
    try {
        const res = await fetch("/api/home-layout");
        if (!res.ok) return false;
        const data = await res.json();
        if (!data || Object.keys(data).length === 0) return false;
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });
        return true;
    } catch {
        return false;
    }
}

// Push all layout / appearance / hidden state from localStorage up to the server.
// Returns a Promise (callers can await if they need to before a reload).
// 把 localStorage 里所有的布局/外观/隐藏状态数据，一次性推送到服务器
// 保存起来。返回一个 Promise（如果调用方需要在刷新页面之前等它完成，
// 可以用 await）。

export function syncLayoutToServer() {
    const data = {};

    // Extra picture streak instances
    // 额外新增的图片连续记录组件实例
    const extraKey = "picture-streak-extra-instances";
    const extraRaw = localStorage.getItem(extraKey);
    const extraIds = extraRaw ? (() => { try { return JSON.parse(extraRaw); } catch { return []; } })() : [];
    if (extraRaw) { try { data[extraKey] = JSON.parse(extraRaw); } catch {} }

    // WIDGET_IDS 是固定的、内置的组件 id 列表；extraIds 是用户自己
    // 额外添加的组件实例（比如新建了第二个图片连续记录组件）。
    // 把两者拼起来，才是"这个用户实际拥有的全部组件"。
    // WIDGET_IDS is the fixed, built-in list of widget ids; extraIds are
    // any extra widget instances the user added themselves (e.g. a second
    // Picture Streak widget). Combining them gives "every widget this
    // user actually has".

    const activeTemplate = getActiveTemplate();
    const allIds = [...WIDGET_IDS, ...extraIds];
    allIds.forEach(id => {
        const layout     = localStorage.getItem(`${id}-layout`);
        const appearance = localStorage.getItem(`${id}-appearance`);
        const state      = localStorage.getItem(`${id}-state`);
        const deco       = localStorage.getItem(`${activeTemplate}:${id}-deco`);
        // 每一项都单独用 try/catch 包起来解析——就算某一个组件的数据
        // 恰好损坏了，也只会跳过那一项，不会导致整个同步过程失败。
        // Each item is individually wrapped in its own try/catch — even
        // if one widget's data happens to be corrupted, only that one
        // item is skipped, instead of the whole sync failing.
        if (layout)     { try { data[`${id}-layout`]     = JSON.parse(layout);     } catch {} }
        if (appearance) { try { data[`${id}-appearance`] = JSON.parse(appearance); } catch {} }
        if (state)      { try { data[`${id}-state`]      = JSON.parse(state);      } catch {} }
        if (deco)       { try { data[`${activeTemplate}:${id}-deco`] = JSON.parse(deco); } catch {} }
    });
    const hidden = localStorage.getItem("hidden-widgets");
    if (hidden) { try { data["hidden-widgets"] = JSON.parse(hidden); } catch {} }
    const activeTpl = localStorage.getItem("active-template");
    if (activeTpl) { data["active-template"] = activeTpl; }

    return fetch("/api/home-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).catch(() => {});
}
