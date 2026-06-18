export function getBorderSetting() {
    return `
        <div class="setting-row">
            <span>Border</span>
            <div class="segment-button">
                <button class="border-segment-option active" data-value="true">Show</button>
                <button class="border-segment-option"        data-value="false">Hide</button>
            </div>
        </div>
    `;
}

export function applyBorder(widget, show) {
    if (!widget) return;
    widget.style.border    = show ? "" : "none";
    widget.style.boxShadow = show ? "" : "none";
}
