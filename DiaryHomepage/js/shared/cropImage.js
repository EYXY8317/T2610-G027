// Modal image cropper shared by widgets that store photos client-side
// (e.g. Picture Streak). Shows the image scaled to fit a preview stage,
// lets the user drag a resizable selection box over it, and hands back
// a cropped data URL — the caller decides what to do with it (downscale,
// save, etc).
// 给需要在客户端保存照片的组件共用的"裁剪照片"弹窗（比如 Picture
// Streak）。把图片缩放显示在一个预览框里，让用户拖动一个可以调整
// 大小的选取框，最后返回裁剪后的图片（data URL 格式）——具体要拿这个
// 结果做什么（缩小、保存等）由调用它的代码决定。

export function openImageCropper(srcDataUrl, { onApply, onCancel } = {}) {
    const img = new Image();
    img.onload = () => {
        const overlay = document.createElement("div");
        overlay.className = "reminder-overlay crop-overlay";

        // 图片原始尺寸可能很大，这里把它按比例缩小到最多 420px（长边），
        // 只是为了让预览框大小合理；实际裁剪时会再换算回原始像素坐标。
        // The image's original size might be large, so it's scaled down
        // to at most 420px (on its longer side) just so the preview box
        // stays a reasonable size; the actual crop later converts back to
        // the original pixel coordinates.
        const MAX_PREVIEW = 420;
        const scale = Math.min(1, MAX_PREVIEW / Math.max(img.naturalWidth, img.naturalHeight));
        const previewW = Math.round(img.naturalWidth * scale);
        const previewH = Math.round(img.naturalHeight * scale);

        overlay.innerHTML = `
            <div class="reminder-card crop-card">
                <div class="reminder-title">Crop Photo</div>
                <div class="crop-stage" style="width:${previewW}px;height:${previewH}px;">
                    <img class="crop-preview-img" src="${srcDataUrl}" draggable="false"
                         style="width:${previewW}px;height:${previewH}px;">
                    <div class="crop-selection">
                        <div class="crop-handle nw"></div>
                        <div class="crop-handle ne"></div>
                        <div class="crop-handle sw"></div>
                        <div class="crop-handle se"></div>
                    </div>
                </div>
                <div class="reminder-actions" style="margin-top:16px;">
                    <button class="reminder-btn reminder-btn-secondary" data-role="cancel">Cancel</button>
                    <button class="reminder-btn reminder-btn-primary" data-role="apply">Apply Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const selection = overlay.querySelector(".crop-selection");

        // 选取框一开始放在预览框正中间，四周留 10% 的边距。
        // The selection box starts centered in the preview, with a 10%
        // inset margin on all sides.
        const inset = Math.min(previewW, previewH) * 0.1;
        let selLeft = inset, selTop = inset;
        let selW = Math.max(20, previewW - inset * 2);
        let selH = Math.max(20, previewH - inset * 2);

        function render() {
            selection.style.left   = selLeft + "px";
            selection.style.top    = selTop  + "px";
            selection.style.width  = selW    + "px";
            selection.style.height = selH    + "px";
        }
        render();

        // 确保选取框拖动时不会超出预览图片的范围。
        // Keeps the selection box from being dragged outside the preview
        // image's bounds.
        function clamp() {
            selLeft = Math.max(0, Math.min(selLeft, previewW - selW));
            selTop  = Math.max(0, Math.min(selTop,  previewH - selH));
        }

        // 拖动整个选取框（移动位置，不改变大小）。
        // Dragging the whole selection box (moves position, doesn't
        // change size).
        selection.addEventListener("mousedown", e => {
            if (e.target !== selection) return;
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const origLeft = selLeft, origTop = selTop;
            function onMove(e) {
                selLeft = origLeft + (e.clientX - startX);
                selTop  = origTop  + (e.clientY - startY);
                clamp();
                render();
            }
            function onUp() {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
            }
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        });

        // 拖动四个角落的把手来调整选取框大小。每个角落只影响自己那两条
        // 边（比如左上角 "nw" 只影响 left/top 和 w/h 的减少方向），
        // 同时保证不会缩得比 MIN_SEL（20px）还小，也不会拖出预览图片外。
        // Dragging one of the four corner handles resizes the selection
        // box. Each corner only affects its own two edges (e.g. the
        // top-left "nw" handle only shifts left/top and shrinks w/h in
        // that direction), while also making sure it can't shrink smaller
        // than MIN_SEL (20px) or get dragged outside the preview image.
        const MIN_SEL = 20;
        overlay.querySelectorAll(".crop-handle").forEach(handle => {
            const corner = ["nw", "ne", "sw", "se"].find(c => handle.classList.contains(c));
            handle.addEventListener("mousedown", e => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX, startY = e.clientY;
                const orig = { left: selLeft, top: selTop, w: selW, h: selH };
                function onMove(e) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    let { left, top, w, h } = orig;
                    if (corner.includes("w")) { left = orig.left + dx; w = orig.w - dx; }
                    if (corner.includes("e")) { w = orig.w + dx; }
                    if (corner.includes("n")) { top = orig.top + dy; h = orig.h - dy; }
                    if (corner.includes("s")) { h = orig.h + dy; }

                    if (w < MIN_SEL) { if (corner.includes("w")) left -= (MIN_SEL - w); w = MIN_SEL; }
                    if (h < MIN_SEL) { if (corner.includes("n")) top  -= (MIN_SEL - h); h = MIN_SEL; }
                    left = Math.max(0, left);
                    top  = Math.max(0, top);
                    w = Math.min(w, previewW - left);
                    h = Math.min(h, previewH - top);

                    selLeft = left; selTop = top; selW = w; selH = h;
                    render();
                }
                function onUp() {
                    document.removeEventListener("mousemove", onMove);
                    document.removeEventListener("mouseup", onUp);
                }
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
            });
        });

        function close() {
            overlay.remove();
        }

        overlay.querySelector('[data-role="cancel"]').addEventListener("click", () => {
            close();
            onCancel?.();
        });

        // "确认裁剪"：选取框的坐标是按缩小后的预览图算的，要先乘以
        // naturalScale（原图/预览图的比例）换算回原图的真实像素坐标，
        // 再用 canvas 的 drawImage 从原图裁出这一块区域，导出成新的
        // data URL 图片。
        // "Apply Crop": the selection box's coordinates are in terms of
        // the scaled-down preview image, so they're first multiplied by
        // naturalScale (original size ÷ preview size) to convert back to
        // real pixel coordinates on the original image, then canvas's
        // drawImage cuts out that region from the original image and
        // exports it as a new data URL image.
        overlay.querySelector('[data-role="apply"]').addEventListener("click", () => {
            const naturalScale = img.naturalWidth / previewW;
            const sx = selLeft * naturalScale;
            const sy = selTop  * naturalScale;
            const sw = selW    * naturalScale;
            const sh = selH    * naturalScale;

            const canvas = document.createElement("canvas");
            canvas.width  = Math.max(1, Math.round(sw));
            canvas.height = Math.max(1, Math.round(sh));
            canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

            close();
            onApply?.(canvas.toDataURL("image/png"));
        });
    };
    img.src = srcDataUrl;
}
