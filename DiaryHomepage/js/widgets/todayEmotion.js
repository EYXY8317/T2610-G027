import { MOOD_LIST, getMood, saveMood, clearMood } from "../mood_sync.js";
import { userScopedKey, getCurrentUsername } from "../currentUser.js";
import { showReminderPopup } from "../shared/reminderPopup.js";
import { showLoginRequiredPopup } from "../shared/loginRequiredPopup.js";

// "Today Emotion" 组件：让用户记录今天的心情，支持两种模式——
// "select"（点选一个或多个心情表情）或"slider"（用滑块给每种心情
// 打百分比）。一旦用户在日记页面（diary.html）里给今天的心情"上锁"
// 过（saveMood），这个组件的选择就会被锁定，只能去日记页面改，
// 避免两个地方的数据互相打架。每天到了设定的重置时间（resetHour）
// 会自动把前一天的记录归档到历史（history）里，再清空今天的选择。
// The "Today Emotion" widget: lets the user record today's mood,
// supporting two modes — "select" (pick one or more mood emojis) or
// "slider" (assign a percentage to each mood via sliders). Once the user
// has "locked" today's mood on the diary page (via saveMood), this
// widget's selection becomes locked and can only be changed from the
// diary page, preventing the two places from fighting over the data.
// Each day, once the configured reset hour (resetHour) passes, the
// previous day's record is automatically archived into history, and
// today's selection is cleared.

const STORAGE_KEY = "today-emotion-state";
const RESET_KEY = "today-emotion-last-reset";

const DEFAULT_EMOJIS = MOOD_LIST.map(m => m.emoji);
const MOOD_IMAGES = MOOD_LIST.map(m => m.image);

const DEFAULT_STATE = {
    displayMode: "select",          // "select" | "slider"
    displayedEmojis: DEFAULT_EMOJIS,
    displayedCount: 5,
    // select mode
    selectedIndexes: [],
    selectionMode: "single",        // "single" | "multiple"
    selectedEffect: "border",       // "border" | "glow" | "scale"
    // slider mode
    sliderValues: [0, 0, 0, 0, 0], // percentages per emoji
    showMost: true,
    // shared
    showTitle: true,
    resetHour: 0
};

/* ── Storage ─────────────────────────────────────────────── */
/* ── 数据存取 ─────────────────────────────────────────────── */

function getSavedState() {

    const raw = localStorage.getItem(userScopedKey(STORAGE_KEY));

    if (!raw) {
        return { ...DEFAULT_STATE };
    }

    try {

        const parsed = JSON.parse(raw);

        const displayedEmojis = Array.isArray(parsed.displayedEmojis)
            ? parsed.displayedEmojis.map(e => String(e || "").trim()).filter(Boolean)
            : DEFAULT_EMOJIS;

        const sliderValues = Array.isArray(parsed.sliderValues)
            ? parsed.sliderValues.slice(0, 5).map(v => Number(v) || 0)
            : [0, 0, 0, 0, 0];

        return {
            ...DEFAULT_STATE,
            ...parsed,
            displayedEmojis: displayedEmojis.length
                ? displayedEmojis.slice(0, 5)
                : DEFAULT_EMOJIS,
            displayedCount: Math.min(5, Math.max(1,
                Number(parsed.displayedCount) || DEFAULT_STATE.displayedCount)),
            selectedIndexes: Array.isArray(parsed.selectedIndexes)
                ? parsed.selectedIndexes
                : [],
            sliderValues
        };

    }
    catch {
        return { ...DEFAULT_STATE };
    }

}

function saveState(state) {
    localStorage.setItem(userScopedKey(STORAGE_KEY), JSON.stringify(state));
}

// 把当天的选择（选中的心情/滑块数值）存进历史记录里，用日期字符串
// 当 key；如果这一天根本没有任何数据（什么都没选、滑块都是 0），
// 就不记录，避免历史里堆满一堆空白的日期。
// Archives the current day's selections (selected moods/slider values)
// into the history record, keyed by date string; if there's no data at
// all for that day (nothing selected, all sliders at 0), it isn't
// recorded, avoiding a history full of blank dates.
function archiveToHistory(state, dateISO) {
    const hasData = state.selectedIndexes.length > 0 || state.sliderValues.some(v => v > 0);
    if (!hasData) return state;
    const history = { ...(state.history || {}) };
    history[dateISO] = {
        selectedIndexes: [...state.selectedIndexes],
        sliderValues:    [...state.sliderValues],
        displayedEmojis: [...state.displayedEmojis]
    };
    return { ...state, history };
}

/* ── Daily Reset ─────────────────────────────────────────── */
/* ── 每日重置 ─────────────────────────────────────────── */

// 检查是不是该重置今天的心情记录了：用"年-月-日-重置小时"拼出一个
// 独一无二的 key（resetKey），跟上次重置时记住的 key 比较——如果
// 不一样，并且现在的时间已经过了设定的重置小时，就把昨天的数据
// 归档到历史，然后清空今天的选择状态，重新开始。同时会顺便清掉
// 日记页面那边的"心情锁"，避免设置面板第一次打开时误把上一天的
// 心情当成今天的心情归档进去。
// Checks whether it's time to reset today's mood record: builds a unique
// key from "year-month-day-resetHour" (resetKey) and compares it against
// the key remembered from the last reset — if it's different, and the
// current time has passed the configured reset hour, yesterday's data
// gets archived into history, then today's selection state is cleared to
// start fresh. This also clears the diary page's "mood lock" along the
// way, so the settings panel's first opening doesn't mistakenly archive
// the previous day's mood as today's.
function checkDailyReset(state) {

    const now = new Date();
    const resetKey = `te-reset-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${state.resetHour}`;
    const lastReset = localStorage.getItem(userScopedKey(RESET_KEY));

    if (lastReset !== resetKey && now.getHours() >= state.resetHour) {

        localStorage.setItem(userScopedKey(RESET_KEY), resetKey);

        // Archive previous day before clearing
        // 清空之前，先把前一天的数据归档
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const archivedState = archiveToHistory(state, yesterday.toISOString().slice(0, 10));

        const resetState = {
            ...archivedState,
            selectedIndexes: [],
            sliderValues: [0, 0, 0, 0, 0]
        };

        // Clear the previous day's diary mood lock so it doesn't
        // get mistakenly archived as today's emotion on first settings open.
        clearMood();

        saveState(resetState);
        return resetState;

    }

    return state;

}


/* ── Render ──────────────────────────────────────────────── */
/* ── 渲染 ──────────────────────────────────────────────── */

function renderSelectMode(state) {

    const count = state.displayedCount;
    const selected = new Set(state.selectedIndexes);

    const buttons = MOOD_LIST.slice(0, count).map((mood, i) => {

        const isSelected = selected.has(i);
        const effectClass = isSelected ? `selected effect-${state.selectedEffect}` : "unselected";

        return `
            <button
                type="button"
                class="te-emoji-btn ${effectClass}"
                data-index="${i}"
                data-value="${mood.value}"
                aria-pressed="${isSelected}"
                title="${mood.title}"
            ><img src="${mood.image}" alt="${mood.label}" class="te-mood-img"></button>
        `;

    }).join("");

    const rowClass = _isLocked ? "te-emoji-row te-emoji-row--locked" : "te-emoji-row";
    return `<div class="${rowClass}">${buttons}</div>`;
}

function renderCurrentMood(state) {
    if (!state.showCurrentMood) {
        return "";
    }

    if (state.emotionType === "rating") {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${state.ratingValue} / 10</span>
            </div>
        `;
    }

    if (state.emotionType === "image") {
        if (!state.customImage) {
            return `
                <div class="today-emotion-current">
                    <span class="today-emotion-current-label">Current Mood</span>
                    <span class="today-emotion-current-value">Upload an image in settings</span>
                </div>
            `;
        }

        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">Custom Image</span>
            </div>
        `;
    }

    const selectedIndexes = (state.selectedIndexes || []).filter(index => index >= 0 && index < MOOD_LIST.length);

    if (!selectedIndexes.length) {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">No mood selected</span>
            </div>
        `;
    }

    const firstIndex = selectedIndexes[0];
    const mood = MOOD_LIST[firstIndex] || MOOD_LIST[0];
    const label = mood ? mood.label : "";
    const imgHtml = mood ? `<img src="${mood.image}" alt="${label}" class="te-mood-img te-current-img">` : "";

    if (state.selectionMode === "multiple" && selectedIndexes.length > 1) {
        return `
            <div class="today-emotion-current">
                <span class="today-emotion-current-label">Current Mood</span>
                <span class="today-emotion-current-value">${imgHtml} ${label} +${selectedIndexes.length - 1} more</span>
            </div>
        `;
    }

    return `
        <div class="today-emotion-current">
            <span class="today-emotion-current-label">Current Mood</span>
            <span class="today-emotion-current-value">${imgHtml} ${label}</span>
        </div>
    `;

}

function renderSliderMode(state) {

    const count = state.displayedCount;
    const values = state.sliderValues.slice(0, count);

    const rows = MOOD_LIST.slice(0, count).map((mood, i) => `
        <div class="te-slider-row">
            <img src="${mood.image}" alt="${mood.label}" title="${mood.title}" class="te-slider-emoji te-mood-img">
            <input
                type="range"
                class="te-pct-slider"
                data-index="${i}"
                min="0"
                max="100"
                value="${values[i] || 0}"
            >
        </div>
    `).join("");

    const dominantIdx = values.reduce((best, v, i) => v > (values[best] || 0) ? i : best, 0);
    const dominantMood = state.showMost && values[dominantIdx] > 0 ? MOOD_LIST[dominantIdx] : null;
    const dominantLine = dominantMood
        ? `<div class="te-dominant">Most: <img src="${dominantMood.image}" alt="${dominantMood.label}" class="te-mood-img te-dominant-img"></div>`
        : "";

    return `
        <div class="te-sliders">${rows}</div>
        ${dominantLine}
    `;

}

function renderWidget(state) {

    const contentMarkup = state.displayMode === "slider"
        ? renderSliderMode(state)
        : renderSelectMode(state);

    return `
        <div class="te-card">
            ${contentMarkup}
        </div>
        <div class="te-pct-popup"></div>
    `;

}

async function updateDiaryMoodBadge(widget) {
    try {
        const resp = await fetch("/diary_moods");
        const moods = await resp.json();
        const today = new Date().toISOString().slice(0, 10);
        const mood = moods[today] || "";
        const el = widget.querySelector(".te-diary-mood");
        if (!el) return;
        if (mood) {
            el.textContent = `${MOOD_ICON[mood] || ""} ${mood}`;
            el.className = `te-diary-mood mood-${mood.toLowerCase()}`;
        } else {
            el.textContent = "";
            el.className = "te-diary-mood";
        }
    } catch {
        // network unavailable — leave badge empty
        // 网络不通的话，就让这个小标签保持空白
    }
}

// Emoji sizing that responds to widget width:
//  - select mode: fill available width so 5 buttons never overflow
//  - slider mode: fixed compact emoji so bar stretches longer
// 表情图标大小会跟着组件宽度自动调整：
//  - select 模式：让 5 个按钮刚好填满可用宽度，不会溢出
//  - slider 模式：表情固定用一个较小的尺寸，让滑动条能拉得更长
function applyTodayEmotionScale(widget, state) {
    const widgetW = widget.offsetWidth;
    if (!widgetW) return;

    if (state.displayMode === "select") {
        const count    = state.displayedCount || 5;
        const CARD_PAD = 14;   // .te-card padding (0.85em ≈ 14px) × 2 sides
        const BTN_OH   = 16;   // each button: 6px padding × 2 + 2px border × 2
        const GAP      = 6;    // matches CSS gap
        const available = widgetW - CARD_PAD * 2 - BTN_OH * count - GAP * (count - 1);
        const px = Math.max(28, Math.min(70, Math.floor(available / count)));
        const pxAnxious = Math.round(px * (80 / 70));

        widget.querySelectorAll(".te-emoji-btn").forEach(btn => {
            const img = btn.querySelector(".te-mood-img");
            if (!img) return;
            const sz = btn.dataset.value === "anxious" ? pxAnxious : px;
            img.style.width  = `${sz}px`;
            img.style.height = `${sz}px`;
        });
    } else {
        widget.querySelectorAll(".te-slider-emoji.te-mood-img").forEach(img => {
            img.style.width  = "24px";
            img.style.height = "24px";
        });
    }
}

function rerender(state) {

    const widget = document.getElementById("today-emotion-widget");

    if (!widget) {
        return;
    }

    const content = widget.querySelector(".widget-content");

    if (!content) {
        return;
    }

    content.innerHTML = renderWidget(state);

    requestAnimationFrame(() => applyTodayEmotionScale(widget, state));

}

function updateState(partial) {

    const cur = getSavedState();
    const next = archiveToHistory({ ...cur, ...partial }, new Date().toISOString().slice(0, 10));
    saveState(next);
    rerender(next);
    return next;

}

/* ── Mood Lookup ─────────────────────────────────────────── */
/* ── 心情项查找 ─────────────────────────────────────────── */

// Tries exact emoji match first; falls back to position in DEFAULT_EMOJIS
// so encoding quirks in saved state don't silently break saveMood().
// 优先用表情符号本身去精确匹配；如果匹配不到（可能是保存的数据
// 里表情符号的编码有些奇怪的小问题），就退回去用它在 DEFAULT_EMOJIS
// 里"本来应该在的位置"（fallbackIndex）去找，避免 saveMood() 悄悄地
// 失败却没有任何提示。
function resolveMoodItem(emoji, fallbackIndex) {
    if (!emoji) return null;
    const byEmoji = MOOD_LIST.find(m => m.emoji === emoji);
    if (byEmoji) return byEmoji;
    // Fallback: the emoji is at `fallbackIndex` in displayedEmojis which
    // mirrors DEFAULT_EMOJIS order — use that to index MOOD_LIST directly.
    if (fallbackIndex >= 0 && fallbackIndex < MOOD_LIST.length) {
        return MOOD_LIST[fallbackIndex];
    }
    return null;
}

/* ── Mood Lock Popup ─────────────────────────────────────── */
/* ── 心情锁定提示弹窗 ─────────────────────────────────────── */

let _isLocked = false;

function showMoodLockedPopup() {
    showReminderPopup({
        title: "Mood Locked",
        message: "Want to change your mood? Please update it in the Diary page under Mood.",
        confirmText: "Go to Diary",
        cancelText: "Close",
        onConfirm: () => { window.location.href = "/diary"; }
    });
}

/* ── Public API ──────────────────────────────────────────── */
/* ── 对外接口 ──────────────────────────────────────────── */

export function createTodayEmotionWidget() {
    return `
        <div class="widget" id="today-emotion-widget">
            <div class="drag-handle">
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
                <span class="drag-dot"></span>
            </div>
            <div class="widget-header">
                <span>Today Emotion</span>
            </div>
            <div class="widget-content">Loading...</div>
            <div class="resize-handle">↘</div>
        </div>
    `;
}

export function initializeTodayEmotion() {

    const widget = document.getElementById("today-emotion-widget");

    if (!widget) {
        return;
    }

    let state = getSavedState();
    state = checkDailyReset(state);

    // Guests can no longer set today's mood, so any mood/selection saved
    // under the "guest" scope predates that restriction (e.g. from before
    // this gate existed) and is stale — clear it so anonymous visits
    // always start unlocked and unselected.
    // 访客（guest）现在已经不能设置今天的心情了，所以如果 "guest"
    // 这个用户名下还存有心情/选择数据，那一定是"这个限制加上去之前"
    // 遗留下来的旧数据——把它清掉，确保每次匿名访问都是从"未锁定、
    // 未选择"的状态开始。
    if (getCurrentUsername() === "guest") {
        if (getMood() !== null) {
            clearMood();
        }
        const hasStaleData = state.selectedIndexes.length
            || state.sliderValues.some(v => v > 0)
            || Object.keys(state.history || {}).length > 0;
        if (hasStaleData) {
            state = {
                ...state,
                selectedIndexes: [],
                sliderValues: state.sliderValues.map(() => 0),
                history: {}
            };
            saveState(state);
        }
    }

    const savedMood = getMood();
    _isLocked = savedMood !== null;

    if (savedMood) {
        const idx = MOOD_LIST.findIndex(m => m.value === savedMood);
        if (idx >= 0 && idx < state.displayedCount) {
            state = { ...state, selectedIndexes: [idx] };
            saveState(state);
        }
    }

    rerender(state);

    widget.addEventListener("widgetresize", () => {
        applyTodayEmotionScale(widget, getSavedState());
    });

    /* emoji select clicks */
    /* 心情表情的点击事件 */
    widget.addEventListener("click", event => {

        if (_isLocked) {
            if (event.target.closest(".te-emoji-row--locked")) {
                showMoodLockedPopup();
            }
            return;
        }

        const btn = event.target.closest(".te-emoji-btn");

        if (!btn) {
            return;
        }

        if (getCurrentUsername() === "guest") {
            showLoginRequiredPopup();
            return;
        }

        const index = Number(btn.dataset.index);
        const cur = getSavedState();

        if (cur.displayMode !== "select") {
            return;
        }

        if (cur.selectionMode === "single") {

            updateState({ selectedIndexes: [index] });

            const moodItem = MOOD_LIST[index];
            if (moodItem) saveMood(moodItem.value);

        } else {

            const set = new Set(cur.selectedIndexes);

            if (set.has(index)) {
                set.delete(index);
            } else {
                set.add(index);
            }

            updateState({ selectedIndexes: Array.from(set) });

            const arr = Array.from(set);
            if (arr.length) {
                const firstIdx = Math.min(...arr);
                const moodItem = MOOD_LIST[firstIdx];
                if (moodItem) saveMood(moodItem.value);
            }

        }

    });

    /* percentage sliders — show popup while dragging, save on release */
    /* 百分比滑块——拖动时显示当前数值的小提示，松开时才真正保存 */
    widget.addEventListener("input", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const popup = widget.querySelector(".te-pct-popup");
        if (popup) {
            const pct = Number(slider.value) / 100;
            const rect = slider.getBoundingClientRect();
            popup.textContent = `${slider.value}%`;
            popup.style.left = `${rect.left + pct * rect.width}px`;
            popup.style.top = `${rect.top}px`;
            popup.classList.add("visible");
        }

        // update dominant emoji without rerender
        // 不用整个重新渲染，只更新"占比最高的心情"这一小块显示
        const cur = getSavedState();
        const liveValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const dominantIdx = liveValues.reduce((best, v, j) => v > liveValues[best] ? j : best, 0);
        const dominantEl = widget.querySelector(".te-dominant");
        if (dominantEl) {
            const dom = cur.showMost && liveValues[dominantIdx] > 0 ? MOOD_LIST[dominantIdx] : null;
            dominantEl.innerHTML = dom
                ? `Most: <img src="${dom.image}" alt="${dom.label}" class="te-mood-img te-dominant-img">`
                : "";
        }

    });

    window.addEventListener("pointerup", () => {
        const popup = widget.querySelector(".te-pct-popup");
        if (popup) popup.classList.remove("visible");
    });

    widget.addEventListener("change", event => {

        const slider = event.target.closest(".te-pct-slider");
        if (!slider) return;

        const cur = getSavedState();
        const newValues = Array.from(
            widget.querySelectorAll(".te-pct-slider")
        ).map(s => Number(s.value));
        const next = archiveToHistory(
            { ...cur, sliderValues: newValues },
            new Date().toISOString().slice(0, 10)
        );
        saveState(next);

    });

}

export function getTodayEmotionState() {
    return getSavedState();
}

export function updateTodayEmotionState(partial) {
    return updateState(partial);
}
