// "字体大小"设置面板：标题大小和内容大小各自独立的三档缩放选项
// （1/2/3，3 是原始大小）。这里只负责画出面板的 HTML，具体怎么把
// "1/2/3" 这个档位换算成实际的缩放倍数，是在
// widgetAppearance.js 里的 CONTENT_SCALE_MAP / TITLE_SCALE_MAP 完成的。
// The "Font Size" settings panel: independent three-tier scale options
// (1/2/3, where 3 is the original size) for the title and the content.
// This only renders the panel's HTML — converting the "1/2/3" tier into
// an actual scale multiplier happens in widgetAppearance.js's
// CONTENT_SCALE_MAP / TITLE_SCALE_MAP.

export function getFontSizeSetting() {
    return `
        <div class="setting-row title-size-row">
            <span>Title Size</span>
            <div class="segment-button title-scale-segment">
                <button class="segment-option title-scale-option" data-value="1">1</button>
                <button class="segment-option title-scale-option" data-value="2">2</button>
                <button class="segment-option title-scale-option active" data-value="3">3</button>
            </div>
        </div>
        <div class="setting-row">
            <span>Content Size</span>
            <div class="segment-button content-scale-segment">
                <button class="segment-option" data-value="1">1</button>
                <button class="segment-option" data-value="2">2</button>
                <button class="segment-option active" data-value="3">3</button>
            </div>
        </div>
    `;
}
