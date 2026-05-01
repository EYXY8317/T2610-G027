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

// ==================================================
// ADD TASK
// Create a new task under current list
// ==================================================

function addTask() {

    // Get user input
    let input = document.getElementById("taskInput");
    let text = input.value;

    // Prevent empty task
    if (text === "") return;

    // Create task object
    let task = {
        id: Date.now(),          // Unique ID
        text: text,              // Task content
        status: "active",        // active / completed
        category: currentList    // Which list it belongs to
    };

    // Add to global task array
    tasks.push(task);

    // Clear input
    input.value = "";

    // Re-render UI
    renderTasks();
}
   
// ==================================================
// RENDER TASKS (CORE FUNCTION 🔥)
// Controls all UI updates
// ==================================================

function renderTasks() {

    // Get HTML containers
    let taskList = document.getElementById("taskList");
    let completedList = document.getElementById("completedList");
    let completedSection = document.getElementById("completedSection");
    let completedCount = document.getElementById("completedCount");

    // Clear previous UI
    taskList.innerHTML = "";
    completedList.innerHTML = "";

    // Filter tasks based on current list
    let active = tasks.filter(t => t.status === "active" && t.category === currentList);
    let completed = tasks.filter(t => t.status === "completed" && t.category === currentList);

    // =========================
    // RENDER ACTIVE TASKS
    // =========================

    active.forEach(t => {

        let div = document.createElement("div");

        div.innerHTML = `
            <!-- Checkbox: mark task as completed -->
            <input type="checkbox" onclick="completeTask(${t.id})">

            <!-- Click text to open detail panel -->
            <span onclick="selectTask(${t.id})">${t.text}</span>
        `;

        taskList.appendChild(div);
    });

// =========================
// RENDER COMPLETED TASKS
// =========================

    // Update completed count
    completedCount.innerText = completed.length;

    // Show or hide completed section
    if (!hideCompleted && completed.length > 0) {

        completedSection.style.display = "block";

        completed.forEach(t => {

            let div = document.createElement("div");

            div.innerHTML = `
                ✔ <span onclick="selectTask(${t.id})">${t.text}</span>
            `;

            completedList.appendChild(div);
        });

    } else {
        // Hide entire completed section
        completedSection.style.display = "none";
    }
}

// ==================================================
// COMPLETE TASK
// Move task from active → completed
// ==================================================

function completeTask(id) {

    // Find the task by ID
    let t = tasks.find(x => x.id === id);

    if (t) {
        t.status = "completed";
    }

    // Clear selected task (close detail panel)
    selectedTaskId = null;
    document.getElementById("taskDetailPanel").style.display = "none";

    // Re-render UI
    renderTasks();
}

// ==================================================
// TOGGLE COMPLETED SECTION (Hide / Show)
// ==================================================

function toggleCompleted() {

    // Switch boolean state
    hideCompleted = !hideCompleted;

    // Update button text
    let btn = document.getElementById("toggleCompletedBtn");
    btn.innerText = hideCompleted ? "Show Completed" : "Hide Completed";

    // Re-render UI
    renderTasks();
}
