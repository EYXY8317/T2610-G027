// ==================================================
// TASK SYSTEM (Multi-Category To-Do)
// This file handles all task logic
// ==================================================

// ==================================================
// GLOBAL STATE (Single Source of Truth)
// ==================================================

let tasks = [];                // Stores all tasks (all lists)
let currentList = "study";     // Current active list
let selectedTaskId = null;     // Currently selected task (for detail panel)
let hideCompleted = false;     // Toggle: hide/show completed tasks

// ==================================================
// SWITCH LIST (Sidebar Interaction)
// ==================================================

function openList(list, element) {

    // Update current active list
    currentList = list;

    // Hide other views
    document.getElementById("todayView").style.display = "none";
    document.getElementById("calendarView").style.display = "none";

    // Show task view
    document.getElementById("taskView").style.display = "block";

    // Update sidebar active highlight
    let items = document.querySelectorAll(".menu-item");
    items.forEach(i => i.classList.remove("active"));
    element.classList.add("active");

    // Render tasks for this list
    renderTasks();
}


   