export function getTodayEmotionSettings() {
    return `
        <h3>Display Mode</h3>

        <div class="setting-row">
            <span>Mode</span>
            <div class="segment-button te-display-mode-segment">
                <button class="segment-option active" data-value="select">Emoji 选择</button>
                <button class="segment-option" data-value="slider">滑杆 %</button>
            </div>
        </div>

        <h3>Emoji</h3>

        <div class="setting-row">
            <span>Number of Emojis</span>
            <div>
                <input class="te-count-slider" type="range" min="1" max="5" value="5">
                <span class="te-count-value">5</span>
            </div>
        </div>

        <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
            <span>Choose Emojis</span>
            <div class="te-emoji-inputs">
                <input class="te-emoji-input" data-index="0" maxlength="2" value="😀">
                <input class="te-emoji-input" data-index="1" maxlength="2" value="😊">
                <input class="te-emoji-input" data-index="2" maxlength="2" value="🙂">
                <input class="te-emoji-input" data-index="3" maxlength="2" value="😐">
                <input class="te-emoji-input" data-index="4" maxlength="2" value="😔">
            </div>
        </div>

        <h3>Emoji 选择 Settings</h3>

        <div class="setting-row">
            <span>Selection Mode</span>
            <div class="segment-button te-selection-mode-segment">
                <button class="segment-option active" data-value="single">Single</button>
                <button class="segment-option" data-value="multiple">Multiple</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Selected Effect</span>
            <div class="segment-button te-effect-segment">
                <button class="segment-option active" data-value="border">Border</button>
                <button class="segment-option" data-value="glow">Glow</button>
                <button class="segment-option" data-value="scale">Scale</button>
            </div>
        </div>

        <h3>Other</h3>

        <div class="setting-row">
            <span>Show Title</span>
            <div class="segment-button te-title-segment">
                <button class="segment-option active" data-value="true">ON</button>
                <button class="segment-option" data-value="false">OFF</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Daily Reset Time</span>
            <select class="te-reset-hour-select">
                ${Array.from({ length: 24 }, (_, h) => {
                    const label = h === 0 ? "12:00 AM (midnight)"
                        : h < 12 ? `${h}:00 AM`
                        : h === 12 ? "12:00 PM (noon)"
                        : `${h - 12}:00 PM`;
                    return `<option value="${h}">${label}</option>`;
                }).join("")}
            </select>
        </div>
    `;
}
