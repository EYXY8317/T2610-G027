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
let savedResults = localStorage.getItem("searchResults");
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
    let today = new Date();
    let todayParts = today.toISOString().split("T")[0].split("-");
    currentDate = todayParts[2] + "/" + todayParts[1] + "/" + todayParts[0];
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
editBtn.addEventListener("click", function() {
    editing = true;
    box.setAttribute("contenteditable", "true");
    mood.style.pointerEvents = "auto";
    mood.removeAttribute("disabled");
    topic.removeAttribute("readonly");
});

// ======================== DELETE BUTTON ========================
deleteBtn.addEventListener("click", function() {
    let confirmDelete = confirm("Are you sure you want to delete everything?\nThis includes topic, mood, and diary.");
    if (!confirmDelete) return;

    let data = new FormData();
    data.append("date", currentDate);

    fetch("/delete", {
        method: "POST",
        body: data
    }).then(() => {
        location.reload();
    });
});

// ======================== AUTOSAVE TEXT ========================
box.addEventListener("input", function(event) {
    if (!editing) return;
    if (event.target.tagName === "IMG") return;

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
if (dateDisplay) {
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

    // 点击图标 → 展开 / 收起
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

    // 点击页面其他地方 → 收起
    document.addEventListener("click", (e) => {
        if (!searchWidget.contains(e.target) && !searchResults.contains(e.target)) {
            searchWidget.classList.remove("open");
            searchBox.value = "";
            searchResults.innerHTML = "";
        }
    });

    // Enter 触发搜索
    searchBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });

    // 搜索
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
                localStorage.setItem("searchResults", JSON.stringify(results));

                searchResults.innerHTML = "";

                if (results.length === 0) {
                    searchResults.innerHTML = "<p style='color:#aaa;font-size:13px;padding:8px;'>No results found.</p>";
                    return;
                }

                results.forEach((r, i) => {
                    const item = document.createElement("div");
                    item.className = "search-result-item";
                    item.innerHTML = `
                        <div class="result-date">${r.date}</div>
                        <div class="result-topic">${r.topic || "(No topic)"}</div>
                        <div class="result-preview">${r.content}...</div>
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

    // 保存选区，防止 select/click 工具栏时失去焦点
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

    // 字体
    fontFamily.addEventListener("change", function () {
        restoreRange();
        document.execCommand("fontName", false, this.value);
        box.focus();
    });

    // 大小
    fontSize.addEventListener("change", function () {
        restoreRange();
        // execCommand fontSize 只接受 1-7，用 span 包裹更精确
        const size = this.value + "px";
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const span  = document.createElement("span");
            span.style.fontSize = size;
            range.surroundContents(span);
        } else {
            // 光标处设置，后续输入生效
            document.execCommand("fontSize", false, "7");
            const fontEls = box.querySelectorAll("font[size='7']");
            fontEls.forEach(el => {
                el.removeAttribute("size");
                el.style.fontSize = size;
            });
        }
        box.focus();
    });

    // 颜色
    fontColor.addEventListener("input", function () {
        restoreRange();
        document.execCommand("foreColor", false, this.value);
        box.focus();
    });

    // 粗体
    boldBtn.addEventListener("mousedown", function (e) {
        e.preventDefault(); // 防止 box 失去焦点
        document.execCommand("bold");
    });

    // 斜体
    italicBtn.addEventListener("mousedown", function (e) {
        e.preventDefault();
        document.execCommand("italic");
    });
});
