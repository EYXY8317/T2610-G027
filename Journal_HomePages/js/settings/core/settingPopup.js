import {
    setShowSeconds,
    setClockFormat,
    setClockType,
    setFlipClockSize,
    setShowDate,
    setShowWeekday,
    setTimezone
}
from "../../widgets/digitalClock/updateDigitalClock.js";

import {
    renderDigitalClock
}
from "../../widgets/digitalClock/renderDigitalClock.js";

import {
    renderWeatherHour,
    setWeatherFrequency,
    setShowWeatherIcon,
    setShowWeatherTemperature,
    setGraphColor,
    setGraphSize
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
from "../widgets/digitalClockSettings.js";

import {
    getWeatherDaySettings
}
from "../widgets/weatherDaySettings.js";

import {
    getWeatherHourSettings
}
from "../widgets/weatherHourSettings.js";

import {
    getQuoteSettings
}
from "../widgets/quoteSettings.js";

import {
    getTodayEmotionSettings
}
from "../widgets/todayEmotionSettings.js";

import {
    getTodayEmotionState,
    updateTodayEmotionState
}
from "../../widgets/todayEmotion.js";

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

    else if (
        widgetId ===
        "today-emotion-widget"
    ) {

        widgetContent =
            getTodayEmotionSettings();

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

    const showIconButtons =
        popup.querySelectorAll(
            ".show-icon-segment .segment-option"
        );

    const showTemperatureButtons =
        popup.querySelectorAll(
            ".show-temperature-segment .segment-option"
        );

    const graphColorPicker =
        popup.querySelector(
            ".graph-color-picker"
        );

    const graphSizeSlider =
        popup.querySelector(
            ".graph-size-slider"
        );

    const graphSizeValue =
        popup.querySelector(
            ".graph-size-value"
        );

    if (
        graphSizeSlider &&
        graphSizeValue
    ) {

        graphSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        Number(
                            event.target.value
                        );

                    graphSizeValue
                        .textContent =
                        size + "%";

                    setGraphSize(
                        size
                    );

                    renderWeatherHour();

                }
            );

    }

    if (
        graphColorPicker
    ) {

        graphColorPicker
            .addEventListener(
                "input",
                event => {

                    setGraphColor(
                        event.target.value
                    );

                    renderWeatherHour();

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

                    setWeatherFrequency(
                        button.dataset.value
                    );

                    renderWeatherHour();

                }
            );

        }
    );

    showIconButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showIconButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    setShowWeatherIcon(
                        button.dataset.value
                        === "true"
                    );

                    renderWeatherHour();

                }
            );

        }
    );

    showTemperatureButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showTemperatureButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    setShowWeatherTemperature(
                        button.dataset.value
                        === "true"
                    );

                    renderWeatherHour();

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

    const showDateButtons =
        popup.querySelectorAll(
            ".show-date-segment .segment-option"
        );

    showDateButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showDateButtons.forEach(
                        item => item.classList.remove("active")
                    );

                    button.classList.add("active");

                    setShowDate(button.dataset.value === "true");

                    renderDigitalClock(
                        showSeconds,
                        clockFormat,
                        clockType
                    );

                }
            );

        }
    );

    const showWeekdayButtons =
        popup.querySelectorAll(
            ".show-weekday-segment .segment-option"
        );

    showWeekdayButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showWeekdayButtons.forEach(
                        item => item.classList.remove("active")
                    );

                    button.classList.add("active");

                    setShowWeekday(button.dataset.value === "true");

                    renderDigitalClock(
                        showSeconds,
                        clockFormat,
                        clockType
                    );

                }
            );

        }
    );

    const timezoneSelect =
        popup.querySelector(".clock-timezone-select");

    if (timezoneSelect) {

        timezoneSelect.addEventListener(
            "change",
            event => {

                setTimezone(event.target.value);

                renderDigitalClock(
                    showSeconds,
                    clockFormat,
                    clockType
                );

            }
        );

    }

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

    const todayEmotionTitleButtons =
        popup.querySelectorAll(
            ".today-emotion-title-segment .segment-option"
        );

    todayEmotionTitleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    todayEmotionTitleButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    updateTodayEmotionState({
                        showTitle: button.dataset.value
                        === "true"
                    });

                }
            );

        }
    );

    const emotionTypeButtons =
        popup.querySelectorAll(
            ".emotion-type-segment .segment-option"
        );

    emotionTypeButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    emotionTypeButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    updateTodayEmotionState({
                        emotionType: button.dataset.value
                    });
                }
            );
        }
    );

    const currentMoodButtons =
        popup.querySelectorAll(
            ".current-mood-segment .segment-option"
        );

    currentMoodButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    currentMoodButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    updateTodayEmotionState({
                        showCurrentMood:
                            button.dataset.value === "true"
                    });
                }
            );
        }
    );

    const selectionModeButtons =
        popup.querySelectorAll(
            ".selection-mode-segment .segment-option"
        );

    selectionModeButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    selectionModeButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    updateTodayEmotionState({
                        selectionMode: button.dataset.value
                    });
                }
            );
        }
    );

    const selectedEffectButtons =
        popup.querySelectorAll(
            ".selected-effect-segment .segment-option"
        );

    selectedEffectButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    selectedEffectButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    updateTodayEmotionState({
                        selectedEffect: button.dataset.value
                    });
                }
            );
        }
    );

    const emojiSizeSlider =
        popup.querySelector(
            ".emoji-size-slider"
        );

    const emojiSizeValue =
        popup.querySelector(
            ".emoji-size-value"
        );

    if (
        emojiSizeSlider
    ) {

        emojiSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        Number(
                            event.target.value
                        );

                    emojiSizeValue
                        .textContent =
                        size + "px";

                    updateTodayEmotionState({
                        emojiSize: size
                    });

                }
            );

    }

    const textSizeSlider =
        popup.querySelector(
            ".text-size-slider"
        );

    const textSizeValue =
        popup.querySelector(
            ".text-size-value"
        );

    if (
        textSizeSlider
    ) {

        textSizeSlider
            .addEventListener(
                "input",
                event => {

                    const size =
                        Number(
                            event.target.value
                        );

                    textSizeValue
                        .textContent =
                        size + "px";

                    updateTodayEmotionState({
                        textSize: size
                    });

                }
            );

    }

    const displayMoodCountSlider =
        popup.querySelector(
            ".display-mood-count-slider"
        );

    const displayMoodCountValue =
        popup.querySelector(
            ".display-mood-count-value"
        );

    if (
        displayMoodCountSlider
    ) {

        displayMoodCountSlider
            .addEventListener(
                "input",
                event => {

                    const count =
                        Number(
                            event.target.value
                        );

                    displayMoodCountValue
                        .textContent =
                        count;

                    updateTodayEmotionState({
                        displayedCount: count
                    });

                }
            );

    }

    const emojiInputs =
        popup.querySelectorAll(
            ".today-emotion-emoji-input"
        );

    emojiInputs.forEach(
        input => {
            input.addEventListener(
                "input",
                () => {
                    const emojis = Array.from(
                        emojiInputs
                    ).map(
                        item =>
                            item.value.trim() || ""
                    );

                    updateTodayEmotionState({
                        displayedEmojis: emojis
                    });
                }
            );
        }
    );

    const imageInput =
        popup.querySelector(
            ".today-emotion-image-input"
        );

    if (
        imageInput
    ) {

        imageInput
            .addEventListener(
                "change",
                event => {
                    const file =
                        event.target.files[0];

                    if (!file) {
                        return;
                    }

                    const reader =
                        new FileReader();

                    reader.onload = () => {
                        updateTodayEmotionState({
                            customImage: reader.result
                        });
                    };

                    reader.readAsDataURL(file);
                }
            );

    }

    if (
        widgetId ===
        "today-emotion-widget"
    ) {
        const todayEmotionState =
            getTodayEmotionState();

        const selectedTypeButton =
            popup.querySelector(
                `.emotion-type-segment .segment-option[data-value="${todayEmotionState.emotionType}"]`
            );

        if (
            selectedTypeButton
        ) {
            emotionTypeButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            selectedTypeButton.classList.add(
                "active"
            );
        }

        const selectedTitleButton =
            popup.querySelector(
                `.today-emotion-title-segment .segment-option[data-value="${todayEmotionState.showTitle}"]`
            );

        if (
            selectedTitleButton
        ) {
            todayEmotionTitleButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            selectedTitleButton.classList.add(
                "active"
            );
        }

        const selectedCurrentMoodButton =
            popup.querySelector(
                `.current-mood-segment .segment-option[data-value="${todayEmotionState.showCurrentMood}"]`
            );

        if (
            selectedCurrentMoodButton
        ) {
            currentMoodButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            selectedCurrentMoodButton.classList.add(
                "active"
            );
        }

        const selectedSelectionModeButton =
            popup.querySelector(
                `.selection-mode-segment .segment-option[data-value="${todayEmotionState.selectionMode}"]`
            );

        if (
            selectedSelectionModeButton
        ) {
            selectionModeButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            selectedSelectionModeButton.classList.add(
                "active"
            );
        }

        const selectedEffectButton =
            popup.querySelector(
                `.selected-effect-segment .segment-option[data-value="${todayEmotionState.selectedEffect}"]`
            );

        if (
            selectedEffectButton
        ) {
            selectedEffectButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            selectedEffectButton.classList.add(
                "active"
            );
        }

        if (
            emojiSizeSlider
        ) {
            emojiSizeSlider.value =
                todayEmotionState.emojiSize;
            emojiSizeValue.textContent =
                `${todayEmotionState.emojiSize}px`;
        }

        if (
            textSizeSlider
        ) {
            textSizeSlider.value =
                todayEmotionState.textSize;
            textSizeValue.textContent =
                `${todayEmotionState.textSize}px`;
        }

        if (
            displayMoodCountSlider
        ) {
            displayMoodCountSlider.value =
                todayEmotionState.displayedCount;
            displayMoodCountValue.textContent =
                todayEmotionState.displayedCount;
        }

        if (
            emojiInputs
        ) {
            emojiInputs.forEach(
                input => {
                    const index =
                        Number(
                            input.dataset.index
                        );

                    input.value =
                        todayEmotionState.displayedEmojis[
                            index
                        ] || "";
                }
            );
        }

        const resetHourSelect =
            popup.querySelector(
                ".emotion-reset-hour-select"
            );

        if (
            resetHourSelect
        ) {
            resetHourSelect.value =
                todayEmotionState.resetHour ?? 0;

            resetHourSelect.addEventListener(
                "change",
                event => {
                    updateTodayEmotionState({
                        resetHour: Number(event.target.value)
                    });
                }
            );
        }

    }

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