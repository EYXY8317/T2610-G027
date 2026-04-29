// ======================== ELEMENTS ========================
let searchBtn = document.getElementById("searchBtn"); 
let searchBox = document.getElementById("searchBox"); 
let prevBtn = document.getElementById("prevBtn"); 
let nextBtn = document.getElementById("nextBtn"); 
let resultCount = document.getElementById("resultCount");

let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");
let deleteBtn = document.getElementById("deleteBtn");
let mood = document.getElementById("mood");
let saveStatus = document.getElementById("saveStatus");

let params = new URLSearchParams(window.location.search);
let topic = document.getElementById("topic");

// ======================== STATE ========================
let results = [];
let currentIndex = 0;

// ======================== LOAD DATA ========================

let savedResults = localStorage.getItem("searchResults");

function getMessage(mood) {
    fetch("/get_message?mood=" + mood)
    .then(res => res.text())
    .then(data => {
        document.getElementById("msg").innerText = data;
    });
}

if (savedResults) {
    results = JSON.parse(savedResults);
}

// ⭐ view 模式时锁定内容
if (mode === "view") {
    box.setAttribute("contenteditable", "false");
    mood.style.pointerEvents = "none";
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
let editing = false;  // ⭐ 默认不允许编辑
let timer;

if (mode === "add") {
    editing = true;
}

// ⭐ view 模式时禁用 mood
if (mode === "view") {
    mood.style.pointerEvents = "none";   
    mood.style.opacity = "1";           
}

// ======================== EDIT BUTTON ========================
editBtn.addEventListener("click", function() {
    editing = true;

    // ⭐ 解锁全部
    box.setAttribute("contenteditable", "true");
    mood.style.pointerEvents = "auto";
    mood.removeAttribute("disabled");  // ⭐ 移除 disabled 属性
    topic.removeAttribute("readonly");
});

// ======================== DELETE BUTTON ========================
//CLICKING THE DELETE BUTTON DELETES THE ENTRY
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

// ======================== AUTOSAVE TEXT========================
box.addEventListener("input", function(event) {

    if (!editing) return;

    // ❗关键：拖图片时不触发 autosave
    if (event.target.tagName === "IMG") return;

    clearTimeout(timer);

    saveStatus.innerText = "";

    timer = setTimeout(() => {

        let data = new FormData();
        data.append("content", box.innerText);
        data.append("mood", mood.value);
        data.append("topic", topic.value);
        data.append("date", currentDate);

        fetch("/autosave", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            console.log("SAVED OK");   // ⭐加这个

            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";

            document.getElementById("msg").innerText = res.message;
            })
            .catch(err => {
                console.log("ERROR", err);   // ⭐加这个
            });

    }, 1000);

});

// ======================== AUTOSAVE MOOD ========================
mood.addEventListener("change", function() {

    if (!editing) return;

    saveStatus.innerText = "";

    let data = new FormData();
    data.append("content", box.innerText);
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
            getMessage(mood.value);
    });

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

// ======================== SEARCH ========================
searchBtn.addEventListener("click", function() {

    let keyword = searchBox.value;

    let data = new FormData();
    data.append("keyword", keyword);

    fetch("/search", {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(data => {

        results = data.results;
        currentIndex = 0;

        localStorage.setItem("searchResults", JSON.stringify(results));

        let resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        if (results.length === 0) {
            resultsDiv.innerHTML = "No result found";

            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            resultCount.innerText = "";
            return;
        }

        // 👉 显示列表（你原本的）
        results.forEach(r => {

            let item = document.createElement("div");

            item.innerHTML = `
                <b>${r.date}</b><br>
                <i>${r.topic || ""}</i><br>
                ${r.content}
                <hr>
            `;

            item.addEventListener("click", function() {
                window.location.href = "/diary?date=" + r.date;
            });

            resultsDiv.appendChild(item);

        });

        // 👉 控制按钮
        if (results.length === 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            resultCount.innerText = "1 / 1";
        } else {
            if (prevBtn) prevBtn.style.display = "inline";
            if (nextBtn) nextBtn.style.display = "inline";
            updateCounter();
        }

    });

});

// ======================== COUNTER ========================
function updateCounter() {
    resultCount.innerText = (currentIndex + 1) + " / " + results.length;
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

        // 更新 textarea
        box.innerHTML = entry.content || "";

        // 更新 mood
        mood.value = entry.mood || "";

        document.getElementById("dateDisplay").innerText = r.date;

        // 更新 URL（不刷新）
        window.history.pushState({}, "", "/diary?date=" + r.date);
    });
}

// ======================== RESULT NAVIGATION ========================
document.addEventListener("DOMContentLoaded", function() {

    if (prevBtn) {
        prevBtn.addEventListener("click", function() {

            if (results.length === 0) return;

            currentIndex--;

            if (currentIndex < 0) {
                currentIndex = results.length - 1;
            }

            updateCounter();
            goToResult(currentIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function() {

            if (results.length === 0) return;

            currentIndex++;

            if (currentIndex >= results.length) {
                currentIndex = 0;
            }

            updateCounter();

            goToResult(currentIndex);
        });
    }

});

topic.addEventListener("input", function() {

    // 限制 20 字
    if (topic.value.length > 20) {
        topic.value = topic.value.slice(0, 20);
    }

    // 去掉前面空格
    topic.value = topic.value.trimStart();

    clearTimeout(timer);
    saveStatus.innerText = "";

    timer = setTimeout(() => {

        let data = new FormData();
        data.append("content", box.innerText);
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

// 等页面加载完才绑定（❗关键）
document.addEventListener("DOMContentLoaded", function() {

    // ⭐ 删除这行：不再在页面加载时获取新 quote
    // getMessage(mood.value);

    let prev = document.getElementById("prevDate");
    let next = document.getElementById("nextDate");

    if (prev) {
        prev.addEventListener("click", function() {
            changeDate(-1);
        });
    }

    if (next) {
        next.addEventListener("click", function() {
            changeDate(1);
        });
    }

});