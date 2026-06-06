import {
    setShowSeconds,
    setClockFormat,
    setClockType,
    setFlipClockSize
}
from "../../widgets/time/digitalClock/updateDigitalClock.js";

import {
    renderDigitalClock
}
from "../../widgets/time/digitalClock/renderDigitalClock.js";

import {
    renderWeatherHour
}
from "../../widgets/weatherHour.js";

import {
    applyBackgroundOpacity
}
from "../appearance/backgroundOpacitySetting.js";

import {
    applyBackgroundColor
}
from "../appearance/backgroundColorSetting.js";

import {
    applyTitleColor
}
from "../appearance/titleColorSetting.js";

import {
    applyContentColor
}
from "../appearance/contentColorSetting.js";

import {
    applyTitleSize
}
from "../appearance/titleSizeSetting.js";

import {
    applyFontSize
}
from "../appearance/fontSizeSetting.js";

import {
    applyShowTitle
}
from "../appearance/showTitleSetting.js";

import {
    enableSettingDrag
}
from "./settingDrag.js";

import {
    closeCurrentPopup,
    setCurrentPopup
}
from "./settingManager.js";

import {
    getAppearanceSettings
}
from "../appearance/appearanceSettings.js";

import {
    getDigitalClockSettings
}
from "../widgets/time/digitalClock/digitalClockSettings.js";

import {
    getWeatherDaySettings
}
from "../widgets/weather/weatherDay/weatherDaySettings.js";

import {
    getWeatherHourSettings
}
from "../widgets/weather/weatherHour/weatherHourSettings.js";

import {
    getQuoteSettings
}
from "../widgets/quote/quoteSettings.js";

export function createSettingPopup(
    widgetId
) {

    closeCurrentPopup();

    const appearanceContent =
        getAppearanceSettings();

    let widgetContent = "";

    if (
        widgetId ===
        "digital-clock-widget"
    ) {

        widgetContent =
            getDigitalClockSettings();

    }

    else if (
        widgetId ===
        "weather-day-widget"
    ) {

        widgetContent =
            getWeatherDaySettings();

    }

    else if (
        widgetId ===
        "weather-hour-widget"
    ) {

        widgetContent =
            getWeatherHourSettings();

    }

    else if (
        widgetId ===
        "quote-widget"
    ) {

        widgetContent =
            getQuoteSettings();

    }

    else {

        widgetContent =
            `
                <p>
                    Coming Soon
                </p>
            `;

    }

    const popup =
        document.createElement(
            "div"
        );

    popup.className =
        "setting-popup";

    popup.innerHTML = `

        <div
            class="setting-header"
        >

            <span>

                ${widgetId}

            </span>

            <button
                class="setting-close"
            >
                ✕

            </button>

        </div>

        <div
            class="setting-body"
        >

            ${appearanceContent}

            ${widgetContent}

        </div>

    `;

    popup
        .querySelector(
            ".setting-close"
        )
        .addEventListener(
            "click",
            () => {

                closeCurrentPopup();

            }
        );

    document.body.append(
        popup
    );

    const frequencyButtons =
        popup.querySelectorAll(
            ".frequency-segment .segment-option"
        );

    const graphColorPicker =
        popup.querySelector(
            ".graph-color-picker"
        );

    if (
        graphColorPicker
    ) {

        graphColorPicker
            .addEventListener(
                "input",
                event => {

                    console.log(
                        "Graph Color:",
                        event.target.value
                    );

                }
            );

    }

    frequencyButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    frequencyButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    console.log(
                        "Frequency:",
                        button.dataset.value
                    );

                }
            );

        }
    );

    let showSeconds = true;

    let clockFormat = "24h";

    let clockType =
        "digital";

    const showSecondsButtons =
        popup.querySelectorAll(
            ".show-seconds-segment .segment-option"
        );

    showSecondsButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showSecondsButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    showSeconds =
                        button.dataset.value
                        === "true";

                    setShowSeconds(
                        showSeconds
                    );

                    renderDigitalClock(
                        showSeconds,
                        clockFormat,
                        clockType
                    );

                }
            );

        }
    );

    const clockFormatButtons =
    
        popup.querySelectorAll(
            ".clock-format-segment .segment-option"
        );

    const clockTypeButtons =
        popup.querySelectorAll(
            ".clock-type-segment .segment-option"
        );

    clockTypeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    clockTypeButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    clockType =
                        button.dataset.value;

                    setClockType(
                        clockType
                    );

                    console.log(
                        "Clock Type:",
                        clockType
                    );

                }
            );

        }
    );

    const flipClockSizeSlider =
        popup.querySelector(
            ".flip-clock-size-slider"
        );

    const flipClockSizeValue =
        popup.querySelector(
            ".flip-clock-size-value"
        );

    if (
        flipClockSizeSlider
    ) {

        flipClockSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        event.target.value;

                    flipClockSizeValue
                        .textContent =
                        size + "px";

                    console.log(
                        "Flip Size:",
                        size
                    );

                    setFlipClockSize(
                        Number(size)
                    );

                    renderDigitalClock(
                        showSeconds,
                        clockFormat,
                        clockType
                    );

                    renderDigitalClock(
                        showSeconds,
                        clockFormat,
                        clockType
                    );

                }
            );

    }

    clockFormatButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    clockFormatButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    clockFormat =
                        button.dataset.value;

                    setClockFormat(
                        clockFormat
                    );

                    renderDigitalClock(
                        showSeconds,
                        clockFormat
                    );

                }
            );

        }
    );

    const titleColorPicker =
        popup.querySelector(
            ".title-color-picker"
        );

    if (
        titleColorPicker
    ) {

        titleColorPicker
            .addEventListener(
                "input",
                event => {

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyTitleColor(
                        widget,
                        event.target.value
                    );

                }
            );

    }

    const titleSizeSlider =
        popup.querySelector(
            ".title-size-slider"
        );

    const titleSizeValue =
        popup.querySelector(
            ".title-size-value"
        );

    if (
        titleSizeSlider
    ) {

        titleSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        event.target.value;

                    titleSizeValue
                        .textContent =
                        size + "px";

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyTitleSize(
                        widget,
                        size
                    );

                }
            );

    }

    const contentColorPicker =
        popup.querySelector(
            ".content-color-picker"
        );

    const backgroundColorPicker =
        popup.querySelector(
            ".background-color-picker"
        );

    const backgroundOpacitySlider =
    popup.querySelector(
        ".background-opacity-slider"
    );

const backgroundOpacityValue =
    popup.querySelector(
        ".background-opacity-value"
    );

if (
    backgroundOpacitySlider
) {

    backgroundOpacitySlider
        .addEventListener(
            "input",
            event => {

                const opacity =
                    event.target.value;

                backgroundOpacityValue
                    .textContent =
                    opacity + "%";

                const widget =
                    document.getElementById(
                        widgetId
                    );

                applyBackgroundOpacity(
                    widget,
                    opacity
                );

            }
        );

}

    if (
        backgroundColorPicker
    ) {

        backgroundColorPicker
            .addEventListener(
                "input",
                event => {

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyBackgroundColor(
                        widget,
                        event.target.value
                    );

                }
            );

    }

    if (
        contentColorPicker
    ) {

        contentColorPicker
            .addEventListener(
                "input",
                event => {

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyContentColor(
                        widget,
                        event.target.value
                    );

                }
            );

    }

    const contentSizeSlider =
        popup.querySelector(
            ".content-size-slider"
        );

    const contentSizeValue =
        popup.querySelector(
            ".content-size-value"
        );

    if (
        contentSizeSlider
    ) {

        contentSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        event.target.value;

                    contentSizeValue
                        .textContent =
                        size + "px";

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyFontSize(
                        widget,
                        size
                    );

                }
            );

    }

    const titleButtons =
        popup.querySelectorAll(
            ".title-segment-option"
        );

    titleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    titleButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    const widget =
                        document.getElementById(
                            widgetId
                        );

                    applyShowTitle(
                        widget,
                        button.dataset.value
                        === "true"
                    );

                }
            );

        }
    );

    const header =
        popup.querySelector(
            ".setting-header"
        );

    enableSettingDrag(
        popup,
        header
    );

    setCurrentPopup(
        popup
    );

    return popup;

}