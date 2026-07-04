
// Track previous flip digits so we only animate changed ones
// 记住每个数字位上一次显示的数字，这样翻页动画只会在数字真的变了
// 的那一位上播放（比如从 12:34:56 跳到 12:34:57，只有秒的个位在翻）。
const _prev = {};

const WEEKDAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// 获取当前时间：如果指定了时区（timezone），用 Intl.DateTimeFormat
// 把"现在"格式化成那个时区对应的年月日时分秒；否则直接用浏览器本地
// 时间。时区换算失败时（比如时区字符串写错了）会 catch 住，
// 自动退回本地时间，不会让整个时钟崩掉。
// Gets the current time: if a timezone is specified, uses
// Intl.DateTimeFormat to format "now" into that timezone's
// year/month/day/hour/minute/second; otherwise uses the browser's local
// time directly. If the timezone conversion fails (e.g. a malformed
// timezone string), the catch below silently falls back to local time
// instead of crashing the whole clock.
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
            // 转换失败就往下走，直接用本地时间
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

// 数字时钟组件的核心渲染函数，每次 tick（见 updateDigitalClock.js 的
// setInterval）都会重新调用一次。支持三种时钟外观（clockType）：
// "digital"（普通数字）、"minimal"（极简样式）、"flip"（像老式翻页
// 时钟一样，每个数字是一张会翻转的卡片）。
// The digital clock widget's core render function, called again on
// every tick (see the setInterval in updateDigitalClock.js). Supports
// three clock appearances (clockType): "digital" (plain numbers),
// "minimal" (a stripped-down style), and "flip" (like an old-fashioned
// flip clock, where each digit is a card that flips over).
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
        // 自动调整卡片尺寸：让翻页时钟刚好填满组件、不溢出
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
        // 整行宽度 = 卡片数×卡片宽 + 组间距 + 冒号宽度 + 行间距 + 内边距，
        // 反过来用这条公式从"可用宽度"倒推出每张卡片应该多宽（szFromW）。
        const rowOverhead = numGroups * 4 + numCols * 14 + (numGroups + numCols - 1) * 10 + 24;
        const szFromW = (widgetW - rowOverhead) / numCards;

        // card height = sz*1.3; leave room for date line + padding
        // 卡片高度是宽度的 1.3 倍，同样反过来从"可用高度"倒推出宽度（szFromH）
        const szFromH = (contentH - 16 - (hasDate ? 34 : 0)) / 1.3;

        // 取宽度和高度两种算法算出的尺寸中较小的一个，保证两个方向都不会溢出
        const sz    = Math.max(24, Math.floor(Math.min(szFromW, szFromH)));
        const cardH = Math.round(sz * 1.3);
        const fs    = Math.round(sz * 0.52);

        // 4-layer flip card: back layers always visible, front layers animate on change
        // 每张翻页卡片有 4 层：背面上/下两层一直显示着（旧数字/新数字），
        // 正面上/下两层只有在数字真的变了（changed）的时候才播放翻转动画，
        // 没变的话正面就跟背面显示一样的数字（看起来像没有在翻）。
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

    // shared auto-size for digital + minimal
    // "digital" 和 "minimal" 两种样式共用的自动缩放逻辑
    const widgetEl2 = clock.closest(".widget");
    const widgetW2  = widgetEl2 ? widgetEl2.offsetWidth  : 320;
    const widgetH2  = widgetEl2 ? widgetEl2.offsetHeight : 220;
    const headerH2  = widgetEl2?.querySelector(".widget-header")?.offsetHeight ?? 36;
    const contentH2 = widgetH2 - headerH2;
    const hasDate2  = showDate || showWeekday;
    const dateH2    = hasDate2 ? 36 : 0;

    // estimate rendered width: Inter Bold digits ≈ 0.63em, colons ≈ 0.33em, spaces ≈ 0.28em
    // 估算文字实际渲染出来的宽度：不同字符在这个粗体字体下大概占多宽
    // （用 em 为单位，相对字号的比例），数字比冒号、空格都宽。
    function estimateEm(str) {
        let em = 0;
        for (const ch of str) {
            if (ch === ":") em += 0.33;
            else if (ch === " ") em += 0.28;
            else em += 0.63;
        }
        return em;
    }

    const emW   = estimateEm(timeStr);
    // subtract letter-spacing (2px per char, from CSS) from available width before dividing
    // 先把 CSS 里设置的字间距（每个字符 2px）从可用宽度里扣掉，
    // 再拿剩下的宽度去除以估算出的字符总宽度（em），才是准确的字号。
    const letterSpacingPx = 2 * (timeStr.length - 1);
    const fsFromW2 = (widgetW2 - 32 - letterSpacingPx) / emW;
    const fsFromH2 = (contentH2 - dateH2 - 20) * 0.82;
    // apply a 6% safety margin so bold glyphs never clip the widget edge
    // 留 6% 的安全余量，避免粗体字形刚好贴着组件边缘被裁切掉
    const fs2 = Math.max(16, Math.floor(Math.min(fsFromW2, fsFromH2) * 0.94));

    if (clockType === "minimal") {

        clock.innerHTML = `
            <div class="clock-minimal">
                <div class="clock-minimal-time" style="font-size:${fs2}px">${timeStr}</div>
                ${dateLine ? `<div class="clock-minimal-date">${dateLine}</div>` : ""}
            </div>
        `;

        return;

    }

    // digital (default)
    clock.innerHTML = `
        <div class="clock-digital">
            <div class="clock-digital-time" style="font-size:${fs2}px">${timeStr}</div>
            ${dateLine ? `<div class="clock-date-line">${dateLine}</div>` : ""}
        </div>
    `;

}
