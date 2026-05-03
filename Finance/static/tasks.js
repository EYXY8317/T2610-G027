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

// Render Completed
function renderCompleted() {
    let container = document.getElementById("completedList");

    container.innerHTML = "";

    Object.keys(taskData).forEach(list => {
        let completedTasks = taskData[list].filter(t => t.status === "completed");

        completedTasks.forEach(task => {
            let div = document.createElement("div");

            div.innerHTML = `
                <span>✔ ${task.text}</span>
                <button onclick="deleteTask('${list}', ${task.id})">🗑</button>
            `;

            container.appendChild(div);
        });
    });
}

// Render Trash
function renderTrash() {
    let container = document.getElementById("trashList");

    container.innerHTML = "";

    Object.keys(taskData).forEach(list => {
        let trashTasks = taskData[list].filter(t => t.status === "trash");

        trashTasks.forEach(task => {
            let div = document.createElement("div");

            div.innerHTML = `
                <span>🗑 ${task.text}</span>
                <button onclick="restoreTask('${list}', ${task.id})">↩ Restore</button>
            `;

            container.appendChild(div);
        });
    });
}

// Restore Task
function restoreTask(listType, id) {
    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;

    task.status = "active";

    renderTrash();
    renderTasks(listType);
    renderToday();
}

// Render Today
function renderToday() {
    let container = document.getElementById("todayTasks");

    container.innerHTML = "";

    const todayStr = new Date().toISOString().split("T")[0];   // 改成 todayStr

    Object.keys(taskData).forEach(list => {
        let tasks = taskData[list].filter(t =>
            t.status === "active" && t.date === todayStr   // 使用 todayStr
        );

        tasks.forEach(task => {
            let li = document.createElement("li");

            li.innerHTML = `[${list}] ${task.text} ${getPriorityDot(task.priority)}`;

            container.appendChild(li);
        });
    });

    // 没任务时提示
    if (container.innerHTML === "") {
        container.innerHTML = "<li>No tasks for today</li>";
    }
}

// ===============================
// ENTER KEY SUPPORT
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    ["work", "shopping", "study", "personal", "workout"].forEach(list => {
        let input = document.getElementById(list + "TaskText");

        if (input) {
            input.addEventListener("keypress", function (e) {
                if (e.key === "Enter") {
                    addTask(list);
                }
            });
        }
    });
});


