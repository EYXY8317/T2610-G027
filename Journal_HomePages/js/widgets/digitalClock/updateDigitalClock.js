import {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export let showSeconds = true;

export let clockFormat = "24h";

export let clockType = "digital";

export let showDate = true;

export let showWeekday = true;

export let timezone = "";

export let flipClockSize = 80;

export function setShowSeconds(value) {
    showSeconds = value;
}

export function setClockFormat(value) {
    clockFormat = value;
}

export function setClockType(value) {
    clockType = value;
}

export function setShowDate(value) {
    showDate = value;
}

export function setShowWeekday(value) {
    showWeekday = value;
}

export function setTimezone(value) {
    timezone = value;
}

export function setFlipClockSize(value) {
    flipClockSize = value;
}

export function updateDigitalClock() {

    renderDigitalClock(
        showSeconds,
        clockFormat,
        clockType,
        showDate,
        showWeekday,
        timezone
    );

    setInterval(
        () => {

            renderDigitalClock(
                showSeconds,
                clockFormat,
                clockType,
                showDate,
                showWeekday,
                timezone
            );

        },
        1000
    );

}
