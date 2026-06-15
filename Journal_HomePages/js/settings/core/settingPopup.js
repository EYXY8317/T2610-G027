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
    setGraphSize,
    setChartFontSize
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
    getEmotionSummarySettings
}
from "../widgets/emotionSummarySettings.js";

import {
    updateEmotionSummaryState
}
from "../../widgets/emotionSummary.js";

import {
    updateQuoteState,
    getQuoteState,
    initializeQuote
}
from "../../widgets/quote.js";

import {
    getTodayEmotionSettings
}
from "../widgets/todayEmotionSettings.js";

import {
    getTodayEmotionState,
    updateTodayEmotionState
}
from "../../widgets/todayEmotion.js";

const WIDGET_NAMES = {
    "digital-clock-widget":   "Digital Clock",
    "weather-hour-widget":    "Weather Hours",
    "weather-day-widget":     "Weather Day",
    "weather-week-widget":    "Weather Week",
    "today-emotion-widget":   "Emotion Today",
    "now-streak-widget":      "Now Streak",
    "high-streak-widget":     "High Streak",
    "picture-streak-widget":  "Picture Streak",
    "emotion-summary-widget": "Emotion Summary",
    "quote-widget":           "Quote"
};

export function createSettingPopup(widgetId) {

    closeCurrentPopup();

    const appearanceHTML = getAppearanceSettings();

    let widgetTabs = { style: "", location: "", graph: "", display: "" };

    if (widgetId === "digital-clock-widget") {
        widgetTabs = getDigitalClockSettings();
    }
    else if (widgetId === "weather-day-widget") {
        widgetTabs = getWeatherDaySettings();
    }
    else if (widgetId === "weather-hour-widget") {
        widgetTabs = getWeatherHourSettings();
    }
    else if (widgetId === "weather-week-widget") {
        widgetTabs = getWeatherWeekSettings();
    }
    else if (widgetId === "quote-widget") {
        widgetTabs = getQuoteSettings();
    }
    else if (widgetId === "today-emotion-widget") {
        widgetTabs = getTodayEmotionSettings();
    }
    else if (widgetId === "now-streak-widget") {
        widgetTabs = getNowStreakSettings();
    }
    else if (widgetId === "high-streak-widget") {
        widgetTabs = getHighStreakSettings();
    }
    else if (widgetId === "picture-streak-widget") {
        widgetTabs = getPictureStreakSettings();
    }
    else if (widgetId === "emotion-summary-widget") {
        widgetTabs = getEmotionSummarySettings();
    }
    else {
        widgetTabs = { style: "", location: "", graph: "", display: "<p>Coming Soon</p>" };
    }

    const widgetName = WIDGET_NAMES[widgetId] || widgetId;

    // Only include tabs that have content
    const ALL_TABS = [
        { key: "style",    label: "Style",    content: appearanceHTML + (widgetTabs.style || "") },
        { key: "location", label: "Location", content: widgetTabs.location || "" },
        { key: "graph",    label: "Graph",    content: widgetTabs.graph    || "" },
        { key: "display",  label: "Display",  content: widgetTabs.display  || "" }
    ];

    const visibleTabs = ALL_TABS.filter(t => t.content.trim() !== "");

    const tabBarHTML = visibleTabs.map((t, i) =>
        `<button class="setting-tab${i === 0 ? " active" : ""}" data-tab="${t.key}">${t.label}</button>`
    ).join("");

    const panesHTML = visibleTabs.map((t, i) =>
        `<div class="setting-pane${i === 0 ? " active" : ""}" data-pane="${t.key}">${t.content}</div>`
    ).join("");

    const popup = document.createElement("div");
    popup.className = "setting-popup";

    popup.innerHTML = `

        <div class="setting-header">
            <span>${widgetName}</span>
            <button class="setting-close">✕</button>
        </div>

        <div class="setting-tabs">
            ${tabBarHTML}
        </div>

        <div class="setting-body">
            ${panesHTML}
        </div>

    `;

    popup.querySelector(".setting-close").addEventListener("click", () => closeCurrentPopup());

    const tabBtns = popup.querySelectorAll(".setting-tab");
    tabBtns.forEach(tab => {
        tab.addEventListener("click", () => {
            tabBtns.forEach(t => t.classList.remove("active"));
            popup.querySelectorAll(".setting-pane").forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            popup.querySelector(`.setting-pane[data-pane="${tab.dataset.tab}"]`).classList.add("active");
        });
    });

    document.body.append(popup);

    /* ── Weather Hour: graph controls ─────────────────────── */

    const frequencyButtons = popup.querySelectorAll(".frequency-segment .segment-option");
    const showIconButtons = popup.querySelectorAll(".show-icon-segment .segment-option");
    const showTemperatureButtons = popup.querySelectorAll(".show-temperature-segment .segment-option");
    const graphColorPicker = popup.querySelector(".graph-color-picker");
    const graphSizeSlider = popup.querySelector(".graph-size-slider");
    const graphSizeValue = popup.querySelector(".graph-size-value");

    if (graphSizeSlider && graphSizeValue) {
        graphSizeSlider.addEventListener("input", event => {
            const size = Number(event.target.value);
            graphSizeValue.textContent = size + "%";
            setGraphSize(size);
            renderWeatherHour();
        });
    }

    if (graphColorPicker) {
        graphColorPicker.addEventListener("input", event => {
            setGraphColor(event.target.value);
            renderWeatherHour();
        });
    }

    frequencyButtons.forEach(button => {
        button.addEventListener("click", () => {
            frequencyButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setWeatherFrequency(button.dataset.value);
            renderWeatherHour();
        });
    });

    showIconButtons.forEach(button => {
        button.addEventListener("click", () => {
            showIconButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setShowWeatherIcon(button.dataset.value === "true");
            renderWeatherHour();
        });
    });

    showTemperatureButtons.forEach(button => {
        button.addEventListener("click", () => {
            showTemperatureButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setShowWeatherTemperature(button.dataset.value === "true");
            renderWeatherHour();
        });
    });

    const showHumidityButtons = popup.querySelectorAll(".show-humidity-segment .segment-option");
    showHumidityButtons.forEach(button => {
        button.addEventListener("click", () => {
            showHumidityButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setShowHumidity(button.dataset.value === "true");
            renderWeatherHour();
        });
    });

    /* ── Weather Hour: location controls ──────────────────── */

    const tempUnitButtons = popup.querySelectorAll(".temp-unit-segment .segment-option");
    tempUnitButtons.forEach(button => {
        button.addEventListener("click", () => {
            tempUnitButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setTempUnit(button.dataset.value);
            renderWeatherHour();
        });
    });

    const weatherCitySelect = popup.querySelector(".weather-city-select");
    if (weatherCitySelect) {
        weatherCitySelect.addEventListener("change", event => {
            const [lat, lon] = event.target.value.split(",").map(Number);
            const cityName = event.target.options[event.target.selectedIndex].text;
            setWeatherCity(cityName, lat, lon);
            renderWeatherHour();
        });
    }

    /* ── Digital Clock ────────────────────────────────────── */

    let showSeconds = true;
    let clockFormat = "24h";
    let clockType   = "digital";

    const showSecondsButtons = popup.querySelectorAll(".show-seconds-segment .segment-option");
    showSecondsButtons.forEach(button => {
        button.addEventListener("click", () => {
            showSecondsButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            showSeconds = button.dataset.value === "true";
            setShowSeconds(showSeconds);
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    });

    const clockFormatButtons = popup.querySelectorAll(".clock-format-segment .segment-option");
    const clockTypeButtons   = popup.querySelectorAll(".clock-type-segment .segment-option");

    clockTypeButtons.forEach(button => {
        button.addEventListener("click", () => {
            clockTypeButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            clockType = button.dataset.value;
            setClockType(clockType);
        });
    });

    const flipClockSizeSlider = popup.querySelector(".flip-clock-size-slider");
    const flipClockSizeValue  = popup.querySelector(".flip-clock-size-value");

    if (flipClockSizeSlider) {
        flipClockSizeSlider.addEventListener("input", event => {
            const size = event.target.value;
            flipClockSizeValue.textContent = size + "px";
            setFlipClockSize(Number(size));
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }

    clockFormatButtons.forEach(button => {
        button.addEventListener("click", () => {
            clockFormatButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            clockFormat = button.dataset.value;
            setClockFormat(clockFormat);
            renderDigitalClock(showSeconds, clockFormat);
        });
    });

    const showDateButtons = popup.querySelectorAll(".show-date-segment .segment-option");
    showDateButtons.forEach(button => {
        button.addEventListener("click", () => {
            showDateButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setShowDate(button.dataset.value === "true");
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    });

    const showWeekdayButtons = popup.querySelectorAll(".show-weekday-segment .segment-option");
    showWeekdayButtons.forEach(button => {
        button.addEventListener("click", () => {
            showWeekdayButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            setShowWeekday(button.dataset.value === "true");
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    });

    const timezoneSelect = popup.querySelector(".clock-timezone-select");
    if (timezoneSelect) {
        timezoneSelect.addEventListener("change", event => {
            setTimezone(event.target.value);
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }

    /* ── Appearance controls ──────────────────────────────── */

    const titleColorPicker = popup.querySelector(".title-color-picker");
    if (titleColorPicker) {
        titleColorPicker.addEventListener("input", event => {
            const widget = document.getElementById(widgetId);
            applyTitleColor(widget, event.target.value);
        });
    }

    const titleSizeSlider = popup.querySelector(".title-size-slider");
    const titleSizeValue  = popup.querySelector(".title-size-value");
    if (titleSizeSlider) {
        titleSizeSlider.addEventListener("input", event => {
            const size = event.target.value;
            titleSizeValue.textContent = size + "px";
            const widget = document.getElementById(widgetId);
            applyTitleSize(widget, size);
        });
    }

    const contentColorPicker = popup.querySelector(".content-color-picker");
    if (contentColorPicker) {
        contentColorPicker.addEventListener("input", event => {
            const widget = document.getElementById(widgetId);
            applyContentColor(widget, event.target.value);
        });
    }

    const backgroundColorPicker = popup.querySelector(".background-color-picker");
    if (backgroundColorPicker) {
        backgroundColorPicker.addEventListener("input", event => {
            const widget = document.getElementById(widgetId);
            applyBackgroundColor(widget, event.target.value);
        });
    }

    const backgroundOpacitySlider = popup.querySelector(".background-opacity-slider");
    const backgroundOpacityValue  = popup.querySelector(".background-opacity-value");
    if (backgroundOpacitySlider) {
        backgroundOpacitySlider.addEventListener("input", event => {
            const opacity = event.target.value;
            backgroundOpacityValue.textContent = opacity + "%";
            const widget = document.getElementById(widgetId);
            applyBackgroundOpacity(widget, opacity);
        });
    }

    const contentSizeSlider = popup.querySelector(".content-size-slider");
    const contentSizeValue  = popup.querySelector(".content-size-value");
    if (contentSizeSlider) {
        contentSizeSlider.addEventListener("input", event => {
            const size = event.target.value;
            contentSizeValue.textContent = size + "px";
            const widget = document.getElementById(widgetId);
            applyFontSize(widget, size);

            if (widgetId === "weather-hour-widget") {
                setChartFontSize(Number(size));
                renderWeatherHour();
            }
        });
    }

    const titleButtons = popup.querySelectorAll(".title-segment-option");
    titleButtons.forEach(button => {
        button.addEventListener("click", () => {
            titleButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            const widget = document.getElementById(widgetId);
            applyShowTitle(widget, button.dataset.value === "true");
        });
    });

    /* ── Weather Week ─────────────────────────────────────── */

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

    /* ── Weather Day ──────────────────────────────────────── */

    if (widgetId === "weather-day-widget") {

        function wireWdSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const val = btn.dataset.value === "true" ? true
                        : btn.dataset.value === "false" ? false
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

    /* ── Quote ────────────────────────────────────────────── */

    if (widgetId === "quote-widget") {

        // Category chips — multi-select, keep at least one active
        const qCatBtns = popup.querySelectorAll(".quote-cat-btn");
        qCatBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const cat = btn.dataset.cat;
                const cur = getQuoteState();
                const cats = [...(cur.systemCategories || ["encouragement"])];
                const idx = cats.indexOf(cat);
                if (idx >= 0) {
                    if (cats.length > 1) {
                        cats.splice(idx, 1);
                    }
                } else {
                    cats.push(cat);
                }
                btn.classList.toggle("active", cats.includes(cat));
                updateQuoteState({ systemCategories: cats, currentSystemIndex: 0 });
            });
        });

        // Source chips — multi-select, keep at least one active
        const qSrcBtns = popup.querySelectorAll(".quote-src-btn");
        qSrcBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const src = btn.dataset.src;
                const cur = getQuoteState();
                const sources = [...(cur.showSources || ["system", "user"])];
                const idx = sources.indexOf(src);
                if (idx >= 0) {
                    if (sources.length > 1) {
                        sources.splice(idx, 1);
                    }
                } else {
                    sources.push(src);
                }
                btn.classList.toggle("active", sources.includes(src));
                updateQuoteState({ showSources: sources });
            });
        });

        // Auto Rotate + Rotate Interval
        function wireQSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const val = btn.dataset.value === "true" ? true
                        : btn.dataset.value === "false" ? false
                        : btn.dataset.value;
                    updateQuoteState({ [stateKey]: val });

                    if (stateKey === "autoRotate") {
                        const rotateRow = popup.querySelector(".quote-rotate-daily-segment");
                        if (rotateRow) {
                            rotateRow.style.opacity = val ? "1" : "0.4";
                            rotateRow.style.pointerEvents = val ? "auto" : "none";
                        }
                    }
                });
            });
        }

        wireQSegment(".quote-auto-rotate-segment", "autoRotate");
        wireQSegment(".quote-rotate-daily-segment", "rotateDaily");
        wireQSegment(".quote-font-segment", "fontStyle");

        // Add user quote
        const qAddBtn = popup.querySelector(".quote-add-btn");
        if (qAddBtn) {
            qAddBtn.addEventListener("click", () => {
                const textEl   = popup.querySelector(".quote-user-text");
                const authorEl = popup.querySelector(".quote-user-author");
                const text = textEl?.value.trim();
                if (!text) {
                    return;
                }
                const author = authorEl?.value.trim() || "";
                const cur = getQuoteState();
                updateQuoteState({ userQuotes: [...(cur.userQuotes || []), { text, author }] });
                if (textEl) {
                    textEl.value = "";
                }
                if (authorEl) {
                    authorEl.value = "";
                }
            });
        }

        // Remove saved quote
        const qRemoveBtns = popup.querySelectorAll(".quote-remove-saved");
        qRemoveBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.index);
                const cur = getQuoteState();
                updateQuoteState({ savedQuotes: cur.savedQuotes.filter((_, i) => i !== idx) });
                popup.remove();
                createSettingPopup(widgetId);
            });
        });

    }

    /* ── Emotion Summary ──────────────────────────────────── */

    if (widgetId === "emotion-summary-widget") {

        function wireEsSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    btns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const val = btn.dataset.value === "true" ? true
                        : btn.dataset.value === "false" ? false
                        : btn.dataset.value;
                    updateEmotionSummaryState({ [stateKey]: val });

                    if (stateKey === "timeRange") {
                        const rows = popup.querySelectorAll(".es-custom-range");
                        rows.forEach(r => {
                            r.style.opacity = val === "custom" ? "1" : "0.4";
                            r.style.pointerEvents = val === "custom" ? "auto" : "none";
                        });
                    }
                });
            });
        }

        wireEsSegment(".es-display-segment", "displayMode");
        wireEsSegment(".es-range-segment", "timeRange");
        wireEsSegment(".es-combo-segment", "showCombo");
        wireEsSegment(".es-highlight-segment", "showHighlight");

        const esStart = popup.querySelector(".es-custom-start");
        if (esStart) {
            esStart.addEventListener("change", event => {
                updateEmotionSummaryState({ customStart: event.target.value });
            });
        }

        const esEnd = popup.querySelector(".es-custom-end");
        if (esEnd) {
            esEnd.addEventListener("change", event => {
                updateEmotionSummaryState({ customEnd: event.target.value });
            });
        }

    }

    /* ── Picture Streak ───────────────────────────────────── */

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

    /* ── High Streak ──────────────────────────────────────── */

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

    /* ── Now Streak ───────────────────────────────────────── */

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

    /* ── Today Emotion ────────────────────────────────────── */

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
        const countValue  = popup.querySelector(".te-count-value");

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

    /* ── Drag + register ──────────────────────────────────── */

    const header = popup.querySelector(".setting-header");
    enableSettingDrag(popup, header);
    setCurrentPopup(popup);

    return popup;

}
