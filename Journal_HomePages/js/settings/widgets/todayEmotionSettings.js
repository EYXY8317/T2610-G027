export function getTodayEmotionSettings() {
    return `
        <h3>Today Emotion</h3>

        <div class="setting-row">
            <span>Emotion Type</span>
            <div class="segment-button emotion-type-segment">
                <button class="segment-option active" data-value="emoji">Emoji</button>
                <button class="segment-option" data-value="rating">Rating</button>
                <button class="segment-option" data-value="image">Image</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Title</span>
            <div class="segment-button today-emotion-title-segment">
                <button class="segment-option active" data-value="true">ON</button>
                <button class="segment-option" data-value="false">OFF</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Current Mood</span>
            <div class="segment-button current-mood-segment">
                <button class="segment-option active" data-value="true">ON</button>
                <button class="segment-option" data-value="false">OFF</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Selection Mode</span>
            <div class="segment-button selection-mode-segment">
                <button class="segment-option active" data-value="single">Single</button>
                <button class="segment-option" data-value="multiple">Multiple</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Selected Effect</span>
            <div class="segment-button selected-effect-segment">
                <button class="segment-option active" data-value="border">Border</button>
                <button class="segment-option" data-value="glow">Glow</button>
                <button class="segment-option" data-value="scale">Scale</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Emoji Size</span>
            <div>
                <input class="emoji-size-slider" type="range" min="24" max="120" value="64">
                <span class="emoji-size-value">64px</span>
            </div>
        </div>

        <div class="setting-row">
            <span>Text Size</span>
            <div>
                <input class="text-size-slider" type="range" min="10" max="50" value="18">
                <span class="text-size-value">18px</span>
            </div>
        </div>

        <div class="setting-row">
            <span>Number of Moods</span>
            <div>
                <input class="display-mood-count-slider" type="range" min="1" max="5" value="5">
                <span class="display-mood-count-value">5</span>
            </div>
        </div>

        <div class="setting-row">
            <span>Choose Display Moods</span>
            <div class="today-emotion-emoji-inputs">
                <input class="today-emotion-emoji-input" data-index="0" maxlength="2" value="😀">
                <input class="today-emotion-emoji-input" data-index="1" maxlength="2" value="😊">
                <input class="today-emotion-emoji-input" data-index="2" maxlength="2" value="🙂">
                <input class="today-emotion-emoji-input" data-index="3" maxlength="2" value="😐">
                <input class="today-emotion-emoji-input" data-index="4" maxlength="2" value="😔">
            </div>
        </div>

        <div class="setting-row">
            <span>Upload Custom Image</span>
            <input class="today-emotion-image-input" type="file" accept="image/jpeg,image/png,image/webp">
        </div>

        <h3>Daily Reset</h3>

        <div class="setting-row">
            <span>Reset Time</span>
            <select class="emotion-reset-hour-select">
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
