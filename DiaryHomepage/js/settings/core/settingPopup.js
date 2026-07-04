import {
    userScopedKey
}
from "../../currentUser.js";

import {
    setShowSeconds,
    setClockFormat,
    setClockType,
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
    getAppearanceSectionsHTML
}
from "../appearance/appearanceSettings.js";

import {
    saveLayout
}
from "../../home/saveLayout.js";

import {
    getWidgetAppearance,
    saveWidgetAppearance,
    applyWidgetAppearance
}
from "../appearance/widgetAppearance.js";

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
    updatePictureStreakPhoto,
    removePictureStreakPhoto,
    getPictureStreakState
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
    autoExpandWidget
}
from "../../dashboard/expandWidget.js";

import {
    getTodayEmotionSettings
}
from "../widgets/todayEmotionSettings.js";

import {
    getTodayEmotionState,
    updateTodayEmotionState
}
from "../../widgets/todayEmotion.js";

import {
    getDiaryCardSettings
}
from "../widgets/diaryCardSettings.js";

import {
    updateDiaryCardState
}
from "../../widgets/diaryCard.js";

import {
    syncLayoutToServer
}
from "../../home/serverLayout.js";

import {
    pushHistory
}
from "../../home/historyManager.js";

import {
    showReminderPopup
}
from "../../shared/reminderPopup.js";

import {
    openImageCropper
}
from "../../shared/cropImage.js";

// 这是右键点击任何一个首页组件时跳出来的"设置弹窗"的核心文件——
// 全站体积最大、逻辑最复杂的一个文件。它做的事情主要有三块：
// 1) 组装弹窗内容：拼接"外观"设置（所有组件共用）+ 这个具体组件
//    专属的设置项（比如天气组件的城市选择、时钟组件的 12/24 小时制）。
// 2) 打开/关闭时的"撤销历史"快照：打开弹窗前先记一份当前设置的
//    快照，关闭时如果设置真的变了，就把"变之前 -> 变之后"存成一条
//    撤销/重做历史，这样用户按 Ctrl+Z 也能撤销在设置面板里做的改动。
// 3) 给弹窗里几十种不同的按钮/滑块/输入框，逐一绑定点击/输入事件——
//    这部分因为每个组件的设置项都不一样，所以按"组件 id"分成一大段
//    一大段的 if 区块，虽然长，但每一段内部逻辑都很直白。
// This is the core file behind the "settings popup" that appears when
// right-clicking any home page widget — the single largest and most
// logically complex file in the whole site. It does three main things:
// 1) Assembles the popup's content: combines the "appearance" settings
//    (shared by every widget) with the settings specific to this widget
//    (e.g. the weather widget's city picker, the clock widget's 12/24
//    hour format).
// 2) Snapshots settings for undo history on open/close: before the popup
//    opens, it records a snapshot of the current settings; when it
//    closes, if the settings actually changed, a "before -> after" entry
//    is pushed onto the undo/redo history, so pressing Ctrl+Z also undoes
//    changes made in the settings panel.
// 3) Wires up click/input event listeners for the dozens of different
//    buttons/sliders/inputs in the popup — since each widget's settings
//    differ, this part is organized into one large if-block per widget
//    id; long, but each block's internal logic is straightforward.


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
    "quote-widget":           "Quote",
    "diary-card-widget":      "Diary"
};

// localStorage keys that hold widget-specific settings (non-appearance)
// 每个组件专属设置（不含"外观"设置）存在哪些 localStorage key 里
const WIDGET_SETTING_KEYS = {
    "weather-hour-widget":    ["weather-config"],
    "weather-day-widget":     ["weather-day-state", "weather-config"],
    "weather-week-widget":    ["weather-week-state", "weather-config"],
    "today-emotion-widget":   ["today-emotion-state"],
    "now-streak-widget":      ["now-streak-display"],
    "high-streak-widget":     ["high-streak-display"],
    "emotion-summary-widget": ["emotion-summary-state"],
    "quote-widget":           ["quote-state"],
    "diary-card-widget":      ["diary-card-state"],
};

// These widgets store per-user data (mood/emotion/quotes/streak display/diary card),
// so their localStorage keys are namespaced by the logged-in username to avoid
// cross-account leaks.
// 这些组件存的是"按用户区分"的数据（心情/情绪/语录/连续天数显示/
// 日记卡片），所以它们的 localStorage key 需要加上用户名做区分，
// 避免不同账号的数据互相泄露/混淆。
const USER_SCOPED_SETTING_KEYS = new Set([
    "today-emotion-state", "emotion-summary-state",
    "quote-state", "diary-card-state", "high-streak-display", "now-streak-display"
]);

function _resolveKey(k) {
    return USER_SCOPED_SETTING_KEYS.has(k) ? userScopedKey(k) : k;
}

// 给某个组件的所有专属设置 key 拍一张"快照"（当前存的值是什么），
// 用来跟弹窗关闭时的状态比较，判断这次打开设置面板到底有没有真的
// 改动过什么。Picture Streak 比较特殊，用的是它自己实例专属的
// "<id>-state" key，不在通用的 WIDGET_SETTING_KEYS 表里。
// Takes a "snapshot" of every setting key specific to a widget (what
// value is currently stored), used to compare against the state when the
// popup closes, to determine whether anything was actually changed
// during this settings session. Picture Streak is special-cased, using
// its own instance-specific "<id>-state" key rather than being listed in
// the general WIDGET_SETTING_KEYS table.
function snapshotWidgetSettings(widgetId) {
    if (widgetId.startsWith("picture-streak-widget")) {
        const key = userScopedKey(`${widgetId}-state`);
        return { [key]: localStorage.getItem(key) };
    }
    const keys = WIDGET_SETTING_KEYS[widgetId] || [];
    const snap = {};
    keys.forEach(k => { snap[k] = localStorage.getItem(_resolveKey(k)); });
    return snap;
}

function snapshotsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function restoreWidgetSettings(snap) {
    Object.entries(snap).forEach(([k, v]) => {
        const resolved = _resolveKey(k);
        if (v === null) localStorage.removeItem(resolved);
        else localStorage.setItem(resolved, v);
    });
}

// Re-render a widget from its current localStorage state after a settings restore
// 撤销/重做发生后，把某个组件的画面用它当前 localStorage 里的最新
// 状态重新渲染一遍（每种组件调用各自的更新函数）。
function reRenderWidget(widgetId) {
    if (widgetId === "weather-hour-widget") {
        renderWeatherHour();
    } else if (widgetId === "weather-day-widget") {
        renderWeatherDay();
    } else if (widgetId === "weather-week-widget") {
        renderWeatherWeek();
    } else if (widgetId === "now-streak-widget") {
        updateNowStreakState({});
    } else if (widgetId === "high-streak-widget") {
        updateHighStreakState({});
    } else if (widgetId === "emotion-summary-widget") {
        updateEmotionSummaryState({});
    } else if (widgetId === "quote-widget") {
        updateQuoteState({});
    } else if (widgetId === "today-emotion-widget") {
        updateTodayEmotionState({});
    } else if (widgetId === "diary-card-widget") {
        updateDiaryCardState({});
    } else if (widgetId.startsWith("picture-streak-widget")) {
        updatePictureStreakState(widgetId, {});
    }
}

// ── Auto-expand any widget when settings cause content to overflow ────────────
// ── 当设置改动导致内容溢出时，自动放大对应的组件 ────────────

let _contentObserver = null;
let _lastOpenSections = []; // global: whichever sections were open carries over to next widget

// 用 MutationObserver 监听组件内容区域的 DOM 变化（比如切换了显示
// 模式导致内容变多），一旦检测到变化就（防抖 120ms 后）触发一次
// 自动扩展检查，避免设置改动后内容被组件边界裁切掉。
// Uses a MutationObserver to watch the widget's content area for DOM
// changes (e.g. switching display mode adds more content); once a change
// is detected, it triggers (after a 120ms debounce) an auto-expand check,
// so a settings change never leaves content clipped by the widget's
// boundary.
function attachContentObserver(widgetId) {
    if (_contentObserver) {
        _contentObserver.disconnect();
        _contentObserver = null;
    }
    const widgetEl  = document.getElementById(widgetId);
    const contentEl = widgetEl?.querySelector(".widget-content");
    if (!contentEl) return;
    let debounce = null;
    _contentObserver = new MutationObserver(() => {
        clearTimeout(debounce);
        debounce = setTimeout(() => autoExpandWidget(widgetId), 120);
    });
    _contentObserver.observe(contentEl, { childList: true, subtree: true });
}

// ──────────────────────────────────────────────────────────────────────────────

export function createSettingPopup(widgetId) {

    // Save which sections are currently open so the next widget inherits them
    // 记住当前弹窗里哪些折叠区块是展开的，这样切换到下一个组件的
    // 设置面板时，同名的区块也会自动保持展开（不用每次都重新点开）。
    const prev = document.querySelector(".setting-popup");
    if (prev) {
        _lastOpenSections = [];
        prev.querySelectorAll(".setting-section.open .setting-section-toggle h3")
            .forEach(h => _lastOpenSections.push(h.textContent.trim()));
    }

    if (_contentObserver) { _contentObserver.disconnect(); _contentObserver = null; }
    closeCurrentPopup();

    const _settingsBefore = snapshotWidgetSettings(widgetId);

    const savedApp       = getWidgetAppearance(widgetId) || {};
    const appearanceHTML = getAppearanceSectionsHTML(savedApp);

    // 按组件 id 挑出这个组件专属的设置面板内容（每个组件的设置函数
    // 都返回 { style, location, graph, display } 这四个区块的 HTML
    // 字符串，具体用到哪几个区块由各组件自己决定）。
    // Picks out this widget's specific settings panel content by id
    // (each widget's settings function returns HTML strings for the four
    // sections { style, location, graph, display } — which of these
    // sections are actually used is up to each individual widget).
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
    else if (widgetId.startsWith("picture-streak-widget")) {
        widgetTabs = getPictureStreakSettings(widgetId);
    }
    else if (widgetId === "emotion-summary-widget") {
        widgetTabs = getEmotionSummarySettings();
    }
    else if (widgetId === "diary-card-widget") {
        widgetTabs = getDiaryCardSettings();
    }
    else {
        widgetTabs = { style: "", location: "", graph: "", display: "<p>Coming Soon</p>" };
    }

    const widgetName = WIDGET_NAMES[widgetId] || widgetId;

    // 把四个区块（style/location/graph/display）的 HTML 拼在一起，
    // 再用正则表达式按每个 <h3> 标题切开，变成一个个独立的"小节"
    // 数组——这样才能把每一小节包进可折叠的 .setting-section 容器里。
    // Concatenates the four sections (style/location/graph/display) into
    // one string, then splits it at each <h3> heading using a regex,
    // turning it into an array of independent "subsections" — this is
    // what lets each subsection be wrapped in a collapsible
    // .setting-section container.
    const _allChunks = [widgetTabs.style, widgetTabs.location, widgetTabs.graph, widgetTabs.display]
        .filter(s => s && s.trim())
        .flatMap(s => s.trim().split(/(?=<h3\b[^>]*>)/i).filter(p => p.trim()));

    // "Display Elements" 这个小节比较特殊，不管它原本在哪个区块，
    // 统一挪到最后面显示，让"开关类"的设置项都集中在面板底部。
    // The "Display Elements" subsection is special-cased — no matter
    // which section it originally came from, it's always moved to appear
    // last, so all the toggle-style settings end up grouped at the
    // bottom of the panel.
    const _isDE = s => /<h3[^>]*>\s*Display Elements\s*<\/h3>/i.test(s);
    const _deChunks    = _allChunks.filter(_isDE);
    const _otherChunks = _allChunks.filter(s => !_isDE(s));

    const widgetExtra = [..._otherChunks, ..._deChunks]
        .map(s => {
            const m = s.match(/^<h3[^>]*>(.*?)<\/h3>([\s\S]*)$/i);
            if (m) {
                return `
                    <div class="setting-section">
                        <div class="setting-section-toggle">
                            <h3>${m[1]}</h3>
                            <span class="setting-section-chevron">›</span>
                        </div>
                        <div class="setting-section-body">${m[2].trim()}</div>
                    </div>`;
            }
            return `<div class="setting-section">${s}</div>`;
        })
        .join("");

    const popup = document.createElement("div");
    popup.className = "setting-popup";

    popup.innerHTML = `
        <div class="setting-header">
            <span>${widgetName}</span>
            <button class="setting-close">✕</button>
        </div>
        <div class="setting-body">
            ${appearanceHTML}
            ${widgetExtra}
        </div>
    `;

    // 关闭弹窗时：比较关闭前后的设置快照，如果真的有变化，就记一条
    // 撤销/重做历史（这样在弹窗外按 Ctrl+Z 也能撤销刚才在设置里做的
    // 改动），然后把最新布局同步到服务器。
    // On closing the popup: compares the before/after settings snapshots
    // — if something actually changed, one undo/redo history entry is
    // recorded (so pressing Ctrl+Z outside the popup can undo whatever
    // was just changed in settings), then syncs the latest layout to the
    // server.
    popup.querySelector(".setting-close").addEventListener("click", () => {
        if (_contentObserver) { _contentObserver.disconnect(); _contentObserver = null; }

        const _settingsAfter = snapshotWidgetSettings(widgetId);
        if (!snapshotsEqual(_settingsBefore, _settingsAfter)) {
            const wid    = widgetId;
            const before = _settingsBefore;
            const after  = _settingsAfter;
            pushHistory({
                revert() {
                    restoreWidgetSettings(before);
                    reRenderWidget(wid);
                },
                apply() {
                    restoreWidgetSettings(after);
                    reRenderWidget(wid);
                }
            });
        }

        syncLayoutToServer();
        closeCurrentPopup();
    });

    document.body.append(popup);

    // Position popup outside the widget card
    // 把弹窗定位在组件卡片的旁边（优先放右边，右边放不下就放左边，
    // 并且限制在浏览器视窗范围内，不会被拖出屏幕看不见）。
    const widgetEl = document.getElementById(widgetId);
    if (widgetEl) {
        const r  = widgetEl.getBoundingClientRect();
        const pw = popup.offsetWidth  || 420;
        const ph = popup.offsetHeight || 600;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const GAP = 12;

        // Prefer right side; fall back to left; clamp within viewport
        let left = r.right + GAP;
        if (left + pw > vw - GAP) left = r.left - pw - GAP;
        if (left < GAP) left = vw - pw - GAP;

        // Align top with widget, clamp vertically
        let top = Math.min(r.top, vh - ph - GAP);
        if (top < GAP) top = GAP;

        popup.style.left = left + "px";
        popup.style.top  = top  + "px";
    }

    attachContentObserver(widgetId);

    /* ── Title alignment ─────────────────────────────────────── */
    /* ── 标题对齐方式 ─────────────────────────────────────── */

    const titleAlignBtns = popup.querySelectorAll(".title-align-option");
    titleAlignBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            titleAlignBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            saveWidgetAppearance(widgetId, { titleAlign: btn.dataset.value });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    });

    /* ── Title scale (1 / 2 / 3) ─────────────────────────────── */
    /* ── 标题大小（1 / 2 / 3 三档） ─────────────────────────────── */
    const titleScaleBtns = popup.querySelectorAll(".title-scale-option");
    titleScaleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            titleScaleBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            saveWidgetAppearance(widgetId, { titleScale: btn.dataset.value });
            const widgetEl = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (updatedApp && widgetEl) applyWidgetAppearance(widgetEl, updatedApp);
        });
    });

    /* ── Content scale (S / M / L) — shared across all widgets ─── */
    /* ── 内容大小（小/中/大）——所有组件共用 ─── */
    const contentScaleBtns = popup.querySelectorAll(".content-scale-segment .segment-option");
    contentScaleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            contentScaleBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            saveWidgetAppearance(widgetId, { contentScale: btn.dataset.value });
            const updatedApp = getWidgetAppearance(widgetId);
            const widgetEl = document.getElementById(widgetId);
            if (updatedApp && widgetEl) {
                applyWidgetAppearance(widgetEl, updatedApp);
                widgetEl.dispatchEvent(new CustomEvent("widgetresize"));
            }
        });
    });

    /* ── Weather Hour: graph controls ─────────────────────── */
    /* ── Weather Hour 组件：图表相关控制项 ─────────────────────── */

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

    // Weather Hour toggle chip handlers
    // Weather Hour 组件的小开关（chip）点击事件
    const whIconChip = popup.querySelector(".wh-icon-chip");
    if (whIconChip) {
        whIconChip.addEventListener("click", () => {
            setShowWeatherIcon(whIconChip.classList.toggle("active"));
            renderWeatherHour();
        });
    }
    const whTempChip = popup.querySelector(".wh-temp-chip");
    if (whTempChip) {
        whTempChip.addEventListener("click", () => {
            setShowWeatherTemperature(whTempChip.classList.toggle("active"));
            renderWeatherHour();
        });
    }
    const whHumChip = popup.querySelector(".wh-humidity-chip");
    if (whHumChip) {
        whHumChip.addEventListener("click", () => {
            setShowHumidity(whHumChip.classList.toggle("active"));
            renderWeatherHour();
        });
    }

    /* ── Weather Hour: location controls ──────────────────── */
    /* ── Weather Hour 组件：位置/城市相关控制项 ──────────────────── */

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
    /* ── 数字时钟组件 ────────────────────────────────────── */

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

    const showSecondsChip = popup.querySelector(".show-seconds-chip");
    if (showSecondsChip) {
        showSecondsChip.addEventListener("click", () => {
            showSeconds = showSecondsChip.classList.toggle("active");
            setShowSeconds(showSeconds);
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }

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

    clockFormatButtons.forEach(button => {
        button.addEventListener("click", () => {
            clockFormatButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            clockFormat = button.dataset.value;
            setClockFormat(clockFormat);
            renderDigitalClock(showSeconds, clockFormat);
        });
    });

    const timezoneSelect = popup.querySelector(".clock-timezone-select");
    if (timezoneSelect) {
        timezoneSelect.addEventListener("change", event => {
            setTimezone(event.target.value);
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }

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

    const showDateChip = popup.querySelector(".show-date-chip");
    if (showDateChip) {
        showDateChip.addEventListener("click", () => {
            setShowDate(showDateChip.classList.toggle("active"));
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }
    const showWeekdayChip = popup.querySelector(".show-weekday-chip");
    if (showWeekdayChip) {
        showWeekdayChip.addEventListener("click", () => {
            setShowWeekday(showWeekdayChip.classList.toggle("active"));
            renderDigitalClock(showSeconds, clockFormat, clockType);
        });
    }


    /* ── Universal Color Palette ─────────────────────────── */
    /* ── 通用配色方案卡片（所有组件共用） ─────────────────────────── */

    // 每张配色方案卡片存了 3 种颜色（colors 数组）；点击一次会用
    // 第 1 种颜色当背景、第 2 种当标题、第 3 种当内容；再点一次同一张
    // 卡片，颜色顺序会"轮转"一次（rot++ 再取模 3），让用户不用切换
    // 到别的卡片，也能看到这组配色的另外两种排列组合。
    // Each color palette card stores 3 colors (the colors array); the
    // first click uses color[0] as background, color[1] as title, and
    // color[2] as content; clicking the same card again "rotates" the
    // color order (rot++ modulo 3), so the user can see two other
    // arrangements of the same three colors without switching to a
    // different card.
    const apPaletteBtns = popup.querySelectorAll(".ap-palette-card");
    apPaletteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const colors   = JSON.parse(btn.dataset.colors);
            const isActive = btn.classList.contains("active");
            const prevRot  = isActive ? (parseInt(btn.dataset.rotate || "0", 10)) : -1;
            const rot      = (prevRot + 1) % 3;
            const bg       = colors[rot];
            const titleC   = colors[(rot + 1) % 3];
            const contentC = colors[(rot + 2) % 3];
            saveWidgetAppearance(widgetId, {
                backgroundColor: bg,
                titleColor:      titleC,
                contentColor:    contentC
            });
            const widgetEl   = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widgetEl && updatedApp) applyWidgetAppearance(widgetEl, updatedApp);
            const bgPicker      = popup.querySelector(".background-color-picker");
            const titlePicker   = popup.querySelector(".title-color-picker");
            const contentPicker = popup.querySelector(".content-color-picker");
            if (bgPicker)      bgPicker.value      = bg;
            if (titlePicker)   titlePicker.value   = titleC;
            if (contentPicker) contentPicker.value = contentC;
            apPaletteBtns.forEach(b => { b.classList.remove("active"); delete b.dataset.rotate; });
            btn.classList.add("active");
            btn.dataset.rotate = String(rot);
        });
    });

    /* ── Palette category chips ──────────────────────────── */
    /* ── 配色方案的分类标签 ──────────────────────────── */

    const catChips = popup.querySelectorAll(".palette-cat-chip");
    catChips.forEach(chip => {
        chip.addEventListener("click", () => {
            catChips.forEach(c => c.classList.remove("active"));
            popup.querySelectorAll(".palette-cat-grid").forEach(g => g.classList.remove("active"));
            chip.classList.add("active");
            const grid = popup.querySelector(`.palette-cat-grid[data-cat="${chip.dataset.cat}"]`);
            if (grid) grid.classList.add("active");
        });
    });

    /* ── Appearance controls ──────────────────────────────── */
    /* ── 外观控制项（颜色选择器、透明度滑块、边框等） ──────────────────────────────── */

    const titleColorPicker = popup.querySelector(".title-color-picker");
    if (titleColorPicker) {
        titleColorPicker.addEventListener("input", event => {
            saveWidgetAppearance(widgetId, { titleColor: event.target.value });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    const contentColorPicker = popup.querySelector(".content-color-picker");
    if (contentColorPicker) {
        contentColorPicker.addEventListener("input", event => {
            saveWidgetAppearance(widgetId, { contentColor: event.target.value });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    const backgroundColorPicker = popup.querySelector(".background-color-picker");
    if (backgroundColorPicker) {
        backgroundColorPicker.addEventListener("input", event => {
            saveWidgetAppearance(widgetId, { backgroundColor: event.target.value });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    const backgroundOpacitySlider = popup.querySelector(".background-opacity-slider");
    const backgroundOpacityValue  = popup.querySelector(".background-opacity-value");
    if (backgroundOpacitySlider) {
        backgroundOpacitySlider.addEventListener("input", event => {
            const opacity = event.target.value;
            backgroundOpacityValue.textContent = opacity + "%";
            saveWidgetAppearance(widgetId, { backgroundOpacity: Number(opacity) });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    const borderColorPicker = popup.querySelector(".border-color-picker");
    if (borderColorPicker) {
        borderColorPicker.addEventListener("input", event => {
            saveWidgetAppearance(widgetId, { borderColor: event.target.value });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    const borderWidthSlider = popup.querySelector(".border-width-slider");
    const borderWidthValue  = popup.querySelector(".border-width-value");
    if (borderWidthSlider) {
        borderWidthSlider.addEventListener("input", event => {
            const bw = parseFloat(event.target.value);
            if (borderWidthValue) borderWidthValue.textContent = bw + "px";
            saveWidgetAppearance(widgetId, { borderWidth: bw });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
        });
    }

    /* ── Apply to All ────────────────────────────────────────── */
    /* ── "应用到全部组件"按钮 ────────────────────────────────────────── */

    // 把当前这个组件的颜色/边框设置，一次性套用到所有其他组件上，
    // 但只影响颜色和边框，不会碰到每个组件各自专属的设置项。
    // Applies this widget's current color/border settings to every other
    // widget in one go, affecting only colors and border — each widget's
    // own specific settings are left untouched.
    const applyToAllBtn = popup.querySelector(".apply-to-all-btn");
    if (applyToAllBtn) {
        applyToAllBtn.addEventListener("click", () => {
            showReminderPopup({
                title: "Apply to All Widgets",
                message: "This will apply the current colors and border style to all widgets. Each widget's other settings will not be affected.",
                confirmText: "Apply",
                cancelText: "Cancel",
                onConfirm: () => {
                    const sourceApp = getWidgetAppearance(widgetId) || {};
                    const shared = {
                        backgroundColor:   sourceApp.backgroundColor,
                        backgroundOpacity: sourceApp.backgroundOpacity,
                        titleColor:        sourceApp.titleColor,
                        contentColor:      sourceApp.contentColor,
                        borderColor:       sourceApp.borderColor,
                        borderWidth:       sourceApp.borderWidth,
                        showBorder:        sourceApp.showBorder
                    };
                    Object.keys(WIDGET_NAMES).forEach(id => {
                        saveWidgetAppearance(id, shared);
                        const el = document.getElementById(id);
                        const app = getWidgetAppearance(id);
                        if (el && app) applyWidgetAppearance(el, app);
                    });
                }
            });
        });
    }

    /* ── Individual "Apply to All" buttons ──────────────────── */
    /* ── 单个设置项各自的"应用到全部"按钮 ──────────────────── */

    const ALL_KEY_LABELS = {
        backgroundColor:   "Background Color",
        titleColor:        "Title Color",
        contentColor:      "Content Color",
        borderColor:       "Border Color",
        backgroundOpacity: "Background Opacity",
        titleScale:        "Title Size",
        titleAlign:        "Title Align",
        contentScale:      "Content Size",
        borderWidth:       "Border Width",
    };

    /* ── Section-level "Apply All" buttons ──────────────────── */
    /* ── 按"整个小节"批量应用的按钮 ──────────────────── */

    const SECTION_ALL_KEYS = {
        palette: ["backgroundColor", "titleColor", "contentColor"],
        colors:  ["backgroundColor", "titleColor", "contentColor", "borderColor", "backgroundOpacity"],
        title:   ["showTitle", "titleColor", "titleScale", "titleAlign"],
        content: ["contentColor", "contentScale"],
        border:  ["showBorder", "borderColor", "borderWidth"],
    };
    const SECTION_ALL_LABELS = {
        palette: "Palette Colors",
        colors:  "All Colors",
        title:   "All Title Settings",
        content: "All Content Settings",
        border:  "All Border Settings",
    };

    // 跟上面单个按钮的逻辑一样，只是这里一次批量应用"一整组"相关的
    // 设置键（比如"标题"这一组包含 showTitle/titleColor/titleScale/
    // titleAlign 四个键一起套用）。
    // Same idea as the single-key buttons above, except this applies an
    // entire related group of setting keys at once (e.g. the "title"
    // group bundles showTitle/titleColor/titleScale/titleAlign together).
    popup.querySelectorAll(".section-all-btn[data-section-all]").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const sKey  = btn.dataset.sectionAll;
            const keys  = SECTION_ALL_KEYS[sKey] || [];
            const label = SECTION_ALL_LABELS[sKey] || sKey;
            showReminderPopup({
                title: `Apply ${label} to All Widgets`,
                message: `This will apply the current ${label.toLowerCase()} to all widgets.`,
                confirmText: "Apply",
                cancelText: "Cancel",
                onConfirm: () => {
                    const sourceApp = getWidgetAppearance(widgetId) || {};
                    const patch = {};
                    keys.forEach(k => { if (sourceApp[k] !== undefined) patch[k] = sourceApp[k]; });
                    Object.keys(WIDGET_NAMES).forEach(id => {
                        saveWidgetAppearance(id, patch);
                        const el = document.getElementById(id);
                        const app = getWidgetAppearance(id);
                        if (el && app) applyWidgetAppearance(el, app);
                    });
                }
            });
        });
    });

    popup.querySelectorAll(".apply-all-button[data-all-key]").forEach(btn => {
        btn.addEventListener("click", () => {
            const key   = btn.dataset.allKey;
            const label = ALL_KEY_LABELS[key] || key;
            showReminderPopup({
                title: `Apply ${label} to All Widgets`,
                message: `This will apply the current ${label.toLowerCase()} to all widgets.`,
                confirmText: "Apply",
                cancelText: "Cancel",
                onConfirm: () => {
                    const sourceApp = getWidgetAppearance(widgetId) || {};
                    const value = sourceApp[key];
                    if (value === undefined) return;
                    Object.keys(WIDGET_NAMES).forEach(id => {
                        saveWidgetAppearance(id, { [key]: value });
                        const el = document.getElementById(id);
                        const app = getWidgetAppearance(id);
                        if (el && app) applyWidgetAppearance(el, app);
                    });
                }
            });
        });
    });

    const titleButtons = popup.querySelectorAll(".title-segment-option");
    titleButtons.forEach(button => {
        button.addEventListener("click", () => {
            titleButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            const visible = button.dataset.value === "true";
            const widget = document.getElementById(widgetId);
            applyShowTitle(widget, visible);
            saveWidgetAppearance(widgetId, { showTitle: visible });
            // Header lives outside .widget-content so MutationObserver won't catch this
            // 标题栏不在 .widget-content 里面，所以上面的 MutationObserver
            // 监测不到这个变化，需要手动调用一次自动扩展检查。
            autoExpandWidget(widgetId);
            ["title-color-row", "title-align-row", "title-size-row"].forEach(cls => {
                const row = popup.querySelector("." + cls);
                if (row) row.style.display = visible ? "" : "none";
            });
        });
    });

    const borderButtons = popup.querySelectorAll(".border-segment-option");
    borderButtons.forEach(button => {
        button.addEventListener("click", () => {
            borderButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            const show = button.dataset.value === "true";
            saveWidgetAppearance(widgetId, { showBorder: show });
            const widget = document.getElementById(widgetId);
            const updatedApp = getWidgetAppearance(widgetId);
            if (widget && updatedApp) applyWidgetAppearance(widget, updatedApp);
            popup.querySelectorAll(".border-color-row, .border-width-row, .border-width-slider-row")
                .forEach(el => { el.style.display = show ? "" : "none"; });
        });
    });

    /* ── Section accordion toggles ──────────────────────── */
    /* ── 折叠区块的展开/收起 ──────────────────────── */

    popup.querySelectorAll(".setting-section-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            toggle.closest(".setting-section").classList.toggle("open");
        });
    });

    /* ── Width / Height size inputs ─────────────────────── */
    /* ── 宽度/高度数字输入框 ─────────────────────── */

    const targetWidget = document.getElementById(widgetId);
    const widthInput   = popup.querySelector(".widget-width-input");
    const heightInput  = popup.querySelector(".widget-height-input");

    if (widthInput && targetWidget) {
        widthInput.value = parseInt(targetWidget.style.width) || "";
        widthInput.addEventListener("input", () => {
            const v = parseInt(widthInput.value);
            if (v >= 80) {
                targetWidget.style.width = v + "px";
                saveLayout(targetWidget);
                targetWidget.dispatchEvent(new CustomEvent("widgetresize"));
            }
        });
    }

    if (heightInput && targetWidget) {
        heightInput.value = parseInt(targetWidget.style.height) || "";
        heightInput.addEventListener("input", () => {
            const v = parseInt(heightInput.value);
            if (v >= 60) {
                targetWidget.style.height = v + "px";
                saveLayout(targetWidget);
                targetWidget.dispatchEvent(new CustomEvent("widgetresize"));
            }
        });
    }

    /* ── Weather Week ─────────────────────────────────────── */
    /* ── Weather Week 组件专属设置 ─────────────────────────────────────── */

    if (widgetId === "weather-week-widget") {

        // 通用的"分段按钮组"绑定函数：点击某个选项时，把其他选项的
        // active 样式去掉，只留这个选中的，并把值（自动判断是布尔值、
        // 数字还是字符串）存进状态里。后面 Weather Day / Quote /
        // Emotion Summary 等组件都用同样的模式各自定义了一份。
        // A generic "segment button group" wiring helper: clicking an
        // option removes the "active" style from the others, keeps it
        // only on the one clicked, and saves the value (auto-detecting
        // whether it's boolean, number, or string) into state. Weather
        // Day / Quote / Emotion Summary and other widgets below each
        // define their own copy of this same pattern.
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

        wireWwSegment(".ww-days-segment", "showDays");

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateWeatherWeekState({ [chip.dataset.statekey]: isOn });
            });
        });

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
    /* ── Weather Day 组件专属设置 ──────────────────────────────────────── */

    if (widgetId === "weather-day-widget") {

        function wireWdSegment(selector, stateKey) {
            const btns = popup.querySelectorAll(`${selector} .segment-option`);
            btns.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (btn.disabled) return;
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

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateWeatherDayState({ [chip.dataset.statekey]: isOn });
            });
        });

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
    /* ── Quote 组件专属设置 ────────────────────────────────────────── */

    if (widgetId === "quote-widget") {

        // Category chips — multi-select, keep at least one active
        // 分类标签——可以多选，但强制至少保留一个是选中状态
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
        // 来源标签（系统语录/我的语录）——同样可以多选，至少保留一个选中
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
        // 自动轮播 + 轮播间隔
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
                        const rotateRow = popup.querySelector(".quote-rotate-daily-segment")?.closest(".setting-row");
                        if (rotateRow) rotateRow.style.display = val ? "" : "none";
                    }
                });
            });
        }

        wireQSegment(".quote-auto-rotate-segment", "autoRotate");
        wireQSegment(".quote-rotate-daily-segment", "rotateDaily");
        wireQSegment(".quote-font-segment", "fontStyle");

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateQuoteState({ [chip.dataset.statekey]: isOn });
            });
        });

        const qTextColorPicker = popup.querySelector(".quote-text-color-picker");
        if (qTextColorPicker) {
            qTextColorPicker.addEventListener("input", event => {
                updateQuoteState({ textColor: event.target.value });
            });
        }

        const qAuthorColorPicker = popup.querySelector(".quote-author-color-picker");
        if (qAuthorColorPicker) {
            qAuthorColorPicker.addEventListener("input", event => {
                updateQuoteState({ authorColor: event.target.value });
            });
        }

        // Add user quote
        // 添加用户自己写的语录
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
        // 删除已收藏的语录
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
    /* ── Emotion Summary 组件专属设置 ──────────────────────────────────── */

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
                            r.style.display = val === "custom" ? "" : "none";
                        });
                    }
                    if (stateKey === "displayMode") {
                        // 切换显示模式（饼图/折线图/日历）时，动态显示或隐藏
                        // 只跟特定模式相关的设置小节（比如"图表样式"只在折线图
                        // 模式下才有意义；"时间范围"在日历模式下不需要，因为
                        // 日历本身就是按月份浏览的）。
                        // When switching display mode (pie/line/calendar),
                        // dynamically shows/hides settings subsections that
                        // only make sense for a specific mode (e.g. "Graph
                        // Style" is only meaningful in line-chart mode; "Time
                        // Range" isn't needed in calendar mode since the
                        // calendar already browses month by month).
                        const graphStyleSec = [...popup.querySelectorAll(".setting-section h3")]
                            .find(h => h.textContent.trim() === "Graph Style")
                            ?.closest(".setting-section");
                        if (graphStyleSec) graphStyleSec.style.display = val === "line" ? "" : "none";

                        const timeRangeSec = [...popup.querySelectorAll(".setting-section h3")]
                            .find(h => h.textContent.trim() === "Time Range")
                            ?.closest(".setting-section");
                        if (timeRangeSec) timeRangeSec.style.display = val === "calendar" ? "none" : "";
                    }
                });
            });
        }

        wireEsSegment(".es-display-segment", "displayMode");
        wireEsSegment(".es-range-segment", "timeRange");
        wireEsSegment(".es-line-width-segment", "graphLineWidth");

        // Hide Graph Style when not in Line mode; hide Time Range when in Calendar mode
        // 弹窗刚打开时，也要按当前已保存的显示模式，先把不相关的小节隐藏起来
        // （不然要等用户点一次分段按钮才会生效，会有一瞬间显示错误的小节）
        const _esInitMode = popup.querySelector(".es-display-segment .segment-option.active")?.dataset.value || "pie";
        const _esGraphStyleSec = [...popup.querySelectorAll(".setting-section h3")]
            .find(h => h.textContent.trim() === "Graph Style")
            ?.closest(".setting-section");
        if (_esGraphStyleSec) _esGraphStyleSec.style.display = _esInitMode === "line" ? "" : "none";

        const _esTimeRangeSec = [...popup.querySelectorAll(".setting-section h3")]
            .find(h => h.textContent.trim() === "Time Range")
            ?.closest(".setting-section");
        if (_esTimeRangeSec) _esTimeRangeSec.style.display = _esInitMode === "calendar" ? "none" : "";

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateEmotionSummaryState({ [chip.dataset.statekey]: isOn });
            });
        });

        const esGraphColor = popup.querySelector(".es-graph-color-picker");
        if (esGraphColor) {
            esGraphColor.addEventListener("input", event => {
                updateEmotionSummaryState({ graphColor: event.target.value });
            });
        }

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
    /* ── Picture Streak 组件专属设置 ───────────────────────────────────── */

    if (widgetId.startsWith("picture-streak-widget")) {

        // 上传新照片：用 FileReader 把选中的图片文件读成 data URL，
        // 打开裁剪弹窗让用户裁出想要的部分，裁剪确认后再把图片缩小到
        // 最大 1000px（照片是用 base64 存在 localStorage 里的，
        // 每个来源大概只有 5~10MB 的配额，原始分辨率的照片存不了几张
        // 就会爆满），最后用 JPEG 格式压缩存储、重新打开设置面板刷新
        // 显示。如果存储空间真的满了会弹出提示，而不是让保存操作
        // 静默失败。
        // Uploading a new photo: uses a FileReader to read the selected
        // image file into a data URL, opens the crop popup so the user
        // can crop the part they want, then after confirming the crop,
        // downscales it to at most 1000px (photos are stored as base64 in
        // localStorage — each origin only gets roughly a 5-10MB quota, so
        // full-resolution photos could exhaust it after just a few), and
        // finally compresses it to JPEG format for storage and reopens
        // the settings panel to refresh the display. If storage really is
        // full, a popup warns the user instead of letting the save fail
        // silently.
        const psPhotoInput = popup.querySelector(".ps-photo-input");
        if (psPhotoInput) {
            psPhotoInput.addEventListener("change", event => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    openImageCropper(reader.result, {
                        onCancel: () => { psPhotoInput.value = ""; },
                        onApply: (croppedDataUrl) => {
                            const img = new Image();
                            img.onload = () => {
                                // Downscale before storing — photos are kept as base64 in
                                // localStorage (5-10MB quota per origin), so full-resolution
                                // uploads can exhaust it after just a few photos.
                                const MAX_DIM = 1000;
                                let { width, height } = img;
                                if (width > MAX_DIM || height > MAX_DIM) {
                                    const scale = MAX_DIM / Math.max(width, height);
                                    width = Math.round(width * scale);
                                    height = Math.round(height * scale);
                                }
                                const canvas = document.createElement("canvas");
                                canvas.width = width;
                                canvas.height = height;
                                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                                const compressed = canvas.toDataURL("image/jpeg", 0.82);

                                try {
                                    addPictureStreakPhoto(widgetId, compressed, file.name);
                                    popup.remove();
                                    createSettingPopup(widgetId);
                                } catch (err) {
                                    showReminderPopup({
                                        title: "Storage Full",
                                        message: "Couldn't save photo — local storage is full. Try removing some existing photos first.",
                                        confirmText: "OK"
                                    });
                                }
                            };
                            img.src = croppedDataUrl;
                        }
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        const psRemoveBtns = popup.querySelectorAll(".ps-remove-btn");
        psRemoveBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.index);
                removePictureStreakPhoto(widgetId, idx);
                popup.remove();
                createSettingPopup(widgetId);
            });
        });

        const psCropBtns = popup.querySelectorAll(".ps-crop-btn");
        psCropBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = Number(btn.dataset.index);
                const photo = getPictureStreakState(widgetId).photos[idx];
                if (!photo) return;
                openImageCropper(photo.dataUrl, {
                    onApply: (croppedDataUrl) => {
                        updatePictureStreakPhoto(widgetId, idx, croppedDataUrl);
                        popup.remove();
                        createSettingPopup(widgetId);
                    }
                });
            });
        });

        const _psOptionsSec = () => [...popup.querySelectorAll(".setting-section h3")]
            .find(h => h.textContent.trim() === "Options")
            ?.closest(".setting-section");

        const psDisplayBtns = popup.querySelectorAll(".ps-display-segment .segment-option");
        psDisplayBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                psDisplayBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updatePictureStreakState(widgetId, { displayMode: btn.dataset.value });

                const optionsSec = _psOptionsSec();
                if (optionsSec) optionsSec.style.display = btn.dataset.value === "scroll" ? "" : "none";
            });
        });

        const _psInitMode = popup.querySelector(".ps-display-segment .segment-option.active")?.dataset.value || "single";
        const _psOptionsSecInit = _psOptionsSec();
        if (_psOptionsSecInit) _psOptionsSecInit.style.display = _psInitMode === "scroll" ? "" : "none";

        const psDateLabelBtns = popup.querySelectorAll(".ps-date-label-segment .segment-option");
        psDateLabelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                psDateLabelBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updatePictureStreakState(widgetId, { showDateLabel: btn.dataset.value === "true" });
            });
        });

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updatePictureStreakState(widgetId, { [chip.dataset.statekey]: isOn });
            });
        });

        const psIntervalSelect = popup.querySelector(".ps-interval-select");
        if (psIntervalSelect) {
            psIntervalSelect.addEventListener("change", event => {
                updatePictureStreakState(widgetId, { scrollInterval: event.target.value });
            });
        }

    }

    /* ── Diary Card ───────────────────────────────────────── */
    /* ── Diary Card 组件专属设置 ───────────────────────────────────────── */

    if (widgetId === "diary-card-widget") {

        const dcSelectBtns = popup.querySelectorAll(".dc-slot-select-btn");
        dcSelectBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                updateDiaryCardState({ activeBook: Number(btn.dataset.index) });
                popup.remove();
                createSettingPopup(widgetId);
            });
        });

        const dcModeBtns = popup.querySelectorAll(".dc-mode-segment .segment-option");
        dcModeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                dcModeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                updateDiaryCardState({ mode: btn.dataset.value });
            });
        });

    }

    /* ── High Streak ──────────────────────────────────────── */
    /* ── High Streak 组件专属设置 ──────────────────────────────────────── */

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

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateHighStreakState({ [chip.dataset.statekey]: isOn });
            });
        });

    }

    /* ── Now Streak ───────────────────────────────────────── */
    /* ── Now Streak 组件专属设置 ───────────────────────────────────────── */

    if (widgetId === "now-streak-widget") {

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
    /* ── Today Emotion 组件专属设置 ──────────────────────────────────── */

    if (widgetId === "today-emotion-widget") {

        const teState = getTodayEmotionState();

        // 跟前面几个组件的分段按钮绑定函数类似，但多了一步：绑定完
        // 点击事件之后，还会根据当前已保存的状态值（teState[stateKey]），
        // 把对应的按钮预先标记成 active（因为这个组件的设置面板打开
        // 时，需要正确反映出"目前已经选中的是哪个选项"，而不是每次
        // 都从模板默认值开始显示）。
        // Similar to the segment-button wiring helpers in the other
        // widgets above, but with one extra step: after wiring up the
        // click handlers, it also pre-marks the matching button as
        // active based on the currently saved state value
        // (teState[stateKey]) — because when this widget's settings
        // panel opens, it needs to accurately reflect "which option is
        // currently selected", rather than always showing the template's
        // default value.
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

        wireSegment(".te-effect-segment", "selectedEffect");

        popup.querySelectorAll(".toggle-chip[data-statekey]").forEach(chip => {
            chip.addEventListener("click", () => {
                const isOn = chip.classList.toggle("active");
                updateTodayEmotionState({ [chip.dataset.statekey]: isOn });
            });
        });

    }

    /* ── Restore open sections from previous widget ─────────── */
    /* ── 恢复上一个组件设置面板里"展开的小节"状态 ─────────── */

    popup.querySelectorAll(".setting-section").forEach(sec => {
        const label = sec.querySelector(".setting-section-toggle h3")?.textContent.trim();
        if (label && _lastOpenSections.includes(label)) sec.classList.add("open");
    });

    /* ── Drag + register ──────────────────────────────────── */
    /* ── 让弹窗可拖动 + 注册为"当前打开的弹窗" ──────────────────────────────── */

    const header = popup.querySelector(".setting-header");
    enableSettingDrag(popup, header);
    setCurrentPopup(popup);

    return popup;

}
