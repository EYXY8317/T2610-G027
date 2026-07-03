// Canonical reminder/confirmation popup used across journal_page and the
// (classic-script) diary page. Also exposed on window since diary.html loads
// this module for side effects only — its own script.js is a classic script
// and can't `import` it directly.
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

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-role="cancel"]')?.addEventListener("click", () => overlay.remove());
    overlay.querySelector('[data-role="confirm"]').addEventListener("click", () => {
        overlay.remove();
        onConfirm?.();
    });

    return overlay;
}

if (typeof window !== "undefined") {
    window.showReminderPopup = showReminderPopup;
}
