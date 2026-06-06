import {
    showTitleSetting
}
from "./showTitleSetting.js";

import {
    showSecondsSetting
}
from "./showSecondsSetting.js";

import {
    clockFormatSetting
}
from "./clockFormatSetting.js";

import {
    clockTypeSetting
}
from "./clockTypeSetting.js";

export const digitalClockSettings = [

    showTitleSetting,

    showSecondsSetting,

    clockFormatSetting,

    clockTypeSetting

];

export function getDigitalClockSettings() {

    return `

        <h3>
            Clock
        </h3>

        <div
            class="setting-row"
        >

            <span>
                Clock Type
            </span>

            <div
                class="
                segment-button
                clock-type-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="digital"
                >
                    Digital
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="flip"
                >
                    Flip
                </button>

            </div>

        </div>

        <div
            class="
            setting-row
            flip-clock-size-row
            "
        >

            <span>
                Flip Clock Size
            </span>

            <div>

                <input
                    class="
                    flip-clock-size-slider
                    "
                    type="range"
                    min="40"
                    max="160"
                    value="80"
                >

                <span
                    class="
                    flip-clock-size-value
                    "
                >
                    80px
                </span>

            </div>

        </div>

        <h3>
            Content
        </h3>

        <div
            class="setting-row"
        >

            <span>
                Show Seconds
            </span>

            <div
                class="
                segment-button
                show-seconds-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="true"
                >
                    Show
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="false"
                >
                    Hide
                </button>

            </div>

        </div>

        <div
            class="
            setting-row
        >

            <span>
                Clock Format
            </span>

            <div
                class="
                segment-button
                clock-format-segment
                "
            >

                <button
                    class="
                    segment-option
                    active
                    "
                    data-value="24h"
                >
                    24H
                </button>

                <button
                    class="
                    segment-option
                    "
                    data-value="12h"
                >
                    12H
                </button>

            </div>

        </div>

    `;

}
