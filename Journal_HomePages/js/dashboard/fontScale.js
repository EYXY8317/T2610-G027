// Attaches a ResizeObserver that sets --widget-font-scale on the widget
// so CSS can scale header/content font sizes proportionally to widget width.
// BASE_WIDTH is the "1x" reference; clamped between MIN and MAX.
const BASE_WIDTH = 300;
const MIN_SCALE  = 0.75;
const MAX_SCALE  = 1.6;

export function enableFontScale(widget, onScale) {
    const apply = (width) => {
        const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, width / BASE_WIDTH));
        widget.style.setProperty("--widget-font-scale", scale.toFixed(3));
        if (onScale) onScale(scale, width);
    };

    apply(widget.offsetWidth);

    new ResizeObserver(([entry]) => {
        apply(entry.contentRect.width);
    }).observe(widget);
}
