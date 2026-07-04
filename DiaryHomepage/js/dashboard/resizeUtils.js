import { getConstraints } from "./resizeConstraints.js";

// Sums paddingLeft + paddingRight of every ancestor between el and widget (exclusive).
// This gives the fixed structural padding — not centering-based space.
// 把 el 和 widget 之间（不包含 widget 本身）每一层祖先元素的
// paddingLeft + paddingRight 都加起来。这算出来的是"结构性"的固定
// 内边距，不是靠居中挤出来的空间。

function ancestorHPad(el, widget) {
    let pad = 0;
    let cur = el.parentElement;
    while (cur && cur !== widget) {
        const cs = getComputedStyle(cur);
        pad += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        cur = cur.parentElement;
    }
    return pad;
}

// Returns the minimum widget width so all single-line labels stay unclipped.
// scrollWidth gives natural text width even when overflow:hidden clips visually.
// 算出能让所有单行文字标签都不被裁切、完整显示所需要的最小组件宽度。
// scrollWidth 拿到的是文字"本来应该占多宽"的自然宽度，即使因为
// overflow:hidden 视觉上被裁掉了一部分，scrollWidth 依然能反映真实宽度。

function getTitleMinWidth(widget) {
    let minW = 0;

    // Header title
    // 标题栏文字
    const header = widget.querySelector(".widget-header");
    if (header && header.offsetHeight > 0) {
        const span = header.querySelector("span:first-child");
        if (span) minW = Math.max(minW, span.scrollWidth + ancestorHPad(span, widget));
    }

    // Content labels that must not wrap
    // 内容区域里"不能换行"的标签文字
    for (const sel of [".streak-label", ".wd-temp-label"]) {
        const el = widget.querySelector(sel);
        if (el) minW = Math.max(minW, el.scrollWidth + ancestorHPad(el, widget));
    }

    return minW;
}

// Returns the minimum widget height so the header title is never crushed.
// Drag handle is now position:absolute (out of flow), so only header height counts.
// 算出不会把标题栏"压扁"所需要的最小组件高度。
// 拖动手柄现在是 position:absolute（脱离正常文档流），所以只需要
// 考虑标题栏本身的高度就够了。

function getHeaderMinHeight(widget) {
    const header = widget.querySelector(".widget-header");
    if (!header || header.offsetHeight === 0) return 0;
    return header.offsetHeight;
}

export function computeNewSize(widget, startWidth, startHeight, deltaX, deltaY) {

    const { minW, minH, maxW, maxH } = getConstraints(widget.id);
    // "有效"最小宽/高 = 配置文件里写死的最小值，和"文字不被裁切所需要
    // 的最小值"这两者取较大的那个——保证不管怎么缩小，标题文字和
    // 关键标签永远完整可见。
    // The "effective" min width/height is the larger of the hardcoded
    // config minimum and "the minimum needed so text doesn't get
    // clipped" — guaranteeing that no matter how small it's shrunk, the
    // title text and key labels always stay fully visible.
    const effectiveMinW = Math.max(minW, getTitleMinWidth(widget));
    const effectiveMinH = Math.max(minH, getHeaderMinHeight(widget));

    const newWidth  = Math.max(effectiveMinW, Math.min(startWidth  + deltaX, maxW));
    const newHeight = Math.max(effectiveMinH, Math.min(startHeight + deltaY, maxH));

    return { width: newWidth, height: newHeight };

}

export default computeNewSize;
