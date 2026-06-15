export function getDigitalClockSettings() {

    return `

        <h3>Clock</h3>

        <div class="setting-row">
            <span>Clock Type</span>
            <div class="segment-button clock-type-segment">
                <button class="segment-option active" data-value="digital">Digital</button>
                <button class="segment-option" data-value="flip">Flip</button>
                <button class="segment-option" data-value="minimal">Minimal</button>
            </div>
        </div>

        <div class="setting-row flip-clock-size-row">
            <span>Flip Clock Size</span>
            <div>
                <input class="flip-clock-size-slider" type="range" min="40" max="160" value="80">
                <span class="flip-clock-size-value">80px</span>
            </div>
        </div>

        <h3>Content</h3>

        <div class="setting-row">
            <span>Show Seconds</span>
            <div class="segment-button show-seconds-segment">
                <button class="segment-option active" data-value="true">Show</button>
                <button class="segment-option" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Clock Format</span>
            <div class="segment-button clock-format-segment">
                <button class="segment-option active" data-value="24h">24H</button>
                <button class="segment-option" data-value="12h">12H</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Date</span>
            <div class="segment-button show-date-segment">
                <button class="segment-option" data-value="true">Show</button>
                <button class="segment-option active" data-value="false">Hide</button>
            </div>
        </div>

        <div class="setting-row">
            <span>Show Weekday</span>
            <div class="segment-button show-weekday-segment">
                <button class="segment-option" data-value="true">Show</button>
                <button class="segment-option active" data-value="false">Hide</button>
            </div>
        </div>

        <h3>Timezone</h3>

        <div class="setting-row">
            <span>Timezone</span>
            <select class="clock-timezone-select">
                <option value="">Local</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York (ET)</option>
                <option value="America/Chicago">Chicago (CT)</option>
                <option value="America/Denver">Denver (MT)</option>
                <option value="America/Los_Angeles">Los Angeles (PT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Asia/Taipei">Taipei (CST)</option>
                <option value="Asia/Seoul">Seoul (KST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Asia/Kuala_Lumpur">Kuala Lumpur (MYT)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
                <option value="Pacific/Auckland">Auckland (NZST)</option>
            </select>
        </div>

    `;

}
