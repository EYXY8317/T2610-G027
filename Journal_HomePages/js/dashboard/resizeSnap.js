<<<<<<< HEAD
=======
import {
    showVerticalLine,
    showHorizontalLine,
    hideVerticalLine,
    hideHorizontalLine,
    showSameSizeGuideV,
    showSameSizeGuideH,
    hideSameSizeGuides
} from "./guideUtils.js";

const SNAP_DIST = 8;
const GAP_SIZE  = 20;

// Returns the nearest snap value within SNAP_DIST, or null if nothing is close enough.
function nearestSnap(value, candidates) {
    let best = null;
    let bestDist = SNAP_DIST;
    for (const c of candidates) {
        const d = Math.abs(value - c);
        if (d < bestDist) { bestDist = d; best = c; }
    }
    return best;
}

/**
 * Snap during edge/corner resize handles (N/S/E/W/NE/NW/SW).
 * Snaps to: dashboard centre X/Y, other widgets' edges ± gap.
 * Shows guide lines while snapping, hides them when not.
 *
 * @param {string} dir - direction string, e.g. "e", "sw", "nw"
 * @returns {{ width, height, left, top }}
 */
export function applyEdgeResizeSnap(widget, newW, newH, newL, newT, dir) {
    const dashboard = document.getElementById("dashboard");
    const dashCX    = dashboard.clientWidth  / 2;
    const dashCY    = dashboard.clientHeight / 2;
    const others    = Array.from(document.querySelectorAll(".widget"))
                          .filter(w => w !== widget);

    // Fixed edges: the opposite side that doesn't move during this drag.
    const fixedRight  = newL + newW;
    const fixedBottom = newT + newH;

    let guideX = null;
    let guideY = null;
    let sameSizeX = null;
    let sameSizeY = null;

    // ── East (right edge moves) ────────────────────────────
    if (dir.includes("e")) {
        const cur = newL + newW;
        const edgeCandidates = [
            dashCX,
            ...others.flatMap(o => [
                o.offsetLeft,
                o.offsetLeft - GAP_SIZE,
                o.offsetLeft + o.offsetWidth / 2,
                o.offsetLeft + o.offsetWidth
            ])
        ];
        const snap = nearestSnap(cur, edgeCandidates);
        if (snap !== null) { newW = snap - newL; guideX = snap; }
        else {
            const sameSnap = nearestSnap(newW, others.map(o => o.offsetWidth));
            if (sameSnap !== null) { newW = sameSnap; sameSizeX = newL + sameSnap; }
        }
    }

    // ── West (left edge moves, right edge is fixed) ────────
    if (dir.includes("w")) {
        const cur = newL;
        const edgeCandidates = [
            dashCX,
            ...others.flatMap(o => [
                o.offsetLeft,
                o.offsetLeft + o.offsetWidth / 2,
                o.offsetLeft + o.offsetWidth,
                o.offsetLeft + o.offsetWidth + GAP_SIZE
            ])
        ];
        const snap = nearestSnap(cur, edgeCandidates);
        if (snap !== null) { newL = snap; newW = fixedRight - newL; guideX = snap; }
        else {
            const sameSnap = nearestSnap(newW, others.map(o => o.offsetWidth));
            if (sameSnap !== null) { newW = sameSnap; newL = fixedRight - sameSnap; sameSizeX = newL; }
        }
    }

    // ── South (bottom edge moves) ──────────────────────────
    if (dir.includes("s")) {
        const cur = newT + newH;
        const edgeCandidates = [
            dashCY,
            ...others.flatMap(o => [
                o.offsetTop,
                o.offsetTop - GAP_SIZE,
                o.offsetTop + o.offsetHeight / 2,
                o.offsetTop + o.offsetHeight
            ])
        ];
        const snap = nearestSnap(cur, edgeCandidates);
        if (snap !== null) { newH = snap - newT; guideY = snap; }
        else {
            const sameSnap = nearestSnap(newH, others.map(o => o.offsetHeight));
            if (sameSnap !== null) { newH = sameSnap; sameSizeY = newT + sameSnap; }
        }
    }

    // ── North (top edge moves, bottom edge is fixed) ───────
    if (dir.includes("n")) {
        const cur = newT;
        const edgeCandidates = [
            dashCY,
            ...others.flatMap(o => [
                o.offsetTop,
                o.offsetTop + o.offsetHeight / 2,
                o.offsetTop + o.offsetHeight,
                o.offsetTop + o.offsetHeight + GAP_SIZE
            ])
        ];
        const snap = nearestSnap(cur, edgeCandidates);
        if (snap !== null) { newT = snap; newH = fixedBottom - newT; guideY = snap; }
        else {
            const sameSnap = nearestSnap(newH, others.map(o => o.offsetHeight));
            if (sameSnap !== null) { newH = sameSnap; newT = fixedBottom - sameSnap; sameSizeY = newT; }
        }
    }

    if (guideX !== null)     { showVerticalLine(guideX); hideSameSizeGuides(); }
    else if (sameSizeX !== null) { showSameSizeGuideV(sameSizeX); hideVerticalLine(); }
    else                     { hideVerticalLine(); hideSameSizeGuides(); }

    if (guideY !== null)     { showHorizontalLine(guideY); }
    else                     { hideHorizontalLine(); }
    if (sameSizeY !== null)  { showSameSizeGuideH(sameSizeY); }

    return { width: newW, height: newH, left: newL, top: newT };
}

>>>>>>> 045b1a003df943324b73368ab658a8541a55e802
export function applyResizeSnap(
    widget,
    width,
    height
) {

    const widgets =
        document.querySelectorAll(
            ".widget"
        );

    const SNAP = 8;

    const GAP = 20;

    const widgetLeft =
        widget.offsetLeft;

    const widgetTop =
        widget.offsetTop;

    let newWidth =
        width;

    let newHeight =
        height;

    widgets.forEach(
        otherWidget => {

            if (
                otherWidget === widget
            ) {
                return;
            }

            const otherLeft =
                otherWidget.offsetLeft;

            const otherRight =
                otherLeft +
                otherWidget.offsetWidth;

            const otherTop =
                otherWidget.offsetTop;

            const otherBottom =
                otherTop +
                otherWidget.offsetHeight;

            const currentRight =
                widgetLeft +
                newWidth;

            const currentBottom =
                widgetTop +
                newHeight;

            // Right ↔ Left

            if (
                Math.abs(
                    currentRight -
                    otherLeft
                ) < SNAP
            ) {

                newWidth =
                    otherLeft -
                    widgetLeft;

            }

            // Right ↔ Left + 20

            if (
                Math.abs(
                    currentRight -
                    (
                        otherLeft -
                        GAP
                    )
                ) < SNAP
            ) {

                newWidth =
                    otherLeft -
                    GAP -
                    widgetLeft;

            }

            // Right ↔ Right

            if (
                Math.abs(
                    currentRight -
                    otherRight
                ) < SNAP
            ) {

                newWidth =
                    otherRight -
                    widgetLeft;

            }

            // Bottom ↔ Top

            if (
                Math.abs(
                    currentBottom -
                    otherTop
                ) < SNAP
            ) {

                newHeight =
                    otherTop -
                    widgetTop;

            }

            // Bottom ↔ Top + 20

            if (
                Math.abs(
                    currentBottom -
                    (
                        otherTop -
                        GAP
                    )
                ) < SNAP
            ) {

                newHeight =
                    otherTop -
                    GAP -
                    widgetTop;

            }

            // Bottom ↔ Bottom

            if (
                Math.abs(
                    currentBottom -
                    otherBottom
                ) < SNAP
            ) {

                newHeight =
                    otherBottom -
                    widgetTop;

            }

        }

    );

    return {

        width:
            newWidth,

        height:
            newHeight

    };

}
