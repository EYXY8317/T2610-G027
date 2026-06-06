import {
    renderDigitalClock
}
from "./renderDigitalClock.js";

export function updateDigitalClock() {

    renderDigitalClock();

    setInterval(
        renderDigitalClock,
        1000
    );

}