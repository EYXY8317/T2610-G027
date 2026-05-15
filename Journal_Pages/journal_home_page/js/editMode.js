const editButton = document.querySelector(".control-btn");

const paper = document.querySelector("#paper");

export let editMode = false;

editButton.addEventListener("click", () => {

    editMode = !editMode;

    paper.classList.toggle("edit-mode");

    if (editMode) {

        editButton.textContent = "✓ Done";

    } else {

        editButton.textContent = "✦ Edit";
    }

});