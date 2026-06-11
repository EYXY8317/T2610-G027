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