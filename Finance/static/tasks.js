// ==================================================
// TASK SYSTEM (Multi-Category To-Do)
// This file handles all task logic
// ==================================================


// Load tasks from browser storage
// If nothing is saved, use an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


// ==================================================
// ADD TASK
// Create a new task and store it
// ==================================================
function addTask(category) { // category = "work", "shopping", etc.

    // Get user input values
    let text = document.getElementById("taskText").value;
    let date = document.getElementById("taskDate").value;

    // Stop if input is empty
    if (text === "") return;

    // Create a task object
    let task = {
        id: Date.now(),      // unique ID using time
        text: text,          // task content
        date: date,          // task date
        status: "active",    // default status
        category: category   // which list it belongs to
    };

    // Add task into array
    tasks.push(task);

    // Update the UI
    renderTasks(category);

    // Clear input fields
    document.getElementById("taskText").value = "";
    document.getElementById("taskDate").value = "";
}

// ==================================================
// RENDER TASKS
// Show tasks on screen based on category
// ==================================================
function renderTasks(category) {

    // Get HTML containers
    let taskList = document.getElementById("taskList");
    let completedList = document.getElementById("completedList");
    let trashList = document.getElementById("trashList");
    let emptyMsg = document.getElementById("emptyMsg");

    // Stop if elements are not found (for other pages like calendar)
    if (!taskList || !completedList || !trashList) return;

    // Clear old content
    taskList.innerHTML = "";
    completedList.innerHTML = "";
    trashList.innerHTML = "";

    // Filter tasks by status and category
    let activeTasks = tasks.filter(t => t.status === "active" && t.category === category);
    let completedTasks = tasks.filter(t => t.status === "completed" && t.category === category);
    let trashTasks = tasks.filter(t => t.status === "trash" && t.category === category);

    // Show or hide "no task" message
    if (emptyMsg) {
        emptyMsg.style.display = activeTasks.length === 0 ? "block" : "none";
    }

    // ===== ACTIVE TASKS =====
    activeTasks.forEach(task => {

        let div = document.createElement("div"); // create a new div
        div.className = "task-item"; // add CSS class

        // Create task layout
        div.innerHTML = `
            <span>
                <input type="checkbox" onclick="completeTask(${task.id}, '${category}')">
                ${task.text}
            </span>
            <span>
                 ${task.date || "No date"}
                <button onclick="deleteTask(${task.id}, '${category}')">🗑</button>
            </span>
        `;

        // Add task into page
        taskList.appendChild(div);
    });


    // ===== COMPLETED TASKS =====
    completedTasks.forEach(task => {

        let div = document.createElement("div");

        div.innerHTML = `
            <span>✔ ${task.text}</span>
            <span>
                 ${task.date || "No date"}
                <button onclick="undoTask(${task.id}, '${category}')">❌</button>
            </span>
        `;

        completedList.appendChild(div);
    });

// ===== TRASH TASKS =====
    trashTasks.forEach(task => {

        let div = document.createElement("div");

        div.innerHTML = `
            <span>🗑 ${task.text}</span>
            <span>
                 ${task.date || "No date"}
                <button onclick="restoreTask(${task.id}, '${category}')">♻</button>
            </span>
        `;

        trashList.appendChild(div);
    });


    // Save updated tasks to browser storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ==================================================
// TASK ACTIONS
// Change task status
// ==================================================

// Mark task as completed
function completeTask(id, category) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.status = "completed";
        renderTasks(category);
    }
}


// Change task back to active
function undoTask(id, category) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.status = "active";
        renderTasks(category);
    }
}


// Move task to trash
function deleteTask(id, category) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.status = "trash";
        renderTasks(category);
    }
}


// Restore task from trash
function restoreTask(id, category) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.status = "active";
        renderTasks(category);
    }
}


// ==================================================
// INITIAL LOAD
// Run when page is loaded
// ==================================================
document.addEventListener("DOMContentLoaded", function () {
    renderTasks("work"); // default view
});