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

function render() {
    renderDigitalClock(showSeconds, clockFormat, clockType, showDate, showWeekday, timezone);
}

export function updateDigitalClock() {

    render();

    setInterval(render, 1000);

    // Re-render immediately on resize so font size tracks the card size smoothly
    const widget = document.getElementById("digital-clock-widget");
    if (widget) {
        widget.addEventListener("widgetresize", render);
    }

}
