let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");
let deleteBtn = document.getElementById("deleteBtn");
let mood = document.getElementById("mood");
let saveStatus = document.getElementById("saveStatus");

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

    fetch("/delete", {
        method: "POST"
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

    fetch("/autosave", {
        method: "POST",
        body: data
    }).then(() => {
        saveStatus.innerText = "Saved ✅";
        saveStatus.style.color = "green";
    });

});