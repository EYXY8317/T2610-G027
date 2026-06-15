
// Track previous flip digits so we only animate changed ones
const _prev = {};

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

        const hStr = String(
            clockFormat === "12h" ? (hours % 12 || 12) : hours
        ).padStart(2, "0");
        const mStr = String(minutes).padStart(2, "0");
        const sStr = String(seconds).padStart(2, "0");

        // Auto-size: fill the widget without overflow
        const widgetEl  = clock.closest(".widget");
        const widgetW   = widgetEl ? widgetEl.offsetWidth  : 320;
        const widgetH   = widgetEl ? widgetEl.offsetHeight : 220;
        const headerH   = widgetEl?.querySelector(".widget-header")?.offsetHeight ?? 36;
        const contentH  = widgetH - headerH;
        const hasDate   = showDate || showWeekday;

        const numCards  = showSeconds ? 6 : 4;
        const numGroups = numCards / 2;       // 2 or 3
        const numCols   = numGroups - 1;      // 1 or 2

        // row width = numCards*sz + numGroups*4 (group-gap) + numCols*14 (colon) + (numGroups+numCols-1)*10 (row-gap) + 24 (padding)
        const rowOverhead = numGroups * 4 + numCols * 14 + (numGroups + numCols - 1) * 10 + 24;
        const szFromW = (widgetW - rowOverhead) / numCards;

        // card height = sz*1.3; leave room for date line + padding
        const szFromH = (contentH - 16 - (hasDate ? 34 : 0)) / 1.3;

        const sz    = Math.max(24, Math.floor(Math.min(szFromW, szFromH)));
        const cardH = Math.round(sz * 1.3);
        const fs    = Math.round(sz * 0.52);

        // 4-layer flip card: back layers always visible, front layers animate on change
        const card = (id, digit) => {
            const prev    = _prev[id] ?? digit;
            const changed = prev !== digit;
            _prev[id] = digit;
            return `
                <div class="flip-digit" style="width:${sz}px;height:${cardH}px;font-size:${fs}px">
                    <div class="flip-back-top">${digit}</div>
                    <div class="flip-back-bottom">${changed ? prev : digit}</div>
                    <div class="flip-front-top${changed ? " is-flipping" : ""}">${changed ? prev : digit}</div>
                    <div class="flip-front-bottom${changed ? " is-flipping" : ""}">${digit}</div>
                </div>`;
        };

        const colon = `<div class="flip-colon"></div>`;
        const ampm  = clockFormat === "12h"
            ? `<div class="flip-ampm">${hours >= 12 ? "PM" : "AM"}</div>`
            : "";

        clock.innerHTML = `
            <div class="flip-clock-wrap">
                <div class="flip-clock-row">
                    <div class="flip-group">
                        ${card("h0", hStr[0])}${card("h1", hStr[1])}
                    </div>
                    ${colon}
                    <div class="flip-group">
                        ${card("m0", mStr[0])}${card("m1", mStr[1])}
                    </div>
                    ${showSeconds ? `
                        ${colon}
                        <div class="flip-group">
                            ${card("s0", sStr[0])}${card("s1", sStr[1])}
                        </div>
                    ` : ""}
                    ${ampm}
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
