let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");
let deleteBtn = document.getElementById("deleteBtn");
let mood = document.getElementById("mood");
let saveStatus = document.getElementById("saveStatus");
let datePicker = document.getElementById("datePicker");
let params = new URLSearchParams(window.location.search);
let currentDate = params.get("date");
    if (!currentDate) {
    let today = new Date();
    let todayParts = today.toISOString().split("T")[0].split("-");
    currentDate = todayParts[2] + "/" + todayParts[1] + "/" + todayParts[0];
    }
    
let editing = false;

let timer;

//CHECK MODE - IF MODE IS ADD, ENABLE EDITING
if (mode === "add") {
    editing = true;
}

//CLICKING THE EDIT BUTTON ENABLES THE TEXT AREA TO BE EDITED
editBtn.addEventListener("click", function() {
    editing = true;
    box.removeAttribute("readonly");
    mood.removeAttribute("disabled");
});

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

//AUTOSAVE FUNCTIONALITY - (ONLY EDITS THE CONTENT)
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

//AUTOSAVE FUNCTIONALITY - (ONLY EDITS THE MOOD)
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

//SET DATE PICKER TO TODAY'S DATE BY DEFAULT
if (datePicker) {

    let dateParts = currentDate.split("/");
    datePicker.value = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];

    datePicker.addEventListener("change", function() {

        let selected = datePicker.value;

        let selectedParts = selected.split("-");
        let formatted = selectedParts[2] + "/" + selectedParts[1] + "/" + selectedParts[0];

        window.location.href = "/diary?date=" + formatted;

    });
}