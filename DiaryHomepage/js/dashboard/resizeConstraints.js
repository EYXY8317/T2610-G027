// Per-widget size constraints.
//
// Card constraints (minW/minH/maxW/maxH) control how large the card container
// itself can be resized.
//
// Content constraints (contentMaxW/contentMaxH) are independent: the content
// stops growing at these values while the card can still be enlarged further.
// Omit either field to leave that axis unconstrained for the content.
// 每种组件各自的尺寸限制。
//
// 卡片限制（minW/minH/maxW/maxH）控制的是"卡片容器本身"能被缩放到
// 多大/多小。
//
// 内容限制（contentMaxW/contentMaxH）是独立的另一回事：组件内部的
// 内容到了这个尺寸就不再继续变大，即使卡片本身还能继续被拉大。
// 不写某个字段就表示内容在那个方向上不受限制。

const WIDGET_CONSTRAINTS = {
    "digital-clock-widget":   { minW: 160, minH:  80, maxW: 1000, maxH: 500 },
    "weather-hour-widget":    { minW: 180, minH: 100, maxW: 1000, maxH: 600 },
    "weather-day-widget":     { minW: 120, minH: 120, maxW:  420, maxH: 420 },
    "weather-week-widget":    { minW: 200, minH:  90, maxW:  900, maxH: 400 },
    "today-emotion-widget":   { minW: 340, minH: 110, maxW:  600, maxH: 420 },
    "now-streak-widget":      { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "high-streak-widget":     { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "picture-streak-widget":  { minW:  40, minH:  40, maxW: 1800, maxH: 1800 },
    "emotion-summary-widget": { minW: 280, minH: 260, maxW:  800, maxH: 700 },
    "quote-widget":           { minW: 200, minH: 100, maxW:  800, maxH: 600 },
    "diary-card-widget":      { minW: 180, minH: 100, maxW: 1800, maxH: 1800, contentMaxW: 680, contentMaxH: 420 }
};

const DEFAULT_CONSTRAINTS = { minW: 180, minH: 100, maxW: 800, maxH: 500 };

export function getConstraints(widgetId) {
    // 图片连续记录组件的 id 后面可能跟着一段动态后缀（比如支持多个
    // 实例），所以用 startsWith 前缀匹配，而不是要求完全相等。
    // The Picture Streak widget's id may have a dynamic suffix appended
    // (e.g. to support multiple instances on the page), so it's matched
    // by prefix with startsWith rather than requiring an exact match.
    if (widgetId && widgetId.startsWith("picture-streak-widget")) {
        return WIDGET_CONSTRAINTS["picture-streak-widget"];
    }
    return WIDGET_CONSTRAINTS[widgetId] || DEFAULT_CONSTRAINTS;
}

// Stamps --content-max-w / --content-max-h onto the widget element so the CSS
// general rule (.widget-content > *) can cap the inner content independently
// of the card size.  Call once per widget during initialisation.
// 把 --content-max-w / --content-max-h 这两个 CSS 变量写到组件元素上，
// 这样 CSS 里那条通用规则（.widget-content > *）就能独立于卡片大小，
// 单独限制内部内容的最大尺寸。只需要在组件初始化的时候调用一次。

export function applyContentConstraints(widget) {
    const c = getConstraints(widget.id);
    if (c.contentMaxW != null) {
        widget.style.setProperty("--content-max-w", `${c.contentMaxW}px`);
    }
    if (c.contentMaxH != null) {
        widget.style.setProperty("--content-max-h", `${c.contentMaxH}px`);
    }
}

export default WIDGET_CONSTRAINTS;
