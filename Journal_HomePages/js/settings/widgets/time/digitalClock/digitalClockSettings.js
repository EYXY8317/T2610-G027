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
            Appearance
        </h3>

        <label>

            <input
                type="checkbox"
                checked
            >

            Show Title

        </label>

        <h3>
            Content
        </h3>

        <label>

            <input
                type="checkbox"
                checked
            >

            Show Seconds

        </label>

        <br>
        <br>

        <label>

            Clock Format

        </label>

        <select>

            <option>
                24H
            </option>

            <option>
                12H
            </option>

        </select>

    `;

}