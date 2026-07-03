// Per-widget size constraints.
//
// Card constraints (minW/minH/maxW/maxH) control how large the card container
// itself can be resized.
//
// Content constraints (contentMaxW/contentMaxH) are independent: the content
// stops growing at these values while the card can still be enlarged further.
// Omit either field to leave that axis unconstrained for the content.
const WIDGET_CONSTRAINTS = {
    "digital-clock-widget":   { minW: 160, minH:  80, maxW: 1000, maxH: 500 },
    "weather-hour-widget":    { minW: 180, minH: 100, maxW: 1000, maxH: 600 },
    "weather-day-widget":     { minW: 120, minH: 120, maxW:  420, maxH: 420 },
<<<<<<< HEAD
    "weather-week-widget":    { minW: 170, minH:  60, maxW:  700, maxH: 600 },
=======
    "weather-week-widget":    { minW: 200, minH:  90, maxW:  900, maxH: 400 },
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
    "today-emotion-widget":   { minW: 340, minH: 110, maxW:  600, maxH: 420 },
    "now-streak-widget":      { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "high-streak-widget":     { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "picture-streak-widget":  { minW:  40, minH:  40, maxW: 1800, maxH: 1800 },
    "emotion-summary-widget": { minW: 280, minH: 260, maxW:  800, maxH: 700 },
    "quote-widget":           { minW: 200, minH: 100, maxW:  800, maxH: 600 },
    "diary-card-widget":      { minW: 180, minH: 100, maxW: 1800, maxH: 1800 }
};

const DEFAULT_CONSTRAINTS = { minW: 180, minH: 100, maxW: 800, maxH: 500 };

export function getConstraints(widgetId) {
    if (widgetId && widgetId.startsWith("picture-streak-widget")) {
        return WIDGET_CONSTRAINTS["picture-streak-widget"];
    }
    return WIDGET_CONSTRAINTS[widgetId] || DEFAULT_CONSTRAINTS;
}

// Stamps --content-max-w / --content-max-h onto the widget element so the CSS
// general rule (.widget-content > *) can cap the inner content independently
// of the card size.  Call once per widget during initialisation.
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
