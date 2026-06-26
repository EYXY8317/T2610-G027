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
 * @returns {{ left: number, top: number }}
 */
export function applyGapSnap(widget, newLeft, newTop) {
    const others = Array.from(document.querySelectorAll(".widget"))
        .filter(w => w !== widget);

    const wW = widget.offsetWidth;
    const wH = widget.offsetHeight;

    // ── Horizontal equal gap (same row) ──────────────────────────
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

        if (space <= wW + 4) continue;
        if (newLeft + wW < lRight - SNAP_DIST) continue;
        if (newLeft > rLeft + SNAP_DIST) continue;

        const targetLeft = lRight + (space - wW) / 2;

        if (Math.abs(newLeft - targetLeft) < SNAP_DIST) {
            showGuideH(lRight, rLeft, newTop + wH / 2 - 1);
            return { left: targetLeft, top: newTop };
        }
    }

    // ── Vertical equal gap (same column) ─────────────────────────
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
