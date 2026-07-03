/* Global page-switch transition: fades the current page out (via
   html.page-exiting in page-transitions.css) before following an internal
   link, so navigating between pages feels like one continuous effect
   instead of an abrupt reload. Pairs with the automatic pageFadeIn
   animation that plays on every page load. */
(function () {
    var EXIT_DURATION = 250;

    function resolveLink(target) {
        var a = target;
        while (a && a.nodeType === 1 && a.tagName !== 'A') {
            a = a.parentElement;
        }
        return a && a.tagName === 'A' ? a : null;
    }

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
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
            return false;
        }

        return true;
    }

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
    window.addEventListener('pageshow', function () {
        document.documentElement.classList.remove('page-exiting');
    });
})();
