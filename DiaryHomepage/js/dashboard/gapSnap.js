// "等间距吸附"：拖动一个组件到另外两个组件之间时，如果这两个组件
// 之间的空隙刚好能放下正在拖的这个组件、并且拖到了"让左右（或上下）
// 两边间距相等"的位置附近，就自动吸附到那个正中间的位置，并且画一条
// 参考线标出这段相等的间距。
// "Equal-gap snapping": when dragging a widget between two other
// widgets, if the gap between those two is big enough to fit the widget
// being dragged, and the drag lands near the position that would make
// the left/right (or top/bottom) spacing equal, it automatically snaps
// into that exact centered position and draws a guide line marking the
// equal gap.

const SNAP_DIST       = 8;   // px — how close before snapping
const ROW_OVERLAP_MIN = 30;  // min vertical overlap (px) to count as "same row"
const COL_OVERLAP_MIN = 30;  // min horizontal overlap (px) to count as "same column"

function showGuideH(x1, x2, y) {
    const el = document.getElementById("gap-guide");
    if (!el) return;
    el.className = "gap-h";
    el.style.display = "block";
    el.style.left   = x1 + "px";
    el.style.top    = y  + "px";
    el.style.width  = (x2 - x1) + "px";
    el.style.height = "";
}

function showGuideV(x, y1, y2) {
    const el = document.getElementById("gap-guide");
    if (!el) return;
    el.className = "gap-v";
    el.style.display = "block";
    el.style.left   = x  + "px";
    el.style.top    = y1 + "px";
    el.style.width  = "";
    el.style.height = (y2 - y1) + "px";
}

export function hideGapGuide() {
    const el = document.getElementById("gap-guide");
    if (!el) return;
    el.style.display = "none";
    el.className = "";
}

/**
 * Snaps the dragged widget to an equal-gap position between any two
 * other widgets on the same row (horizontal) or column (vertical).
 *
 * 把正在拖动的组件，吸附到"同一行（水平方向）或同一列（垂直方向）
 * 上任意两个其他组件之间、间距相等"的位置。
 *
 * @returns {{ left: number, top: number }}
 */
export function applyGapSnap(widget, newLeft, newTop) {
    const others = Array.from(document.querySelectorAll(".widget"))
        .filter(w => w !== widget);

    const wW = widget.offsetWidth;
    const wH = widget.offsetHeight;

    // ── Horizontal equal gap (same row) ──────────────────────────
    // ── 水平方向等间距（同一行） ──────────────────────────

    // 先筛选出"跟拖动中的组件在垂直方向上有足够重叠"的其他组件——
    // 重叠够多才算是"同一行"，然后按左边界从左到右排序，
    // 方便下面按"相邻两个"依次检查它们中间的空隙。
    // First filter down to other widgets that overlap enough vertically
    // with the dragged widget — enough overlap is what counts as "the
    // same row" — then sort them left-to-right by their left edge, so the
    // loop below can check the gap between each adjacent pair in order.

    const rowWidgets = others
        .filter(o => {
            const oTop = o.offsetTop;
            const oBot = oTop + o.offsetHeight;
            const overlap = Math.min(newTop + wH, oBot) - Math.max(newTop, oTop);
            return overlap >= ROW_OVERLAP_MIN;
        })
        .sort((a, b) => a.offsetLeft - b.offsetLeft);

    for (let i = 0; i < rowWidgets.length - 1; i++) {
        const L = rowWidgets[i];
        const R = rowWidgets[i + 1];

        const lRight = L.offsetLeft + L.offsetWidth;
        const rLeft  = R.offsetLeft;
        const space  = rLeft - lRight;

        // 这两个组件中间的空隙，如果连拖动中的组件都塞不下，就跳过
        // （+4 留一点点缓冲，避免刚好卡住）。
        // If the gap between these two widgets can't even fit the widget
        // being dragged, skip this pair (+4 leaves a small buffer so it
        // doesn't just barely get stuck).
        if (space <= wW + 4) continue;
        // 拖动中的组件位置离这段空隙太远（左边或右边），也跳过——
        // 只有真的靠近这段空隙时才需要继续判断吸附。
        // If the dragged widget's position is too far from this gap
        // (either side), also skip — only bother checking snap alignment
        // when it's actually near this gap.
        if (newLeft + wW < lRight - SNAP_DIST) continue;
        if (newLeft > rLeft + SNAP_DIST) continue;

        // 计算"让左右两边间距刚好相等"所对应的目标左边界坐标。
        // Computes the target left-edge coordinate that would make the
        // left/right spacing exactly equal.
        const targetLeft = lRight + (space - wW) / 2;

        if (Math.abs(newLeft - targetLeft) < SNAP_DIST) {
            showGuideH(lRight, rLeft, newTop + wH / 2 - 1);
            return { left: targetLeft, top: newTop };
        }
    }

    // ── Vertical equal gap (same column) ─────────────────────────
    // ── 垂直方向等间距（同一列） ─────────────────────────
    // 跟上面水平方向的逻辑完全对称，只是把"左右"换成"上下"。
    // Exactly symmetric to the horizontal logic above, just with
    // "left/right" swapped for "top/bottom".

    const colWidgets = others
        .filter(o => {
            const oLeft  = o.offsetLeft;
            const oRight = oLeft + o.offsetWidth;
            const overlap = Math.min(newLeft + wW, oRight) - Math.max(newLeft, oLeft);
            return overlap >= COL_OVERLAP_MIN;
        })
        .sort((a, b) => a.offsetTop - b.offsetTop);

    for (let i = 0; i < colWidgets.length - 1; i++) {
        const T = colWidgets[i];
        const B = colWidgets[i + 1];

        const tBottom = T.offsetTop + T.offsetHeight;
        const bTop    = B.offsetTop;
        const space   = bTop - tBottom;

        if (space <= wH + 4) continue;
        if (newTop + wH < tBottom - SNAP_DIST) continue;
        if (newTop > bTop + SNAP_DIST) continue;

        const targetTop = tBottom + (space - wH) / 2;

        if (Math.abs(newTop - targetTop) < SNAP_DIST) {
            showGuideV(newLeft + wW / 2 - 1, tBottom, bTop);
            return { left: newLeft, top: targetTop };
        }
    }

    hideGapGuide();
    return { left: newLeft, top: newTop };
}
