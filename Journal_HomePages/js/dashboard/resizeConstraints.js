// Per-widget min/max size constraints (width × height in px)
const WIDGET_CONSTRAINTS = {
    "digital-clock-widget":   { minW: 160, minH:  80, maxW:  650, maxH: 280 },
    "weather-hour-widget":    { minW: 300, minH: 200, maxW: 1000, maxH: 600 },
    "weather-day-widget":     { minW: 120, minH: 120, maxW:  420, maxH: 420 },
    "weather-week-widget":    { minW: 170, minH: 200, maxW:  700, maxH: 600 },
    "today-emotion-widget":   { minW: 160, minH: 110, maxW:  600, maxH: 420 },
    "now-streak-widget":      { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "high-streak-widget":     { minW:  80, minH:  80, maxW:  520, maxH: 520 },
    "picture-streak-widget":  { minW:  40, minH:  40, maxW: 1800, maxH: 1800 },
    "emotion-summary-widget": { minW: 280, minH: 260, maxW:  800, maxH: 700 },
    "quote-widget":           { minW: 200, minH: 100, maxW:  800, maxH: 600 }
};

const DEFAULT_CONSTRAINTS = { minW: 180, minH: 100, maxW: 800, maxH: 500 };

export function getConstraints(widgetId) {
    if (widgetId && widgetId.startsWith("picture-streak-widget")) {
        return WIDGET_CONSTRAINTS["picture-streak-widget"];
    }
    return WIDGET_CONSTRAINTS[widgetId] || DEFAULT_CONSTRAINTS;
}

export default WIDGET_CONSTRAINTS;
