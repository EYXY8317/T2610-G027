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

// 从一串候选值（candidates）里，找出跟 value 最接近、并且距离在
// SNAP_DIST（8px）以内的那一个；如果都太远，返回 null（不吸附）。
// Finds whichever candidate value is closest to value, as long as it's
// within SNAP_DIST (8px); if all candidates are too far away, returns
// null (no snap).
function nearestSnap(value, candidates) {
    let best = null;
    let bestDist = SNAP_DIST;
    for (const c of candidates) {
        const d = Math.abs(value - c);
        if (d < bestDist) { bestDist = d; best = c; }
    }
    return best;
}

// 拖动组件"边缘"来调整大小时的吸附逻辑（比如只拖右边缘、只拖下边缘，
// 或者拖角落同时改两个方向）：dir 参数是像 "e"/"se"/"nw" 这样的
// 方向代码（e=东/右，w=西/左，n=北/上，s=南/下）。每个方向各自
// 检查自己的边缘位置有没有靠近某个"对齐候选点"（仪表盘正中线、
// 其他组件的边缘/中心线、留出 20px 间距的位置）；如果没有靠近对齐点，
// 就退而求其次，检查新的宽度/高度是不是接近别的组件的宽度/高度
// （"same size" 吸附，让两个组件大小看起来一样）。
// Snap logic when resizing a widget by dragging one of its edges (e.g.
// dragging only the right edge, only the bottom edge, or a corner that
// changes two directions at once): the dir parameter is a direction code
// like "e"/"se"/"nw" (e=east/right, w=west/left, n=north/top,
// s=south/bottom). Each direction independently checks whether its edge
// position is close to some "alignment candidate" (the dashboard's exact
// center line, other widgets' edges/center lines, or a position leaving
// a 20px gap); if it's not close to any alignment point, it falls back
// to checking whether the new width/height is close to another widget's
// width/height (a "same size" snap, making the two widgets look the same
// size).
export function applyEdgeResizeSnap(widget, newW, newH, newL, newT, dir) {
    const dashboard = document.getElementById("dashboard");
    const dashCX    = dashboard.clientWidth  / 2;
    const dashCY    = dashboard.clientHeight / 2;
    const others    = Array.from(document.querySelectorAll(".widget"))
                          .filter(w => w !== widget);

    const fixedRight  = newL + newW;
    const fixedBottom = newT + newH;

    let guideX = null;
    let guideY = null;
    let sameSizeX = null;
    let sameSizeY = null;

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


// 拖动"右下角调整大小把手"（同时改宽高）时用的另一套吸附逻辑：
// 分别检查右边缘和下边缘是不是贴近其他组件的对应边缘（含留 20px
// 间距的版本），贴近就直接把宽度/高度设成对齐后的值。这个版本
// 比上面的 applyEdgeResizeSnap 更简单，没有"同尺寸吸附"和辅助线，
// 是给只能从右下角调整大小的旧版拖拽把手用的。
// A separate, simpler snap used when dragging the "bottom-right resize
// handle" (which changes width and height together): checks whether the
// right edge and bottom edge are close to other widgets' matching edges
// (including a version with a 20px gap), and if so, sets the width/height
// directly to the aligned value. This version is simpler than
// applyEdgeResizeSnap above — no "same size" snap or guide lines — meant
// for the older resize handle that can only resize from the bottom-right
// corner.
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
