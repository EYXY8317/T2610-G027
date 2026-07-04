import { getDecoItems, addDecoItem, removeDecoItem, updateDecoItem } from "./decoData.js";
import { openDecoPicker, closeDecoPicker } from "./decoPicker.js";

// "装饰模式"（deco mode）：允许用户在组件上面贴一些贴纸/装饰图案，
// 可以拖动位置、拖角落调整大小（保持原始长宽比例）、拖旋转把手
// 转动角度，点击 ✕ 删除。这个文件负责渲染这些装饰元素、绑定它们的
// 拖动/缩放/旋转交互，具体的数据存取（增删改查）则交给 decoData.js。
// "Deco mode": lets the user stick decorative stickers/images onto a
// widget — draggable to reposition, resizable via the corner handle
// (keeps its original aspect ratio), rotatable via the rotate handle, and
// removable via the ✕ button. This file renders these decoration
// elements and wires up their drag/resize/rotate interactions; the
// actual data storage (add/remove/update) is delegated to decoData.js.

let _selectedItem = null;

// ── Init ────────────────────────────────────────────────────────────────────
// ── 初始化 ────────────────────────────────────────────────────────────────────

export function initDecoLayer(widget) {
    if (widget.querySelector(".deco-layer")) return;
    const layer = document.createElement("div");
    layer.className = "deco-layer";
    widget.appendChild(layer);
}

// ── Render ──────────────────────────────────────────────────────────────────
// ── 渲染 ──────────────────────────────────────────────────────────────────

// 把当前保存的装饰项列表同步到 DOM：先删掉数据里已经没有的
// （用户在别处删除过），再给数据里有、但 DOM 里还没有的项创建新元素，
// 已存在的元素不会重新创建（避免打断正在进行的拖动/动画）。
// Syncs the currently saved decoration items list to the DOM: first
// removes any DOM elements no longer present in the data (deleted
// elsewhere), then creates new elements for items in the data that
// aren't in the DOM yet — elements that already exist aren't
// re-created (so an in-progress drag/animation isn't interrupted).
export function applyDecoItems(widget, items) {
    const layer = widget.querySelector(".deco-layer");
    if (!layer) return;

    // Remove DOM nodes no longer in data
    layer.querySelectorAll(".deco-item").forEach(el => {
        if (!items?.some(s => s.id === el.dataset.decoId)) el.remove();
    });
    if (!items?.length) return;

    items.forEach(item => {
        if (layer.querySelector(`.deco-item[data-deco-id="${item.id}"]`)) return;
        const el = _createDecoEl(item);
        layer.appendChild(el);
        _enableInteraction(widget, el, item.id);
    });
}

function _createDecoEl(item) {
    const el = document.createElement("div");
    el.className = "deco-item";
    el.dataset.decoId = item.id;
    el.dataset.rotation = item.rotation ?? 0;
    el.style.cssText = `left:${item.x}px; top:${item.y}px; width:${item.w}px; height:${item.h}px; opacity:${item.opacity ?? 1}; transform:rotate(${item.rotation ?? 0}deg);`;

    const img = document.createElement("img");
    img.src = item.src;
    img.draggable = false;

    const rotateHandle = document.createElement("div");
    rotateHandle.className = "deco-rotate-handle";
    rotateHandle.textContent = "↻";

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "deco-resize-handle";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "deco-delete-btn";
    deleteBtn.title = "Remove";
    deleteBtn.textContent = "✕";

    el.append(img, rotateHandle, resizeHandle, deleteBtn);
    return el;
}

// ── Interaction ─────────────────────────────────────────────────────────────
// ── 交互 ─────────────────────────────────────────────────────────────

function _enableInteraction(widget, el, itemId) {
    const deleteBtn = el.querySelector(".deco-delete-btn");

    deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        if (_selectedItem === el) _selectedItem = null;
        removeDecoItem(widget.id, itemId);
        el.remove();
    });

    // ── Rotate ────────────────────────────────────────────────
    // ── 旋转 ────────────────────────────────────────────────
    // 用 Math.atan2 算出鼠标相对装饰元素中心点的角度：按下时记录起始
    // 角度和起始旋转值，拖动时用"当前角度 - 起始角度"得到转动的差值，
    // 加到起始旋转值上，就是新的旋转角度。
    // Uses Math.atan2 to compute the mouse's angle relative to the
    // decoration element's center point: on mousedown it records the
    // starting angle and starting rotation, and while dragging,
    // "current angle - starting angle" gives the amount rotated, which is
    // added to the starting rotation to get the new rotation angle.
    const rotateHandle = el.querySelector(".deco-rotate-handle");
    rotateHandle.addEventListener("mousedown", e => {
        e.stopPropagation();
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top  + rect.height / 2;
        const startAngle   = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = parseFloat(el.dataset.rotation || "0");

        const onMove = e => {
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const delta = (angle - startAngle) * (180 / Math.PI);
            const newRot = startRotation + delta;
            el.dataset.rotation = newRot;
            el.style.transform = `rotate(${newRot}deg)`;
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup",   onUp);
            updateDecoItem(widget.id, itemId, { rotation: parseFloat(el.dataset.rotation || "0") });
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup",   onUp);
    });

    // ── Drag ──────────────────────────────────────────────────
    // ── 拖动 ──────────────────────────────────────────────────
    el.addEventListener("mousedown", e => {
        if (e.target.classList.contains("deco-resize-handle")) return;
        if (e.target.classList.contains("deco-rotate-handle")) return;
        if (e.target === deleteBtn) return;
        e.stopPropagation();
        e.preventDefault();

        _selectItem(el);

        const widgetRect = widget.getBoundingClientRect();
        let moved = false;

        const offX = e.clientX - el.getBoundingClientRect().left;
        const offY = e.clientY - el.getBoundingClientRect().top;

        const onMove = e => {
            moved = true;
            el.style.left = (e.clientX - widgetRect.left - offX) + "px";
            el.style.top  = (e.clientY - widgetRect.top  - offY) + "px";
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup",   onUp);
            if (moved) {
                updateDecoItem(widget.id, itemId, {
                    x: parseInt(el.style.left),
                    y: parseInt(el.style.top),
                });
            }
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup",   onUp);
    });

    // ── Resize ────────────────────────────────────────────────
    // ── 调整大小 ────────────────────────────────────────────────
    // 只记录水平方向的拖动距离（dx），再用起始的长宽比例（aspect）
    // 算出对应的高度——这样调整大小时图片不会变形。
    // Only tracks the horizontal drag distance (dx), then uses the
    // starting aspect ratio to compute the matching height — so the
    // image never gets stretched out of shape while resizing.
    const handle = el.querySelector(".deco-resize-handle");
    handle.addEventListener("mousedown", e => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startW = el.offsetWidth, startH = el.offsetHeight;
        const aspect = startW / startH;

        const onMove = e => {
            const dx   = e.clientX - startX;
            const newW = Math.max(40, startW + dx);
            const newH = Math.max(40, Math.round(newW / aspect));
            el.style.width  = newW + "px";
            el.style.height = newH + "px";
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup",   onUp);
            updateDecoItem(widget.id, itemId, {
                w: el.offsetWidth,
                h: el.offsetHeight,
            });
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup",   onUp);
    });
}

function _selectItem(el) {
    if (_selectedItem && _selectedItem !== el) {
        _selectedItem.classList.remove("selected");
    }
    el.classList.add("selected");
    _selectedItem = el;
}

// ── Deco Mode ───────────────────────────────────────────────────────────────
// ── 装饰模式 ───────────────────────────────────────────────────────────────

// Wire up a widget for deco-mode click: empty click → open picker, item click → select
// 给组件绑定装饰模式下的点击事件：点击空白处 → 打开贴纸选择器；
// 点击已有的装饰项 → 交给装饰项自己的点击逻辑处理（选中它）。
export function enableDecoClick(widget) {
    widget.addEventListener("click", e => {
        if (!document.body.classList.contains("deco-mode")) return;
        // Clicks on deco items are handled by the items themselves
        if (e.target.closest(".deco-item")) return;
        e.stopPropagation();

        openDecoPicker(src => {
            const items = addDecoItem(widget.id, src, widget);
            applyDecoItems(widget, items);
        });
    });
}

export function exitDecoMode() {
    closeDecoPicker();
    if (_selectedItem) {
        _selectedItem.classList.remove("selected");
        _selectedItem = null;
    }
    document.body.classList.remove("deco-mode");
    const toolbar = document.getElementById("deco-toolbar");
    if (toolbar) toolbar.classList.remove("visible");
}
