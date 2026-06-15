import {
    flipClockSize
}
from "./updateDigitalClock.js";

const WEEKDAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function getNow(timezone) {

    if (timezone) {

        try {

            const locale = new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: timezone,
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: false
                }
            );

            const parts = locale.formatToParts(new Date());

            const get = type =>
                Number(
                    parts.find(p => p.type === type)?.value ?? 0
                );

            return {
                hours: get("hour") % 24,
                minutes: get("minute"),
                seconds: get("second"),
                year: get("year"),
                month: get("month") - 1,
                day: get("day"),
                weekday: new Date(
                    get("year"),
                    get("month") - 1,
                    get("day")
                ).getDay()
            };

        }
        catch {
            // fall through to local
        }

    }

    const now = new Date();

    return {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        weekday: now.getDay()
    };

}

function formatTime(
    hours,
    minutes,
    seconds,
    showSeconds,
    clockFormat
) {

    let suffix = "";

    if (clockFormat === "12h") {
        suffix = hours >= 12 ? " PM" : " AM";
        hours = hours % 12 || 12;
    }

    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");

    return showSeconds
        ? `${h}:${m}:${s}${suffix}`
        : `${h}:${m}${suffix}`;

}

function formatDateLine(year, month, day, weekday, showDate, showWeekday) {

    const parts = [];

    if (showWeekday) {
        parts.push(WEEKDAY_NAMES[weekday]);
    }

    if (showDate) {
        parts.push(
            `${MONTH_NAMES[month]} ${day}, ${year}`
        );
    }

    return parts.join(", ");

}

export function renderDigitalClock(
    showSeconds = true,
    clockFormat = "24h",
    clockType = "digital",
    showDate = false,
    showWeekday = false,
    timezone = ""
) {

    const clock = document.getElementById("digital-clock-time");

    if (!clock) {
        return;
    }

    const {
        hours,
        minutes,
        seconds,
        year,
        month,
        day,
        weekday
    } = getNow(timezone);

    const timeStr = formatTime(
        hours, minutes, seconds, showSeconds, clockFormat
    );

    const dateLine = formatDateLine(
        year, month, day, weekday, showDate, showWeekday
    );

    if (clockType === "flip") {

        const h = String(
            clockFormat === "12h"
                ? (hours % 12 || 12)
                : hours
        ).padStart(2, "0");

        const m = String(minutes).padStart(2, "0");
        const s = String(seconds).padStart(2, "0");

        const suffix =
            clockFormat === "12h"
                ? `<div class="flip-ampm">${hours >= 12 ? "PM" : "AM"}</div>`
                : "";

        const cardStyle = `
            width:${flipClockSize}px;
            height:${flipClockSize * 1.2}px;
            border:1px solid #666;
            border-radius:8px;
            display:flex;
            justify-content:center;
            align-items:center;
            font-size:${flipClockSize * 0.45}px;
            font-weight:bold;
        `;

        clock.innerHTML = `
            <div style="display:flex;gap:12px;justify-content:center;align-items:center;flex-direction:column;">
                <div style="display:flex;gap:12px;align-items:center;">
                    <div style="${cardStyle}">${h}</div>
                    <div style="${cardStyle}">${m}</div>
                    ${showSeconds ? `<div style="${cardStyle}">${s}</div>` : ""}
                    ${suffix}
                </div>
                ${dateLine ? `<div class="clock-date-line">${dateLine}</div>` : ""}
            </div>
        `;

        return;

    }

    if (clockType === "minimal") {

        clock.innerHTML = `
            <div class="clock-minimal">
                <div class="clock-minimal-time">${timeStr}</div>
                ${dateLine ? `<div class="clock-minimal-date">${dateLine}</div>` : ""}
            </div>
        `;

        return;

    }

    // digital (default)
    clock.innerHTML = `
        <div class="clock-digital">
            <div class="clock-digital-time">${timeStr}</div>
            ${dateLine ? `<div class="clock-date-line">${dateLine}</div>` : ""}
        </div>
    `;

}
