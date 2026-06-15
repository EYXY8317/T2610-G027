import {
    flipClockSize
}
from "./updateDigitalClock.js";

export function renderDigitalClock(

    showSeconds = true,
    clockFormat = "24h",
    clockType = "digital"

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

    if (
        clockType === "flip"
    ) {

        clock.innerHTML = `

            <div
                style="
                    display:flex;
                    gap:12px;
                    justify-content:center;
                    align-items:center;
                "
            >

                <div
                    style="
                        width:${flipClockSize}px;
                        height:${flipClockSize * 1.2}px;
                        border:1px solid #666;
                        border-radius:8px;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        font-size:${flipClockSize * 0.45}px;
                        font-weight:bold;
                    "
                >
                    ${hours}
                </div>

                <div
                    style="
                        width:${flipClockSize}px;
                        height:${flipClockSize * 1.2}px;
                        border:1px solid #666;
                        border-radius:8px;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        font-size:${flipClockSize * 0.45}px;
                        font-weight:bold;
                    "
                >
                    ${minutes}
                </div>

                ${
                    showSeconds
                        ? `
                            <div
                                style="
                                    width:${flipClockSize}px;
                                    height:${flipClockSize * 1.2}px;
                                    border:1px solid #666;
                                    border-radius:8px;
                                    display:flex;
                                    justify-content:center;
                                    align-items:center;
                                    font-size:${flipClockSize * 0.45}px;
                                    font-weight:bold;
                                "
                            >
                                ${seconds}
                            </div>
                        `
                        : ""
                }

            </div>

        `;

        return;

    }

    clock.textContent =
        time + suffix;

}