// ===============================
// PAGE SWITCH (Sidebar Navigation)
// ===============================
function showPage(pageId, element) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    // Render specific pages
    if (pageId === "completed") renderCompleted();
    if (pageId === "trash") renderTrash();
    if (pageId === "today") renderToday();
    if (pageId === "calendar") {
    setTimeout(generateCalendar, 50);
}
}

// ===============================
// GLOBAL STATE
// ===============================
let selectedDate = "";
let selectedStart = "";
let selectedEnd = "";
let selectedReminder = "";
let selectedRepeat = "";
let selectedPriority = "";
let selectedTag = "";

let taskData = {
    work: [], shopping: [], study: [], personal: [], workout: []
};

// ===============================
// TASK MANAGEMENT
// ===============================
function addTask(listType) {
    let text = document.getElementById(listType + "TaskText").value.trim();
    if (!text) return;
    if (!selectedDate) {
        alert("Please select a date first");
        return;
    }

    let task = {
        id: Date.now(),
        text: text,
        date: selectedDate,
        startTime: selectedStart,
        endTime: selectedEnd,
        reminder: selectedReminder,
        priority: selectedPriority,
        tag: selectedTag || "",
        status: "active"
    };

    taskData[listType].push(task);

    renderTasks(listType);
    renderToday();
    saveTasks();

    if (document.getElementById("calendar").classList.contains("active")) {
        generateCalendar();
    }

    // Clear input
    document.getElementById(listType + "TaskText").value = "";
    selectedDate = selectedStart = selectedEnd = selectedReminder = selectedPriority = selectedTag = "";
}


// CompleteTask
function completeTask(listType, id) {
    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;

    task.status = "completed";

    renderTasks(listType);
    renderCompleted(); 
    renderToday(); 
}

// Delete Task
function deleteTask(listType, id) {
    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;

    task.status = "trash";

    renderTasks(listType);
    renderCompleted();   
    renderToday(); 
}

// Render Tasks
function renderTasks(listType) {
    let taskList = document.getElementById(listType + "TaskList");
    let emptyMsg = document.getElementById(listType + "EmptyMsg");

    if (!taskList || !emptyMsg) return;

    taskList.innerHTML = "";

    let activeTasks = taskData[listType].filter(t => t.status === "active");

    // show / hide empty message
    emptyMsg.style.display = activeTasks.length === 0 ? "block" : "none";

    activeTasks.forEach(task => {
        let div = document.createElement("div");
        div.className = "task-item";

        div.innerHTML = `
            <span>
                <input type="checkbox" onchange="completeTask('${listType}', ${task.id})">
                ${task.text}
            </span>

            <span>
               📅 ${task.date || "No date"} 
               ⏰ ${task.startTime ? `${task.startTime}` : ""}${task.endTime ? ` - ${task.endTime}` : ""}
               ${getPriorityDot(task.priority)}
               ${task.tag ? `#${task.tag}` : ""}
               <button onclick="deleteTask('${listType}', ${task.id})">🗑</button>
            </span>
        `;

        taskList.appendChild(div);
    });
}

