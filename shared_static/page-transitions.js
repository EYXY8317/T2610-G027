/* Global page-switch transition: fades the current page out (via
   html.page-exiting in page-transitions.css) before following an internal
   link, so navigating between pages feels like one continuous effect
   instead of an abrupt reload. Pairs with the automatic pageFadeIn
   animation that plays on every page load. */
/* 全站通用的换页过渡效果：在真正跳转到内部链接之前，先给页面加上
   淡出效果（靠 page-transitions.css 里的 html.page-exiting 这个
   class 实现），这样从一个页面切到另一个页面时感觉像是一个连续的
   动画，而不是生硬地整页刷新。跟每次页面加载时自动播放的
   pageFadeIn 淡入动画正好配成一对。 */
(function () {
    var EXIT_DURATION = 250;

    function resolveLink(target) {
        var a = target;
        while (a && a.nodeType === 1 && a.tagName !== 'A') {
            a = a.parentElement;
        }
        return a && a.tagName === 'A' ? a : null;
    }

    // 判断这次点击的链接是不是"应该套用过渡动画"的那种链接：
    // 排除新开分页/下载链接/明确标记不要过渡/跨站链接/mailto 和 tel
    // 链接/纯粹跳转到本页面内某个锚点的链接——这些情况都应该保持
    // 浏览器原本的默认行为，不套用自定义的淡出动画。
    // Decides whether the clicked link is the kind that "should get the
    // transition animation": excludes links that open a new tab/trigger
    // a download/are explicitly marked to skip transitions/point to a
    // different origin/are mailto or tel links/are just a same-page
    // anchor jump — all of these should keep the browser's normal
    // default behavior instead of using the custom fade-out animation.
    function isTransitionable(a) {
        if (!a || !a.href) return false;
        if (a.target && a.target !== '_self') return false;
        if (a.hasAttribute('download')) return false;
        if (a.hasAttribute('data-no-transition')) return false;

        var url;
        try {
            url = new URL(a.href, window.location.href);
        } catch (e) {
            return false;
        }

        if (url.origin !== window.location.origin) return false;
        if (url.protocol === 'mailto:' || url.protocol === 'tel:') return false;

        // Same-page anchor jumps / JS hooks should behave as normal.
        // 跳到本页面内某个锚点、或者只是用来触发 JS 逻辑的链接，
        // 保持原本的正常行为就好，不用套用过渡动画。
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
            return false;
        }

        return true;
    }

    // 拦截点击事件：只处理左键单击、且没有按住 Ctrl/Shift/Alt/Cmd
    // （这些组合键通常代表用户想在新分页打开链接，不应该被拦截）。
    // 符合条件的话，阻止默认的立即跳转，先给 <html> 加上
    // page-exiting 样式类触发淡出动画，等 250 毫秒动画播完，
    // 才真正执行页面跳转。
    // Intercepts the click event: only handles a plain left-click with no
    // Ctrl/Shift/Alt/Cmd held down (those key combinations usually mean
    // the user wants to open the link in a new tab, and shouldn't be
    // intercepted). If it qualifies, the default immediate navigation is
    // prevented, the page-exiting class is added to <html> to trigger the
    // fade-out animation, and only after the 250ms animation finishes does
    // the actual page navigation happen.
    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var a = resolveLink(e.target);
        if (!isTransitionable(a)) return;

        e.preventDefault();
        document.documentElement.classList.add('page-exiting');
        setTimeout(function () {
            window.location.href = a.href;
        }, EXIT_DURATION);
    }, false);

    // Restore state when the page is reached via back/forward (bfcache).
    // 通过浏览器"前进/后退"按钮回到这个页面时（页面可能是从
    // bfcache 缓存里直接恢复的，不会重新执行整个 <script> 初始化），
    // 要记得把 page-exiting 这个样式类去掉，不然页面会卡在"淡出"
    // 的状态显示不出来。
    window.addEventListener('pageshow', function () {
        document.documentElement.classList.remove('page-exiting');
    });

    // Once the load-in animation finishes, detach it entirely. A filling
    // animation keeps applying its keyframe values (here, transform) even
    // after it ends, which makes <body> a containing block for any
    // position:fixed descendant (e.g. modals) instead of the viewport.
    // 淡入动画播放完毕后，把它整个从 <body> 上解除。原因是：一个
    // "填充模式"（fill-mode）的动画，就算播放结束了，也会持续套用
    // 它最后一帧的样式值（这里是 transform），而只要 <body> 上有
    // transform，浏览器就会把 <body> 当成子元素里所有 position:fixed
    // 元素（比如各种弹窗）的定位基准，而不是整个浏览器视窗——这会
    // 导致弹窗跟着页面滚动而不是固定在屏幕上。所以动画一结束就要
    // 马上把它清除掉，避免这个副作用。
    document.body.addEventListener('animationend', function (e) {
        if (e.target === document.body && e.animationName === 'pageFadeIn') {
            document.body.style.animation = 'none';
        }
    });
})();
