// ======================== REMINDER POPUP ========================
// Canonical reminder/confirmation popup — mirrors Journal_HomePages'
// js/shared/reminderPopup.js so both pages look and behave identically.
function showReminderPopup({ title, message, confirmText = "OK", cancelText = null, danger = false, onConfirm } = {}) {
    const overlay = document.createElement("div");
    overlay.className = "reminder-overlay";
    overlay.innerHTML =
        '<div class="reminder-card">' +
            '<div class="reminder-title">' + title + '</div>' +
            '<div class="reminder-msg">' + message + '</div>' +
            '<div class="reminder-actions">' +
                (cancelText ? '<button class="reminder-btn reminder-btn-secondary" data-role="cancel">' + cancelText + '</button>' : '') +
                '<button class="reminder-btn ' + (danger ? 'reminder-btn-danger' : 'reminder-btn-primary') + '" data-role="confirm">' + confirmText + '</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.remove(); });
    var cancelBtn = overlay.querySelector('[data-role="cancel"]');
    if (cancelBtn) cancelBtn.addEventListener("click", function() { overlay.remove(); });
    overlay.querySelector('[data-role="confirm"]').addEventListener("click", function() {
        overlay.remove();
        if (onConfirm) onConfirm();
    });

    return overlay;
}

// ======================== USER-SCOPED STORAGE ========================
// Namespaces localStorage keys by the logged-in username (injected by
// diary.html via window.__CURRENT_USERNAME__) so cached diary data never
// leaks to a different account sharing the same browser.
function scopedKey(base) {
    return base + "::" + (window.__CURRENT_USERNAME__ || "guest");
}

// ======================== ELEMENTS ========================
let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");
let deleteBtn = document.getElementById("deleteBtn");
let mood = document.getElementById("mood");
let saveStatus = document.getElementById("saveStatus");
let topic = document.getElementById("topic");

let params = new URLSearchParams(window.location.search);

// ======================== STATE ========================
let results = [];
let currentIndex = 0;

// ======================== LOAD SAVED RESULTS ========================
let savedResults = localStorage.getItem(scopedKey("searchResults"));
if (savedResults) {
    results = JSON.parse(savedResults);
}

// ======================== VIEW MODE LOCK ========================
if (mode === "view") {
    box.setAttribute("contenteditable", "false");
    mood.style.pointerEvents = "none";
    mood.style.opacity = "1";
    topic.setAttribute("readonly", true);
}

// ======================== CURRENT DATE ========================
let currentDate = params.get("date");
if (!currentDate) {
    currentDate = document.getElementById("dateDisplay").innerText.trim();
}

// ======================== SYNC INDEX ========================
if (results.length > 0 && currentDate) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].date === currentDate) {
            currentIndex = i;
            break;
        }
    }
}

// ======================== EDIT MODE ========================
let editing = false;
let timer;

if (mode === "add") {
    editing = true;
}

// ======================== EDIT BUTTON ========================
editBtn.addEventListener("click", function(e) {
    if (window.requireLogin && window.requireLogin()) {
        e.stopImmediatePropagation();
        return;
    }
    editing = true;
    box.setAttribute("contenteditable", "true");
    mood.style.pointerEvents = "auto";
    mood.removeAttribute("disabled");
    topic.removeAttribute("readonly");
});

// ======================== DELETE BUTTON ========================
deleteBtn.addEventListener("click", function() {
    if (window.requireLogin && window.requireLogin()) return;
    showReminderPopup({
        title: "Delete Entry?",
        message: "Are you sure you want to delete everything? This includes topic, mood, and diary.",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
        onConfirm: function() {
            let data = new FormData();
            data.append("date", currentDate);

            fetch("/delete", {
                method: "POST",
                body: data
            }).then(() => {
                localStorage.removeItem(scopedKey("diary_mood_today"));
                try {
                    const key = scopedKey("today-emotion-state");
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const state = JSON.parse(raw);
                        state.selectedIndexes = [];
                        const today = new Date().toISOString().slice(0, 10);
                        if (state.history) delete state.history[today];
                        localStorage.setItem(key, JSON.stringify(state));
                    }
                } catch (_) {}
                location.reload();
            });
        }
    });
});

// ======================== AUTOSAVE TEXT ========================
box.addEventListener("input", function(event) {
    if (!editing) return;
    if (event.target.tagName === "IMG") return;
    if (window.requireLogin && window.requireLogin()) return;

    clearTimeout(timer);
    saveStatus.innerText = "";

    timer = setTimeout(() => {
        let data = new FormData();
        data.append("content", box.innerHTML);
        data.append("mood", mood.value);
        data.append("topic", topic.value);
        data.append("date", currentDate);

        fetch("/autosave", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";
            document.getElementById("msg").innerText = res.message;
        })
        .catch(err => {
            console.log("ERROR", err);
        });
    }, 1000);
});

// ======================== AUTOSAVE MOOD ========================
mood.addEventListener("change", function() {
    if (!editing) return;
    if (window.requireLogin && window.requireLogin()) return;

    saveStatus.innerText = "";

    let data = new FormData();
    data.append("content", box.innerHTML);
    data.append("mood", mood.value);
    data.append("topic", topic.value);
    data.append("date", currentDate);

    fetch("/autosave", {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(res => {
        saveStatus.innerText = "Saved ✅";
        saveStatus.style.color = "green";
        document.getElementById("msg").innerText = res.message;
    });
});

// ======================== AUTOSAVE TOPIC ========================
topic.addEventListener("input", function() {
    if (topic.value.length > 20) {
        topic.value = topic.value.slice(0, 20);
    }
    topic.value = topic.value.trimStart();
    if (window.requireLogin && window.requireLogin()) return;

    clearTimeout(timer);
    saveStatus.innerText = "";

    timer = setTimeout(() => {
        let data = new FormData();
        data.append("content", box.innerHTML);
        data.append("mood", mood.value);
        data.append("topic", topic.value);
        data.append("date", currentDate);

        fetch("/autosave", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";
            document.getElementById("msg").innerText = res.message;
        });
    }, 1000);
});

// ======================== CALENDAR ========================
let dateDisplay = document.getElementById("dateDisplay");
if (dateDisplay && typeof flatpickr !== "undefined") {
    flatpickr(dateDisplay, {
        dateFormat: "d/m/Y",
        defaultDate: currentDate,
        position: "below",
        onChange: function(selectedDates, dateStr) {
            window.location.href = "/diary?date=" + dateStr;
        }
    });
}

// ======================== DATE NAV ========================
function changeDate(days) {
    let parts = currentDate.split("/");
    let d = new Date(parts[2], parts[1] - 1, parts[0]);
    d.setDate(d.getDate() + days);

    let newDate =
        String(d.getDate()).padStart(2, '0') + "/" +
        String(d.getMonth() + 1).padStart(2, '0') + "/" +
        d.getFullYear();

    window.location.href = "/diary?date=" + newDate;
}

// ======================== COUNTER ========================
function updateCounter() {
    let resultCount = document.getElementById("resultCount");
    if (resultCount) {
        resultCount.innerText = (currentIndex + 1) + " / " + results.length;
    }
}

// ======================== GO TO RESULT ========================
function goToResult(index) {
    let r = results[index];
    currentDate = r.date;

    let data = new FormData();
    data.append("date", r.date);

    fetch("/get_entry", {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(entry => {
        box.innerHTML = entry.content || "";
        mood.value = entry.mood || "";
        document.getElementById("dateDisplay").innerText = r.date;
        window.history.pushState({}, "", "/diary?date=" + r.date);
    });
}

// ======================== DOM READY ========================
document.addEventListener("DOMContentLoaded", function() {

    // ===== Prev / Next Date =====
    let prev = document.getElementById("prevDate");
    let next = document.getElementById("nextDate");

    if (prev) {
        prev.addEventListener("click", function() { changeDate(-1); });
    }
    if (next) {
        next.addEventListener("click", function() { changeDate(1); });
    }

    // ===== Prev / Next Search Result =====
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", function() {
            if (results.length === 0) return;
            currentIndex--;
            if (currentIndex < 0) currentIndex = results.length - 1;
            updateCounter();
            goToResult(currentIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            if (results.length === 0) return;
            currentIndex++;
            if (currentIndex >= results.length) currentIndex = 0;
            updateCounter();
            goToResult(currentIndex);
        });
    }

    // ======================== SEARCH WIDGET ========================
    const searchWidget  = document.getElementById("searchWidget");
    const searchIconBtn = document.getElementById("searchIconBtn");
    const searchBox     = document.getElementById("searchBox");
    const searchBtn     = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    searchIconBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchWidget.classList.toggle("open");
        if (searchWidget.classList.contains("open")) {
            searchBox.focus();
        } else {
            searchBox.value = "";
            searchResults.innerHTML = "";
        }
    });

    document.addEventListener("click", (e) => {
        if (!searchWidget.contains(e.target) && !searchResults.contains(e.target)) {
            searchWidget.classList.remove("open");
            searchBox.value = "";
            searchResults.innerHTML = "";
        }
    });

    searchBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });

    searchBtn.addEventListener("click", () => {
        const keyword = searchBox.value.trim();
        if (!keyword) return;

        const formData = new FormData();
        formData.append("keyword", keyword);

        fetch("/search", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                results = data.results;
                currentIndex = 0;
                localStorage.setItem(scopedKey("searchResults"), JSON.stringify(results));

                searchResults.innerHTML = "";

                if (results.length === 0) {
                    searchResults.innerHTML = "<p style='color:#aaa;font-size:13px;padding:8px;'>No results found.</p>";
                    return;
                }

                function extractPreview(raw) {
                    if (!raw) return "";
                    const parts = raw.split("||ITEM||");
                    const texts = [];
                    for (const part of parts) {
                        try {
                            const d = JSON.parse(part.trim());
                            if (d.type === "text" && d.html) {
                                const tmp = document.createElement("div");
                                tmp.innerHTML = d.html;
                                const t = tmp.innerText.trim();
                                if (t) texts.push(t);
                            }
                        } catch(e) {
                            if (part.trim() && !part.trim().startsWith("{")) texts.push(part.trim());
                        }
                    }
                    return texts.join(" ").slice(0, 80);
                }

                const MOOD_LABELS = { happy:"happy", sad:"sad", angry:"angry", anxious:"anxious", unwell:"unwell", Happy:"happy", Sad:"sad", Angry:"angry", meh:"unwell", smile:"happy", neutral:"sad" };

                results.forEach((r, i) => {
                    const item = document.createElement("div");
                    item.className = "search-result-item";
                    const preview = extractPreview(r.content);
                    const moodKey = r.mood ? (MOOD_LABELS[r.mood] || r.mood.toLowerCase()) : "";
                    const moodHtml = moodKey
                        ? `<img src="/journal_home_static/assets/emotions/${moodKey}.png" class="result-mood-img" alt="${moodKey}">`
                        : "";
                    item.innerHTML = `
                        <div class="result-date">${r.date}</div>
                        <div class="result-meta">
                            ${r.topic ? `<span class="result-topic">${r.topic}</span>` : ""}
                            ${moodHtml}
                        </div>
                        ${preview ? `<div class="result-preview">${preview}</div>` : ""}
                    `;
                    item.addEventListener("click", () => {
                        window.location.href = "/diary?date=" + encodeURIComponent(r.date);
                    });
                    searchResults.appendChild(item);
                });
            });
    });

});

// ======================== FORMAT BAR ========================
document.addEventListener("DOMContentLoaded", function () {

    const fontFamily = document.getElementById("fontFamily");
    const fontSize   = document.getElementById("fontSize");
    const fontColor  = document.getElementById("fontColor");
    const boldBtn    = document.getElementById("boldBtn");
    const italicBtn  = document.getElementById("italicBtn");
    const box        = document.getElementById("box");

    let savedRange = null;

    box.addEventListener("mouseup", saveRange);
    box.addEventListener("keyup",   saveRange);

    function saveRange() {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRange = sel.getRangeAt(0).cloneRange();
        }
    }

    function restoreRange() {
        if (!savedRange) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }

    fontFamily.addEventListener("change", function () {
        restoreRange();
        document.execCommand("fontName", false, this.value);
        box.focus();
    });

    fontSize.addEventListener("change", function () {
        restoreRange();
        const size = this.value + "px";
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const span  = document.createElement("span");
            span.style.fontSize = size;
            range.surroundContents(span);
        } else {
            document.execCommand("fontSize", false, "7");
            const fontEls = box.querySelectorAll("font[size='7']");
            fontEls.forEach(el => {
                el.removeAttribute("size");
                el.style.fontSize = size;
            });
        }
        box.focus();
    });

    fontColor.addEventListener("input", function () {
        restoreRange();
        document.execCommand("foreColor", false, this.value);
        box.focus();
    });

    boldBtn.addEventListener("mousedown", function (e) {
        e.preventDefault();
        document.execCommand("bold");
    });

    italicBtn.addEventListener("mousedown", function (e) {
        e.preventDefault();
        document.execCommand("italic");
    });
});
