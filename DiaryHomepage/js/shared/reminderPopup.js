// Canonical reminder/confirmation popup used across journal_page and the
// (classic-script) diary page. Also exposed on window since diary.html loads
// this module for side effects only — its own script.js is a classic script
// and can't `import` it directly.
// 这是全站通用的"提示/确认"弹窗，journal_page 和（传统 script 写法的）
// 日记页面都在共用这一份实现。因为 diary.html 里的 script.js 是普通的
// classic script（不是 ES module），没办法用 import 直接引用这个模块
// 导出的函数，所以这个文件额外把 showReminderPopup 挂到 window 上，
// 让 script.js 能通过全局变量的方式调用到它。
export function showReminderPopup({ title, message, confirmText = "OK", cancelText = null, danger = false, onConfirm } = {}) {
    const overlay = document.createElement("div");
    overlay.className = "reminder-overlay";
    overlay.innerHTML = `
        <div class="reminder-card">
            <div class="reminder-title">${title}</div>
            <div class="reminder-msg">${message}</div>
            <div class="reminder-actions">
                ${cancelText ? `<button class="reminder-btn reminder-btn-secondary" data-role="cancel">${cancelText}</button>` : ""}
                <button class="reminder-btn ${danger ? "reminder-btn-danger" : "reminder-btn-primary"}" data-role="confirm">${confirmText}</button>
            </div>
        </div>
    `;
    document.body.append(overlay);

    // 点击弹窗外层的背景就关闭；点 Cancel（如果有）也关闭但不做任何事；
    // 点 Confirm 才会先关闭弹窗、再调用调用方传进来的 onConfirm 回调。
    // ?.（可选链）确保 cancelText 没传时不会因为找不到 cancel 按钮而报错。
    // Clicking the backdrop closes it; clicking Cancel (if present) also
    // closes it without doing anything else; only clicking Confirm closes
    // the popup AND calls the caller-supplied onConfirm callback.
    // ?. (optional chaining) ensures nothing errors out when cancelText
    // wasn't provided (so there's no cancel button to find).

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-role="cancel"]')?.addEventListener("click", () => overlay.remove());
    overlay.querySelector('[data-role="confirm"]').addEventListener("click", () => {
        overlay.remove();
        onConfirm?.();
    });

    return overlay;
}

// 把函数挂到 window 上，变成全局函数——见文件顶部注释，
// 这是为了让不支持 import 的传统 <script> 文件也能调用它。
// Attaches the function to window as a global — see the top-of-file
// comment: this lets classic <script> files that can't use import call it.

if (typeof window !== "undefined") {
    window.showReminderPopup = showReminderPopup;
}
