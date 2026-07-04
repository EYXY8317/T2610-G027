// 拖动组件时的"吸附"效果，依次叠加应用 3 种不同的吸附规则：
// 1. applyCenterSnap —— 靠近仪表盘中心线时吸附对齐
// 2. applyWidgetCollisionSnap —— 靠近其他组件边缘时吸附对齐（避免重叠）
// 3. applyGapSnap —— 让组件之间保持统一的间距
// 每一步都用上一步算出来的新位置作为下一步的输入，像"接力"一样层层
// 处理，最终返回的才是同时满足这三种吸附规则的最终位置。
// The "snapping" effect while dragging a widget, applying 3 different
// snap rules in sequence:
// 1. applyCenterSnap — snaps to alignment near the dashboard's center lines
// 2. applyWidgetCollisionSnap — snaps to alignment near other widgets' edges (avoiding overlap)
// 3. applyGapSnap — keeps a consistent spacing between widgets
// Each step feeds its computed position into the next step as input, like
// a relay — the final returned position is the one that satisfies all
// three snap rules at once.

import { applyCenterSnap }        from "./centerSnap.js";
import { applyWidgetCollisionSnap } from "./collisionManager.js";
import { applyGapSnap }             from "./gapSnap.js";

export function applySnap(widget, newLeft, newTop) {
    const centered = applyCenterSnap(widget, newLeft, newTop);
    const collided = applyWidgetCollisionSnap(widget, centered.left, centered.top);
    const gapped   = applyGapSnap(widget, collided.left, collided.top);
    return { left: gapped.left, top: gapped.top };
}
