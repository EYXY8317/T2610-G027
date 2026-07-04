// "边框"外观设置：一个简单的显示/隐藏开关，控制组件要不要显示
// 边框和阴影。
// The "Border" appearance setting: a simple show/hide toggle controlling
// whether the widget displays a border and shadow.

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
