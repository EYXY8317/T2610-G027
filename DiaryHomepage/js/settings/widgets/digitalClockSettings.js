// 数字时钟组件的设置面板内容——分成好几个标签页：样式（时钟类型）、
// 位置（时区下拉框，列出常见城市对应的时区）、显示（12/24 小时制、
// 秒数/日期/星期几要不要显示）。
// The settings-panel content for the digital clock widget — split across
// several tabs: style (clock type), location (a timezone dropdown listing
// common cities' timezones), display (12h/24h format, whether to show
// seconds/date/weekday).

import {
    showSeconds,
    clockFormat,
    clockType,
    showDate,
    showWeekday,
    timezone
}
from "../../widgets/digitalClock/updateDigitalClock.js";

const TIMEZONES = [
    ["", "Local"],
    ["UTC", "UTC"],
    ["America/New_York", "New York (ET)"],
    ["America/Chicago", "Chicago (CT)"],
    ["America/Denver", "Denver (MT)"],
    ["America/Los_Angeles", "Los Angeles (PT)"],
    ["Europe/London", "London (GMT/BST)"],
    ["Europe/Paris", "Paris (CET)"],
    ["Europe/Berlin", "Berlin (CET)"],
    ["Asia/Tokyo", "Tokyo (JST)"],
    ["Asia/Shanghai", "Shanghai (CST)"],
    ["Asia/Taipei", "Taipei (CST)"],
    ["Asia/Seoul", "Seoul (KST)"],
    ["Asia/Singapore", "Singapore (SGT)"],
    ["Asia/Kuala_Lumpur", "Kuala Lumpur (MYT)"],
    ["Australia/Sydney", "Sydney (AEST)"],
    ["Pacific/Auckland", "Auckland (NZST)"]
];

export function getDigitalClockSettings() {

    return {

        style: `
            <h3>Clock Style</h3>
            <div class="setting-row">
                <span>Clock Type</span>
                <div class="segment-button clock-type-segment">
                    <button class="segment-option${clockType === "digital" ? " active" : ""}" data-value="digital">Digital</button>
                    <button class="segment-option${clockType === "flip" ? " active" : ""}" data-value="flip">Flip</button>
                    <button class="segment-option${clockType === "minimal" ? " active" : ""}" data-value="minimal">Minimal</button>
                </div>
            </div>
        `,

        location: `
            <h3>Timezone</h3>
            <div class="setting-row">
                <span>Timezone</span>
                <select class="clock-timezone-select">
                    ${TIMEZONES.map(([value, label]) =>
                        `<option value="${value}"${value === timezone ? " selected" : ""}>${label}</option>`
                    ).join("")}
                </select>
            </div>
        `,

        graph: "",

        display: `
            <h3>Time</h3>
            <div class="setting-row">
                <span>Clock Format</span>
                <div class="segment-button clock-format-segment">
                    <button class="segment-option${clockFormat === "24h" ? " active" : ""}" data-value="24h">24H</button>
                    <button class="segment-option${clockFormat === "12h" ? " active" : ""}" data-value="12h">12H</button>
                </div>
            </div>
            <h3>Display Elements</h3>
            <div class="toggle-chips">
                <button class="toggle-chip show-seconds-chip${showSeconds ? " active" : ""}">Seconds</button>
                <button class="toggle-chip show-date-chip${showDate ? " active" : ""}">Date</button>
                <button class="toggle-chip show-weekday-chip${showWeekday ? " active" : ""}">Weekday</button>
            </div>
        `

    };

}
