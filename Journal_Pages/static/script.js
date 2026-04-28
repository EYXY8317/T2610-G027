let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");

let editing = false;

//CLICKING THE EDIT BUTTON ENABLES THE TEXT AREA TO BE EDITED
editBtn.addEventListener("click", function() {
    editing = true;
    box.removeAttribute("readonly");
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

    let data = new FormData();
    data.append("content", box.value);
    //content = key
    //box.value = value
    data.append("mood", "neutral");

    fetch("/autosave", {
        method: "POST",
        body: data
    });

});