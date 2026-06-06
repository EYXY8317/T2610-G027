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

export const digitalClockSettings = [

    showTitleSetting,

    showSecondsSetting,

    clockFormatSetting

];

export function getDigitalClockSettings() {

    return `

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
            class="setting-row"
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