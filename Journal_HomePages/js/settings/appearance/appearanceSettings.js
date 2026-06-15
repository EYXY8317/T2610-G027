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
    getTitleSizeSetting
}
from "./titleSizeSetting.js";

import {
    getShowTitleSetting
}
from "./showTitleSetting.js";

import {
    getFontSizeSetting
}
from "./fontSizeSetting.js";

export function getAppearanceSettings() {

    return `

        <h3>
            Appearance
        </h3>

        ${getShowTitleSetting()}

        <hr>

        ${getTitleSizeSetting()}

        <hr>

        ${getTitleColorSetting()}

        <hr>

        ${getFontSizeSetting()}

        <hr>

        ${getContentColorSetting()}

        <hr>

        ${getBackgroundColorSetting()}

        <hr>

        ${getBackgroundOpacitySetting()}

    `;

}