/* Shared "please log in" gate for guest-viewable pages.
   Any page that wants this behaviour must:
     1. Add <meta name="logged-in" content="{{ 'true' if logged_in else 'false' }}"> to <head>
     2. Load this script: <script src="{{ url_for('static', filename='login-gate.js') }}"></script>
     3. Mark write-only links (e.g. delete/reopen <a> tags) with data-auth-required="true"
   Forms are gated automatically. JS-driven actions (fetch calls) should call
   window.requireLogin() themselves before making the request. */
(function () {
    function isLoggedIn() {
        var meta = document.querySelector('meta[name="logged-in"]');
        return !!meta && meta.content === "true";
    }

    function ensureModal() {
        if (document.getElementById("login-required-overlay")) return;

        var style = document.createElement("style");
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
            "text-decoration:underline;font-size:13px;cursor:pointer;padding:4px 0 0;}";
        document.head.appendChild(style);

        var overlay = document.createElement("div");
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

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) hideModal();
        });
        overlay.querySelector(".login-required-close").addEventListener("click", hideModal);
    }

    function showModal() {
        ensureModal();
        document.getElementById("login-required-overlay").classList.add("visible");
    }

    function hideModal() {
        var overlay = document.getElementById("login-required-overlay");
        if (overlay) overlay.classList.remove("visible");
    }

    // For JS-driven actions (fetch calls): returns true and shows the modal
    // if the user is a guest, so callers can `if (requireLogin()) return;`
    function requireLogin() {
        if (isLoggedIn()) return false;
        showModal();
        return true;
    }

    window.isLoggedIn = isLoggedIn;
    window.showLoginRequiredModal = showModal;
    window.requireLogin = requireLogin;

    // A "gated field" is any input/select/textarea/editable area that isn't
    // inside a GET form (filters/search stay usable for guests). Matched on
    // mousedown/focus so the popup fires on first contact, before the field
    // ever gets to open a picker, take focus, or accept a keystroke.
    function findGatedField(el) {
        if (!el || !el.closest) return null;
        var field = el.closest("input, select, textarea, [contenteditable]:not([contenteditable='false'])");
        if (!field) return null;
        if (field.tagName === "INPUT" && ["submit", "button", "reset"].indexOf(field.type) !== -1) return null;
        var form = field.closest("form");
        var method = form ? (form.getAttribute("method") || "get").toLowerCase() : null;
        if (method === "get") return null;
        return field;
    }

    if (!isLoggedIn()) {
        document.addEventListener("submit", function (e) {
            var method = (e.target.getAttribute("method") || "get").toLowerCase();
            if (method !== "post") return; // GET forms (filters/search) stay usable for guests
            e.preventDefault();
            e.stopPropagation();
            showModal();
        }, true);

        document.addEventListener("mousedown", function (e) {
            var field = findGatedField(e.target);
            if (field) {
                e.preventDefault();
                e.stopPropagation();
                showModal();
            }
        }, true);

        document.addEventListener("focus", function (e) {
            var field = findGatedField(e.target);
            if (field) {
                field.blur();
                showModal();
            }
        }, true);

        document.addEventListener("click", function (e) {
            var trigger = e.target.closest && e.target.closest("[data-auth-required]");
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                showModal();
                return;
            }

            var field = findGatedField(e.target);
            if (field) {
                e.preventDefault();
                e.stopPropagation();
                showModal();
                return;
            }

            // Catch submit buttons on the click itself, before the browser
            // runs native required-field validation (which would otherwise
            // silently block submission and never let the submit event fire).
            var submitBtn = e.target.closest &&
                e.target.closest("form button:not([type=button]):not([type=reset]), form input[type=submit]");
            if (submitBtn) {
                var form = submitBtn.closest("form");
                var method = form ? (form.getAttribute("method") || "get").toLowerCase() : "get";
                if (method === "post") {
                    e.preventDefault();
                    e.stopPropagation();
                    showModal();
                }
            }
        }, true);
    }
})();
