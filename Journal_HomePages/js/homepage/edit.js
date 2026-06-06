import { saveLayout } from "./saveLayout.js";

export function setupEditMode(settingsButton, menu, editLayoutButton, widgets) {
    let menuOpen = false;
    let editMode = false;

    settingsButton.addEventListener("click", () => {
        if (editMode) {
            widgets.forEach(widget => {
                saveLayout(widget);
                widget.classList.remove("edit-mode");
            });

            editMode = false;
            settingsButton.textContent = "⚙ Customize Homepage";
            console.log("Layout Saved");
            return;
        }

        menuOpen = !menuOpen;
        menu.style.display = menuOpen ? "block" : "none";
    });

    editLayoutButton.addEventListener("click", () => {
        editMode = true;
        menuOpen = false;
        menu.style.display = "none";

        widgets.forEach(widget => {
            widget.classList.add("edit-mode");
        });

        settingsButton.textContent = "💾 Save Layout";
        console.log("Edit Mode Started");
    });
}
