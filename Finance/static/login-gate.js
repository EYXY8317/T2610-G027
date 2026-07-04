/* Shared "please log in" gate for guest-viewable pages.
   Any page that wants this behaviour must:
     1. Add <meta name="logged-in" content="{{ 'true' if logged_in else 'false' }}"> to <head>
     2. Load this script: <script src="{{ url_for('static', filename='login-gate.js') }}"></script>
     3. Mark write-only links (e.g. delete/reopen <a> tags) with data-auth-required="true"
   Forms are gated automatically. JS-driven actions (fetch calls) should call
   window.requireLogin() themselves before making the request.

   ================================================================
   共享的"请先登录"拦截脚本 / 供访客也能浏览的页面使用
   ================================================================
   任何想要这个行为的页面都必须：
     1. 在 <head> 里加上 <meta name="logged-in" content="{{ 'true' if logged_in else 'false' }}">
     2. 加载这个脚本：<script src="{{ url_for('static', filename='login-gate.js') }}"></script>
     3. 给"只能登录才能用"的链接（比如删除/重新开启的 <a> 标签）加上 data-auth-required="true"
   表单会被自动拦截。由 JS 触发的操作（比如 fetch 请求）需要自己先调用
   window.requireLogin() 检查一下，再决定要不要真的发请求。 */

// (function () { ... })()：这是一个"立即执行函数表达式"（IIFE），
// 把里面所有变量/函数都关在一个独立的作用域里，不会污染全局命名空间
// （不会跟页面上其他脚本的同名变量互相冲突）。
// (function () { ... })(): this is an "Immediately Invoked Function
// Expression" (IIFE) — it keeps every variable/function inside its own
// private scope, so nothing here leaks into the global namespace or
// clashes with same-named variables in other scripts on the page.

(function () {
    function isLoggedIn() {
        // 读取 <head> 里那个 <meta name="logged-in" ...> 标签，
        // 检查它的 content 属性是不是字符串 "true"（服务器渲染页面时
        // 已经算好了这个值）。!!meta 把"有没有找到这个标签"转换成
        // 真正的布尔值 true/false。
        // Reads the <meta name="logged-in" ...> tag in <head> and checks
        // whether its content attribute is the string "true" (the server
        // already computed this when rendering the page). !!meta converts
        // "was the tag found at all" into a real true/false boolean.

        var meta = document.querySelector('meta[name="logged-in"]');
        return !!meta && meta.content === "true";
    }

    function ensureModal() {
        // 如果弹窗已经建立过了，就不用重复创建第二份。
        // If the modal has already been built once, don't create a second copy.

        if (document.getElementById("login-required-overlay")) return;

        // 用 JS 动态创建一个 <style> 标签并把 CSS 规则写进去，
        // 而不是写在单独的 .css 文件里 —— 这样这个脚本可以被任何页面
        // 单独引入就直接工作，不需要额外再手动加一个样式表链接。
        // Dynamically creates a <style> tag and writes CSS rules into it in
        // JS, rather than a separate .css file — this way any page can
        // just include this one script and it works immediately, without
        // needing to remember to link an extra stylesheet too.

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
            "text-decoration:underline;font-size:13px;cursor:pointer;padding:4px 0 0;" +
            "border-radius:0;box-shadow:none;font-weight:400;}";
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

        // 点击弹窗外层的黑色半透明背景（而不是弹窗本身）就关闭弹窗——
        // e.target === overlay 表示"真的点在最外层背景上"，而不是点在
        // 弹窗内部的某个子元素（子元素被点击时 e.target 会是那个子元素，
        // 不等于 overlay，所以不会误触发关闭）。
        // Clicking the dark semi-transparent backdrop (not the modal card
        // itself) closes the modal — e.target === overlay means "the click
        // really landed on the outer backdrop", not on some child element
        // inside the modal (a click on a child sets e.target to that child,
        // not overlay, so it won't accidentally trigger closing).

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
    // 给"由 JS 主动发起的操作"（比如 fetch 请求）用：如果是访客，
    // 就弹出登录提示并返回 true；调用的地方可以写成
    // `if (requireLogin()) return;` 一行代码就同时完成"检查 + 提前退出"。
    // For JS-driven actions (fetch calls): if the user is a guest, shows the
    // modal and returns true; callers can write `if (requireLogin()) return;`
    // as a single line that both checks and bails out early.

    function requireLogin() {
        if (isLoggedIn()) return false;
        showModal();
        return true;
    }

    // 把这几个函数挂到 window 上，变成"全局函数"——
    // 这样页面上其他普通 <script> 标签（不是用 import 的模块）
    // 也能直接调用 requireLogin() 之类的函数。
    // Attaches these functions onto window, making them "global functions" —
    // so other plain <script> tags on the page (not JS modules using
    // import) can call requireLogin() and friends directly.

    window.isLoggedIn = isLoggedIn;
    window.showLoginRequiredModal = showModal;
    window.requireLogin = requireLogin;

    // A "gated field" is any input/select/textarea/editable area that isn't
    // inside a GET form (filters/search stay usable for guests). Matched on
    // mousedown/focus so the popup fires on first contact, before the field
    // ever gets to open a picker, take focus, or accept a keystroke.
    // "被拦截的输入框"指的是：任何不在 GET 表单里的 input/select/textarea/
    // 可编辑区域（筛选/搜索框不受影响，访客也能正常使用）。
    // 之所以在 mousedown/focus 阶段就检查，是为了在用户第一次碰到这个输入框
    // 时就立刻弹窗拦截 —— 抢在浏览器打开日期选择器、输入框获得焦点、
    // 或者用户打出第一个字之前就拦下来。

    function findGatedField(el) {
        if (!el || !el.closest) return null;
        // closest(...)：从 el 本身开始，一路往上找最近的、
        // 符合这个 CSS 选择器的祖先元素（找不到就返回 null）。
        // closest(...): starting from el itself, walks up the DOM tree to
        // find the nearest ancestor (or el itself) matching this CSS
        // selector — returns null if none is found.
        var field = el.closest("input, select, textarea, [contenteditable]:not([contenteditable='false'])");
        if (!field) return null;
        // 提交/普通按钮/重置按钮不算"需要登录才能填写的字段"，
        // 直接放行，不拦截。
        // Submit/button/reset inputs aren't "fields that require login to
        // fill in" — let them through without gating.
        if (field.tagName === "INPUT" && ["submit", "button", "reset"].indexOf(field.type) !== -1) return null;
        var form = field.closest("form");
        var method = form ? (form.getAttribute("method") || "get").toLowerCase() : null;
        // GET 表单（比如筛选/搜索）访客也能正常用，不用拦截。
        // GET forms (e.g. filters/search) stay usable for guests — don't gate them.
        if (method === "get") return null;
        return field;
    }

    if (!isLoggedIn()) {
        // 下面这些事件监听器最后一个参数都传了 true —— 表示在"捕获阶段"
        // 监听（事件从最外层的 document 往内传递、到达实际点击的元素之前
        // 就先经过这里），而不是常见的"冒泡阶段"。这样能确保在页面上
        // 其他任何脚本处理这次点击/提交之前，就先被这里拦截下来，
        // 防止访客的操作真的触发到后端请求。
        // The final `true` argument on each listener below means "listen
        // during the capture phase" (the event travels from the outermost
        // document down to the actual clicked element, passing through here
        // first) rather than the more common bubbling phase. This
        // guarantees the gate intercepts the click/submit before any other
        // script on the page gets a chance to react to it, so a guest's
        // action never actually reaches the backend.

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
            // 在点击的这一刻就拦截提交按钮，抢在浏览器自己的"必填字段"
            // 校验之前 —— 不然浏览器会默默地拦住表单提交（因为必填栏是空的），
            // 导致 submit 事件根本不会触发，上面那个 submit 监听器永远等不到它。

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
