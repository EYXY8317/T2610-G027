import { ZOEY_DEFAULT_LAYOUT } from "./zoeyDefaultLayout.js";
import { DEFAULT_PICTURE_STREAK_PHOTO } from "./defaultPictureStreakPhoto.js";
import { getCurrentUsername } from "../currentUser.js";

// Writes every key of ZOEY's saved layout straight into localStorage, exactly
// as loadLayoutFromServer() does for a server-fetched layout — no scaling,
// no reference-grid conversion, so the result is pixel-identical to ZOEY's.
//
// `seedPhoto` is only true for brand-new accounts (applyDefaultLayout). Picture
// Streak's photo content lives under a per-account key (unlike -layout/-appearance,
// which are shared bare keys synced to the server), so it's handled separately
// instead of being blasted with ZOEY's own baked-in photos on every reset.
// 把 ZOEY 预设布局里的每一个 key 原样直接写进 localStorage，
// 跟 loadLayoutFromServer() 处理"从服务器读回来的布局"时做法完全一样——
// 不做任何缩放或者坐标网格换算，所以结果会跟 ZOEY 的布局像素级一致。
//
// `seedPhoto` 只有在全新账号第一次使用时（applyDefaultLayout）才会是
// true。图片连续记录组件的照片内容是存在"每个账号各自独立"的 key 下面
// 的（不像 -layout/-appearance 那样是共享的、会同步到服务器的裸 key），
// 所以要单独处理，而不是每次重置布局都把 ZOEY 自己内置的照片硬塞给
// 所有账号。

function applyZoeyLayout(seedPhoto) {
    Object.entries(ZOEY_DEFAULT_LAYOUT).forEach(([key, value]) => {
        if (key === "picture-streak-widget-state" && value && Array.isArray(value.photos)) {
            const scopedKey = `picture-streak-widget-state::${getCurrentUsername()}`;
            if (seedPhoto && !localStorage.getItem(scopedKey)) {
                localStorage.setItem(scopedKey, JSON.stringify({
                    ...value,
                    photos: [{
                        dataUrl: DEFAULT_PICTURE_STREAK_PHOTO,
                        date: new Date().toISOString().slice(0, 10),
                        caption: ""
                    }]
                }));
            }
            // Reset Layout (seedPhoto=false): leave the account's own photos alone.
            // 重置布局时（seedPhoto=false）：不动这个账号自己已有的照片。
            return;
        }
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    });
}

// Seed defaults only if no saved data exists (first-time user)
// 只有在完全没有已保存数据时（第一次使用的新用户）才写入默认值
export function applyDefaultLayout() {
    if (!localStorage.getItem("digital-clock-widget-layout")) {
        applyZoeyLayout(true);
    }
}

// Force-overwrite all layout + appearance back to defaults (reset button)
// 强制把布局和外观全部覆盖回默认值（对应"重置"按钮）
export function resetToDefaultLayout() {
    applyZoeyLayout(false);
}
