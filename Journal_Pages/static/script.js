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

// ======================== STATE ========================
let results = [];
let currentIndex = 0;

// ======================== LOAD DATA ========================

let savedResults = localStorage.getItem("searchResults");

if (savedResults) {
    results = JSON.parse(savedResults);
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
    box.removeAttribute("readonly");
    mood.removeAttribute("disabled");
});

// ======================== DELETE BUTTON ========================
//CLICKING THE DELETE BUTTON DELETES THE ENTRY
deleteBtn.addEventListener("click", function() {

    let confirmDelete = confirm("Are you sure you want to delete?");

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
box.addEventListener("input", function() {

    if (!editing) return;
    
    clearTimeout(timer);

    saveStatus.innerText = "";

    timer = setTimeout(() => {

        let data = new FormData();
        data.append("content", box.value);
        //content = key
        //box.value = value
        data.append("mood", mood.value);
        data.append("date", currentDate);

        fetch("/autosave", {
          method: "POST",
          body: data
        }).then(() => {
            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";
        });

    },1000);

});

// ======================== AUTOSAVE MOOD ========================
mood.addEventListener("change", function() {

    if (!editing) return;

    saveStatus.innerText = "";

    let data = new FormData();
    data.append("content", box.value);
    data.append("mood", mood.value);
    data.append("date", currentDate);

    fetch("/autosave", {
        method: "POST",
        body: data
    }).then(() => {
        saveStatus.innerText = "Saved ✅";
        saveStatus.style.color = "green";
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
        box.value = entry.content || "";

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