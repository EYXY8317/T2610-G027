import {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export let showSeconds = true;

export let clockFormat = "24h";

export let clockType = "digital";

export function setShowSeconds(
    value
) {

    showSeconds = value;

}

export function setClockFormat(
    value
) {

    clockFormat = value;

}

export function setClockType(
    value
) {

    clockType = value;

}

export function updateDigitalClock() {

    renderDigitalClock(
        showSeconds,
        clockFormat,
        clockType
    );

    setInterval(
        () => {

            renderDigitalClock(
                showSeconds,
                clockFormat,
                clockType
            );

        },
        1000
    );

}

export let flipClockSize = 80;

export function setFlipClockSize(
    value
) {

    flipClockSize = value;

}