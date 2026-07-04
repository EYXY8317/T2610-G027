// Modal image cropper shared by widgets that store photos client-side
// (e.g. Picture Streak). Shows the image scaled to fit a preview stage,
// lets the user drag a resizable selection box over it, and hands back
// a cropped data URL — the caller decides what to do with it (downscale,
// save, etc).
export function openImageCropper(srcDataUrl, { onApply, onCancel } = {}) {
    const img = new Image();
    img.onload = () => {
        const overlay = document.createElement("div");
        overlay.className = "reminder-overlay crop-overlay";

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

        function clamp() {
            selLeft = Math.max(0, Math.min(selLeft, previewW - selW));
            selTop  = Math.max(0, Math.min(selTop,  previewH - selH));
        }

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
