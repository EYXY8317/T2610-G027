export function getFontSizeSetting() {
    return `
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
