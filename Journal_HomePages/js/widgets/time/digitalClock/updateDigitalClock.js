import {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export let showSeconds = true;

export let clockFormat = "24h";

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

export function updateDigitalClock() {

    renderDigitalClock(
        showSeconds,
        clockFormat
    );

    setInterval(
        () => {

            renderDigitalClock(
                showSeconds,
                clockFormat
            );

        },
        1000
    );

}