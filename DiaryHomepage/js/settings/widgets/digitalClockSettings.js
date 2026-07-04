// 数字时钟组件的设置面板内容——分成好几个标签页：样式（时钟类型）、
// 位置（时区下拉框，列出常见城市对应的时区）、显示（12/24 小时制、
// 秒数/日期/星期几要不要显示）。
// The settings-panel content for the digital clock widget — split across
// several tabs: style (clock type), location (a timezone dropdown listing
// common cities' timezones), display (12h/24h format, whether to show
// seconds/date/weekday).

export function getDigitalClockSettings() {

    return {

        style: `
            <h3>Clock Style</h3>
            <div class="setting-row">
                <span>Clock Type</span>
                <div class="segment-button clock-type-segment">
                    <button class="segment-option active" data-value="digital">Digital</button>
                    <button class="segment-option" data-value="flip">Flip</button>
                    <button class="segment-option" data-value="minimal">Minimal</button>
                </div>
            </div>
        `,

        location: `
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
        `,

        graph: "",

        display: `
            <h3>Time</h3>
            <div class="setting-row">
                <span>Clock Format</span>
                <div class="segment-button clock-format-segment">
                    <button class="segment-option active" data-value="24h">24H</button>
                    <button class="segment-option" data-value="12h">12H</button>
                </div>
            </div>
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip show-seconds-chip active">Seconds</button>
                <button class="toggle-chip show-date-chip">Date</button>
                <button class="toggle-chip show-weekday-chip">Weekday</button>
            </div>
        `

    };

}
