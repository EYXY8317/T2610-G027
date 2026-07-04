import {
    computeSnappedPosition
}
from "./position.js";

import {
    hideGuideLines
}
from "./guide.js";

import {
    showSizeHud,
    hideSizeHud
}
from "./guideUtils.js";

import {
    isOverlapping
}
from "./overlapManager.js";

import {
    BOUNDARY_GAP
}
from "./boundaryManager.js";

import {
    saveLayout
}
from "../home/saveLayout.js";

import {
    pushHistory
}
from "../home/historyManager.js";

// 让一个组件可以被"拖拽把手"（handle）拖动的核心逻辑：监听指针
// 按下/移动/松开三个阶段，移动过程中实时计算吸附位置，松开时如果
// 和别的组件重叠了就弹回原位，否则保存新位置并记一条撤销/重做历史。
// Core logic that makes a widget draggable via its "drag handle": listens
// for pointer down/move/up, computing the snapped position live while
// dragging, and on release either springs back to the original position
// (if it now overlaps another widget) or saves the new position and
// records one undo/redo history entry.

let currentZIndex = 1;

export function enableDrag(
    widget,
    handle
) {

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;

    const PADDING = BOUNDARY_GAP;

    // 按下把手：记录起始坐标，并把这个组件的 z-index 提到最高，
    // 让它拖动时始终显示在其他组件上方（不会被别的组件挡住）。
    // Pointer down on the handle: records the starting coordinates, and
    // bumps this widget's z-index to the highest so far, so it always
    // renders above every other widget while being dragged (never hidden
    // behind another one).
    handle.addEventListener(
        "pointerdown",
        (event) => {

            isDragging = true;

            widget.style.transition =
                "none";

            startX = event.clientX;

            startY = event.clientY;

            currentZIndex++;

            widget.style.zIndex =
                currentZIndex;

            console.log(
                widget.id,
                widget.style.zIndex
            );

            startLeft =
                widget.offsetLeft;

            startTop =
                widget.offsetTop;

            handle.setPointerCapture(
                event.pointerId
            );

        }
    );

    // 拖动过程中：用鼠标移动的距离（deltaX/deltaY）算出组件应该移到
    // 哪个新位置，再交给 computeSnappedPosition 去检查要不要吸附到
    // 边界/其他组件/等距位置，最后把吸附后的坐标显示成一个小提示
    // （HUD）方便用户看到当前的精确坐标。
    // While dragging: uses how far the mouse has moved (deltaX/deltaY) to
    // work out the widget's new target position, hands it to
    // computeSnappedPosition to check whether it should snap to a
    // boundary/other widget/equal-gap position, then shows the snapped
    // coordinates as a small on-screen HUD so the user can see the exact
    // position.
    handle.addEventListener(
        "pointermove",
        (event) => {

            if (!isDragging) {
                return;
            }

            const deltaX =
                event.clientX - startX;

            const deltaY =
                event.clientY - startY;

            const newLeft = startLeft + deltaX;

            const newTop = startTop + deltaY;

            const snapped = computeSnappedPosition(
                widget,
                newLeft,
                newTop,
                PADDING
            );

            widget.style.left = snapped.left + "px";

            widget.style.top = snapped.top + "px";

            showSizeHud(widget, `x: ${Math.round(snapped.left)}  y: ${Math.round(snapped.top)}`);

        }

    );

    // 松开把手：如果最终位置和别的组件重叠了，就用一个 0.3 秒的过渡
    // 动画弹回拖动前的位置（不允许重叠）；否则保留新位置。
    // 如果位置确实变了，就记一条撤销/重做历史（revert 回到拖动前的
    // 位置，apply 回到拖动后的位置），并把最终布局保存起来。
    // Pointer up (release): if the final position now overlaps another
    // widget, it springs back to the pre-drag position with a 0.3s
    // transition animation (overlapping isn't allowed); otherwise the new
    // position is kept. If the position actually changed, one undo/redo
    // history entry is recorded (revert restores the pre-drag position,
    // apply restores the post-drag position), and the final layout is
    // saved.
    handle.addEventListener(
        "pointerup",
        () => {

            if (
                isOverlapping(
                    widget
                )
            ) {

                widget.style.transition =
                    "left 0.3s ease-out, top 0.3s ease-out";

                widget.style.left =
                    startLeft + "px";

                widget.style.top =
                    startTop + "px";

                setTimeout(
                    () => {

                        widget.style.transition =
                            "none";

                    },
                    300
                );

            }

            hideGuideLines();

            hideSizeHud();

            const endLeft = parseFloat(widget.style.left);
            const endTop  = parseFloat(widget.style.top);

            if (endLeft !== startLeft || endTop !== startTop) {
                const widgetId = widget.id;
                const bl = startLeft + "px", bt = startTop + "px";
                const al = widget.style.left,  at = widget.style.top;
                pushHistory({
                    revert() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        el.style.left = bl; el.style.top = bt;
                        saveLayout(el);
                    },
                    apply() {
                        const el = document.getElementById(widgetId);
                        if (!el) return;
                        el.style.left = al; el.style.top = at;
                        saveLayout(el);
                    }
                });
            }

            saveLayout(widget);

            isDragging = false;

        }

    );

}
