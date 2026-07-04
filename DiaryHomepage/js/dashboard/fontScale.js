// Attaches a ResizeObserver that sets --widget-font-scale on the widget
// so CSS can scale header/content font sizes proportionally to widget width.
// BASE_WIDTH is the "1x" reference; clamped between MIN and MAX.
// 给组件绑定一个 ResizeObserver（尺寸变化监听器），把算好的缩放比例
// 写进 CSS 变量 --widget-font-scale，这样 CSS 就能让标题/内容的字号
// 跟着组件宽度按比例一起变化。BASE_WIDTH 是"缩放比例=1（原始大小）"
// 对应的基准宽度；缩放比例会被限制在 MIN_SCALE ~ MAX_SCALE 之间，
// 避免组件极小或极大时字号变得太夸张。

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
