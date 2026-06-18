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

import {
    getBorderSetting
}
from "./borderSetting.js";

import {
    getFontSizeSetting
}
from "./fontSizeSetting.js";

export function getAppearanceSettings() {

    return `

        <h3>
            Appearance
        </h3>

        ${getFontSizeSetting()}

        <hr>

        ${getShowTitleSetting()}

        <hr>

        ${getBorderSetting()}

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