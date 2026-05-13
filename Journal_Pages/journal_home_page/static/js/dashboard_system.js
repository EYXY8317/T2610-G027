const widgets =
document.querySelectorAll(".widget");

console.log(widgets);


// ================= EDIT MODE =================

document.addEventListener("keydown", function(event) {

    // ================= CTRL =================

    if (event.key === "Control") {

        document.body.classList.toggle(
            "edit-mode"
        );

        console.log("Edit Mode");
    }

});