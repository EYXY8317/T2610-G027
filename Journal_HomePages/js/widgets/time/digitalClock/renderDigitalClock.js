export function renderDigitalClock(

    showSeconds = true,
    clockFormat = "24h"

) {

    const clock =
        document.getElementById(
            "digital-clock-time"
        );

    if (!clock) {
        return;
    }

    const now =
        new Date();

    let hours =
        now.getHours();

    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );

    let suffix = "";

    if (
        clockFormat === "12h"
    ) {

        suffix =
            hours >= 12
                ? " PM"
                : " AM";

        hours =
            hours % 12 || 12;

    }

    hours =
        String(
            hours
        ).padStart(
            2,
            "0"
        );

    let time =
        `${hours}:${minutes}`;

    if (
        showSeconds
    ) {

        time +=
            `:${seconds}`;

    }

    clock.textContent =
        time + suffix;

}