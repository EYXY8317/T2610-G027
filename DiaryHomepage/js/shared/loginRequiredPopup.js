// Shared "Login Required" modal — visually identical to the one injected by
// Finance/static/login-gate.js, so guests see the same popup everywhere in
// the app regardless of which page/widget triggers it.
function ensureModal() {
    if (document.getElementById("login-required-overlay")) return;

    const style = document.createElement("style");
    style.textContent =
        "#login-required-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);" +
        "display:none;align-items:center;justify-content:center;z-index:99999;font-family:'Poppins',Arial,sans-serif;}" +
        "#login-required-overlay.visible{display:flex;}" +
        "#login-required-modal{background:#fff;border-radius:20px;padding:32px 34px;max-width:340px;" +
        "width:90%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.25);}" +
        "#login-required-modal h2{margin:0 0 10px;color:#4d2e1d;font-size:22px;}" +
        "#login-required-modal p{margin:0 0 22px;color:#6b5a4d;font-size:14px;line-height:1.5;}" +
        "#login-required-modal .login-required-actions{display:flex;flex-direction:column;gap:10px;}" +
        "#login-required-modal .login-required-btn{display:block;padding:12px 0;border-radius:12px;" +
        "text-decoration:none;font-weight:600;font-size:15px;cursor:pointer;border:2px solid #7a4e33;" +
        "color:#7a4e33;background:white;font-family:inherit;}" +
        "#login-required-modal .login-required-btn-solid{background:#7a4e33;color:white;}" +
        "#login-required-modal .login-required-close{border:none;background:none;color:#999;" +
        "text-decoration:underline;font-size:13px;cursor:pointer;padding:4px 0 0;" +
        "border-radius:0;box-shadow:none;font-weight:400;}";
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "login-required-overlay";
    overlay.innerHTML =
        '<div id="login-required-modal" role="dialog" aria-modal="true">' +
        "<h2>Login Required</h2>" +
        "<p>You need to log in to use this feature. Feel free to keep browsing without an account.</p>" +
        '<div class="login-required-actions">' +
        '<a href="/login" class="login-required-btn login-required-btn-solid">Login</a>' +
        '<a href="/login?panel=register" class="login-required-btn">Sign Up</a>' +
        '<button type="button" class="login-required-close">Keep browsing</button>' +
        "</div></div>";
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) hideModal(); });
    overlay.querySelector(".login-required-close").addEventListener("click", hideModal);
}

function hideModal() {
    document.getElementById("login-required-overlay")?.classList.remove("visible");
}

export function showLoginRequiredPopup() {
    ensureModal();
    document.getElementById("login-required-overlay").classList.add("visible");
}

// Diary page loads this as a module but calls it from classic inline
// scripts, so it needs a window global too (same pattern as reminderPopup.js).
if (typeof window !== "undefined") {
    window.showLoginRequiredPopup = showLoginRequiredPopup;
}
