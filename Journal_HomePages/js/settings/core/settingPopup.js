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
    setShowHumidity,
    setGraphColor,
    setGraphSize
}
from "../../widgets/weatherHour.js";

import {
    setWeatherCity,
    setTempUnit
}
from "../../widgets/weatherConfig.js";

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
    renderWeatherDay,
    updateWeatherDayState
}
from "../../widgets/weatherDay.js";

import {
    renderWeatherWeek,
    updateWeatherWeekState
}
from "../../widgets/weatherWeek.js";

import {
    getWeatherHourSettings
}
from "../widgets/weatherHourSettings.js";

import {
    getQuoteSettings
}
from "../widgets/quoteSettings.js";

import {
    getWeatherWeekSettings
}
from "../widgets/weatherWeekSettings.js";

import {
    getNowStreakSettings
}
from "../widgets/nowStreakSettings.js";

import {
    updateNowStreakState
}
from "../../widgets/nowStreak.js";

import {
    getHighStreakSettings
}
from "../widgets/highStreakSettings.js";

import {
    updateHighStreakState
}
from "../../widgets/highStreak.js";

import {
    getPictureStreakSettings
}
from "../widgets/pictureStreakSettings.js";

import {
    updatePictureStreakState,
    addPictureStreakPhoto,
    removePictureStreakPhoto
}
from "../../widgets/pictureStreak.js";

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
        "weather-week-widget"
    ) {

        widgetContent =
            getWeatherWeekSettings();

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

    else if (
        widgetId ===
        "now-streak-widget"
    ) {

        widgetContent =
            getNowStreakSettings();

    }

    else if (
        widgetId ===
        "high-streak-widget"
    ) {

        widgetContent =
            getHighStreakSettings();

    }

    else if (
        widgetId ===
        "picture-streak-widget"
    ) {

        widgetContent =
            getPictureStreakSettings();

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

    const showHumidityButtons =
        popup.querySelectorAll(
            ".show-humidity-segment .segment-option"
        );

    showHumidityButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showHumidityButtons.forEach(
                        item => item.classList.remove("active")
                    );

                    button.classList.add("active");

                    setShowHumidity(button.dataset.value === "true");

                    renderWeatherHour();

                }
            );

        }
    );

    const tempUnitButtons =
        popup.querySelectorAll(
            ".temp-unit-segment .segment-option"
        );

    tempUnitButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    tempUnitButtons.forEach(
                        item => item.classList.remove("active")
                    );

                    button.classList.add("active");

                    setTempUnit(button.dataset.value);

                    renderWeatherHour();

                }
            );

        }
    );

    const weatherCitySelect =
        popup.querySelector(".weather-city-select");

    if (weatherCitySelect) {

        weatherCitySelect.addEventListener(
            "change",
            event => {

                const [lat, lon] =
                    event.target.value.split(",").map(Number);

                const cityName =
                    event.target.options[event.target.selectedIndex].text;

                setWeatherCity(cityName, lat, lon);

                renderWeatherHour();

            }
        );

    }

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

    /* ── Weather Week settings ──────────────────────────── */

    if (widgetId === "weather-week-widget") {

        function wireWwSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const raw = btn.dataset.value;
                    const val = raw === "true" ? true
                        : raw === "false" ? false
                        : isNaN(Number(raw)) ? raw : Number(raw);
                    updateWeatherWeekState({ [stateKey]: val });
                });
            });
        }

        wireWwSegment(".ww-temp-display-segment", "tempDisplay");
        wireWwSegment(".ww-days-segment", "showDays");
        wireWwSegment(".ww-icon-segment", "showIcon");
        wireWwSegment(".ww-feels-segment", "showFeelsLike");
        wireWwSegment(".ww-humidity-segment", "showHumidity");

        const wwCitySelect = popup.querySelector(".weather-city-select");

        if (wwCitySelect) {
            wwCitySelect.addEventListener("change", event => {
                const [lat, lon] = event.target.value.split(",").map(Number);
                const cityName = event.target.options[event.target.selectedIndex].text;
                setWeatherCity(cityName, lat, lon);
                renderWeatherWeek();
            });
        }

        const wwTempUnit = popup.querySelectorAll(".temp-unit-segment .segment-option");
        wwTempUnit.forEach(btn => {
            btn.addEventListener("click", () => {
                wwTempUnit.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                setTempUnit(btn.dataset.value);
                renderWeatherWeek();
            });
        });

    }

    /* ── Weather Day settings ───────────────────────────── */

    if (widgetId === "weather-day-widget") {

        function wireWdSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const val = btn.dataset.value === "true"
                        ? true
                        : btn.dataset.value === "false"
                            ? false
                            : btn.dataset.value;
                    updateWeatherDayState({ [stateKey]: val });
                });
            });
        }

        wireWdSegment(".wd-temp-display-segment", "tempDisplay");
        wireWdSegment(".wd-feels-segment", "showFeelsLike");
        wireWdSegment(".wd-humidity-segment", "showHumidity");
        wireWdSegment(".wd-icon-segment", "showIcon");
        wireWdSegment(".wd-update-time-segment", "showUpdateTime");

        const wdCitySelect = popup.querySelector(".weather-city-select");

        if (wdCitySelect) {
            wdCitySelect.addEventListener("change", event => {
                const [lat, lon] = event.target.value.split(",").map(Number);
                const cityName = event.target.options[event.target.selectedIndex].text;
                setWeatherCity(cityName, lat, lon);
                renderWeatherDay();
            });
        }

        const wdTempUnit = popup.querySelectorAll(".temp-unit-segment .segment-option");
        wdTempUnit.forEach(btn => {
            btn.addEventListener("click", () => {
                wdTempUnit.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                setTempUnit(btn.dataset.value);
                renderWeatherDay();
            });
        });

    }

    /* ── Picture Streak settings ────────────────────────── */

    if (widgetId === "picture-streak-widget") {

        const psPhotoInput = popup.querySelector(".ps-photo-input");
        if (psPhotoInput) {
            psPhotoInput.addEventListener("change", event => {
                const file = event.target.files[0];
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    addPictureStreakPhoto(reader.result, file.name);
                    popup.remove();
                    createSettingPopup(widgetId);
                };
                reader.readAsDataURL(file);
            });
        }

        const psRemoveBtns = popup.querySelectorAll(".ps-remove-btn");
        psRemoveBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.index);
                removePictureStreakPhoto(idx);
                popup.remove();
                createSettingPopup(widgetId);
            });
        });

        const psDisplayBtns = popup.querySelectorAll(".ps-display-segment .segment-option");
        psDisplayBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                psDisplayBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updatePictureStreakState({ displayMode: btn.dataset.value });
            });
        });

        const psDateLabelBtns = popup.querySelectorAll(".ps-date-label-segment .segment-option");
        psDateLabelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                psDateLabelBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updatePictureStreakState({ showDateLabel: btn.dataset.value === "true" });
            });
        });

        const psIntervalSelect = popup.querySelector(".ps-interval-select");
        if (psIntervalSelect) {
            psIntervalSelect.addEventListener("change", event => {
                updatePictureStreakState({ scrollInterval: event.target.value });
            });
        }

    }

    /* ── High Streak settings ───────────────────────────── */

    if (widgetId === "high-streak-widget") {

        const hsDisplayBtns = popup.querySelectorAll(".hs-display-segment .segment-option");
        hsDisplayBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                hsDisplayBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updateHighStreakState({ displayMode: btn.dataset.value });
            });
        });

        const hsCelebrateBtns = popup.querySelectorAll(".hs-celebrate-segment .segment-option");
        hsCelebrateBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                hsCelebrateBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updateHighStreakState({ celebrationEnabled: btn.dataset.value === "true" });
            });
        });

        const hsResetBtn = popup.querySelector(".hs-reset-btn");
        if (hsResetBtn) {
            hsResetBtn.addEventListener("click", () => {
                if (confirm("Reset your high streak record to 0?")) {
                    updateHighStreakState({ highStreak: 0 });
                }
            });
        }

    }

    /* ── Now Streak settings ────────────────────────────── */

    if (widgetId === "now-streak-widget") {

        const nsTypeSelect = popup.querySelector(".ns-type-select");
        if (nsTypeSelect) {
            nsTypeSelect.addEventListener("change", event => {
                updateNowStreakState({ streakType: event.target.value });
            });
        }

        const nsCustomLabel = popup.querySelector(".ns-custom-label");
        if (nsCustomLabel) {
            nsCustomLabel.addEventListener("input", event => {
                updateNowStreakState({ customLabel: event.target.value });
            });
        }

        const nsDisplayBtns = popup.querySelectorAll(".ns-display-segment .segment-option");
        nsDisplayBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                nsDisplayBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updateNowStreakState({ displayMode: btn.dataset.value });
            });
        });

    }

    /* ── Today Emotion settings ─────────────────────────── */

    if (widgetId === "today-emotion-widget") {

        const teState = getTodayEmotionState();

        function wireSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    updateTodayEmotionState({ [stateKey]: btn.dataset.value === "true"
                        ? true
                        : btn.dataset.value === "false"
                            ? false
                            : btn.dataset.value
                    });
                });
            });

            const active = popup.querySelector(
                `${selector} .segment-option[data-value="${teState[stateKey]}"]`
            );
            if (active) {
                btns.forEach(b => b.classList.remove("active"));
                active.classList.add("active");
            }
        }

        wireSegment(".te-display-mode-segment", "displayMode");
        wireSegment(".te-selection-mode-segment", "selectionMode");
        wireSegment(".te-effect-segment", "selectedEffect");
        wireSegment(".te-title-segment", "showTitle");

        const countSlider = popup.querySelector(".te-count-slider");
        const countValue = popup.querySelector(".te-count-value");

        if (countSlider) {
            countSlider.value = teState.displayedCount;
            if (countValue) {
                countValue.textContent = teState.displayedCount;
            }
            countSlider.addEventListener("input", event => {
                const count = Number(event.target.value);
                if (countValue) {
                    countValue.textContent = count;
                }
                updateTodayEmotionState({ displayedCount: count });
            });
        }

        const emojiInputs = popup.querySelectorAll(".te-emoji-input");

        emojiInputs.forEach(input => {
            const idx = Number(input.dataset.index);
            input.value = teState.displayedEmojis[idx] || "";
            input.addEventListener("input", () => {
                const emojis = Array.from(emojiInputs).map(i => i.value.trim() || "");
                updateTodayEmotionState({ displayedEmojis: emojis });
            });
        });

        const resetSelect = popup.querySelector(".te-reset-hour-select");

        if (resetSelect) {
            resetSelect.value = teState.resetHour ?? 0;
            resetSelect.addEventListener("change", event => {
                updateTodayEmotionState({ resetHour: Number(event.target.value) });
            });
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