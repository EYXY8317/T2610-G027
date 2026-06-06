export function renderDigitalClock() {

    const clock =
        document.getElementById(
            "digital-clock-time"
        );

    if (!clock) {
        return;
    }

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

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

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;

}