import { getDecoItems, addDecoItem, removeDecoItem, updateDecoItem } from "./decoData.js";
import { openDecoPicker, closeDecoPicker } from "./decoPicker.js";

let _selectedItem = null;

// ── Init ────────────────────────────────────────────────────────────────────

export function initDecoLayer(widget) {
    if (widget.querySelector(".deco-layer")) return;
    const layer = document.createElement("div");
    layer.className = "deco-layer";
    widget.appendChild(layer);
}

// ── Render ──────────────────────────────────────────────────────────────────

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

function _enableInteraction(widget, el, itemId) {
    const deleteBtn = el.querySelector(".deco-delete-btn");

    deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        if (_selectedItem === el) _selectedItem = null;
        removeDecoItem(widget.id, itemId);
        el.remove();
    });

    // ── Rotate ────────────────────────────────────────────────
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

// Wire up a widget for deco-mode click: empty click → open picker, item click → select
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
