import {
    getBackgroundOpacitySetting
}
from "./backgroundOpacitySetting.js";

import {
    getBackgroundColorSetting
}
from "./backgroundColorSetting.js";

import {
    getContentColorSetting
}
from "./contentColorSetting.js";

import {
    getTitleColorSetting
}
from "./titleColorSetting.js";

import {
    getShowTitleSetting
}
from "./showTitleSetting.js";

export function getAppearanceSettings() {

    return `

        <h3>
            Appearance
        </h3>

        ${getShowTitleSetting()}

        <hr>

        ${getTitleColorSetting()}

        <hr>

        ${getContentColorSetting()}

        <hr>

        ${getBackgroundColorSetting()}

        <hr>

        ${getBackgroundOpacitySetting()}

    `;

}