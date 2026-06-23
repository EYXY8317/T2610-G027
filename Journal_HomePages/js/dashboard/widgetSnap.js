import { applyCenterSnap }        from "./centerSnap.js";
import { applyWidgetCollisionSnap } from "./collisionManager.js";
import { applyGapSnap }             from "./gapSnap.js";

export function applySnap(widget, newLeft, newTop) {
    const centered = applyCenterSnap(widget, newLeft, newTop);
    const collided = applyWidgetCollisionSnap(widget, centered.left, centered.top);
    const gapped   = applyGapSnap(widget, collided.left, collided.top);
    return { left: gapped.left, top: gapped.top };
}
