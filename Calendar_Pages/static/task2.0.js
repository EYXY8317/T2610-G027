// ===============================
// PAGE SWITCH (Sidebar Navigation)
// Handle page navigation and
// refresh page-specific content
// ===============================

function showPage(pageId, element) {

    // Close all popups
    closeCalendar();
    closeExtra();

    // Close detail panel
    closeDetailPanel();

    // Hide all pages
    document.querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });

    // Show selected page
    document.getElementById(pageId)
        .classList.add("active");

    // Remove active state from all menu items
    document.querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.remove("active");

        });

    // Highlight selected menu item
    if (element) {

        element.classList.add("active");

    }

    // ===============================
    // Refresh page content
    // ===============================

    if (pageId === "completed") {

        renderCompleted();

    }

    else if (pageId === "trash") {

        renderTrash();

    }

    else if (pageId === "today") {

        updateTodayDashboard();

    }

    else if (
        ["work", "shopping", "study", "personal", "workout"]
        .includes(pageId)
    ) {

        renderTasks(pageId);

    }

    else if (pageId === "calendar") {

        generateCalendar();

    }

}




// ===============================
// GLOBAL STATE
// Store temporary values used
// across the application
// ===============================

// Current calendar date
let today = new Date();

// Selected schedule information
let selectedDate = "";
let selectedStart = "";
let selectedEnd = "";

// Selected reminder settings
let selectedReminder = "";
let selectedRepeat = "";

// Selected task settings
let selectedPriority = "";
let selectedTag = "";

// ===============================
// TASK STORAGE
// Store all task categories
// ===============================

let taskData = {

    work: [],

    shopping: [],

    study: [],

    personal: [],

    workout: []

};




// ===============================
// ADD NEW TASK
// Create and save a new task
// ===============================

function addTask(listType) {

    // Get task title
    let text =
        document.getElementById(
            listType + "TaskText"
        ).value.trim();

    // Prevent empty task
    if (!text) return;

    // Date is required
    if (!selectedDate) {

        alert("Please select a date first");

        return;

    }

    // Create task object
    let task = {

        id: Date.now(),

        text: text,

        date: selectedDate,

        startTime: selectedStart,

        endTime: selectedEnd,

        reminder: selectedReminder,

        repeat: selectedRepeat,

        priority: selectedPriority,

        tag: selectedTag || "",

        description: "",

        status: "active"

    };

    // Save task into category
    taskData[listType].push(task);

    // Refresh task list
    renderTasks(listType);

    // Refresh Today Dashboard
    updateTodayDashboard();

    // Save to localStorage
    saveTasks();

    // Refresh calendar if currently open
    if (
        document.getElementById("calendar")
        .classList.contains("active")
    ) {

        generateCalendar();

    }

// ===============================
// RESET INPUT AND TEMPORARY DATA
// ===============================

   // Clear task title input
    document.getElementById(
    listType + "TaskText"
    ).value = "";

    // Reset selected date and time
    selectedDate = "";
    selectedStart = "";
    selectedEnd = "";

    // Reset reminder settings
    selectedReminder = "";
    selectedRepeat = "";

    // Reset task settings
    selectedPriority = "";
    selectedTag = "";

}




// ===============================
// COMPLETE TASK
// Move task to completed status
// ===============================

function completeTask(listType, id) {

    // Find selected task
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    if (!task) return;

    // Update task status
    task.status = "completed";

    // Refresh active task list
    renderTasks(listType);

    // Refresh completed page
    renderCompleted();

    // Refresh Today Dashboard
    updateTodayDashboard();

    // Save changes
    saveTasks();

    // Refresh calendar if open
    if (
        document.getElementById("calendar")
        .classList.contains("active")
    ) {

        generateCalendar();

    }

}



// ===============================
// MOVE TASK TO TRASH
// Move task from active/completed
// to Trash page
// ===============================

function deleteTask(listType, id) {

    // Find selected task
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    if (!task) return;

    // Move task to trash
    task.status = "trash";

    // Refresh active task list
    renderTasks(listType);

    // Refresh completed page
    renderCompleted();

    // Refresh trash page
    renderTrash();

    // Refresh Today Dashboard
    updateTodayDashboard();

    // Save changes
    saveTasks();

    // Refresh calendar if open
    if (
        document.getElementById("calendar")
        .classList.contains("active")
    ) {

        generateCalendar();

    }

}




// Render task
function renderTasks(listType) {
    let taskList = document.getElementById(listType + "TaskList");
    let emptyMsg = document.getElementById(listType + "EmptyMsg");

    if (!taskList || !emptyMsg) return;

    taskList.innerHTML = "";

    let activeTasks = taskData[listType].filter(t => t.status === "active");

    emptyMsg.style.display = activeTasks.length === 0 ? "block" : "none";

    activeTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = `task-card ${task.status === "completed" ? "completed" : ""}`;
        card.dataset.id = task.id;
        card.dataset.list = listType;

        const checked = task.status === "completed" ? "checked" : "";

        card.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${checked} 
                   onchange="toggleComplete('${listType}', ${task.id}, this)">

            <div class="task-info">

    <div class="task-title">
        ${task.text}
    </div>

    <div class="task-meta">

        <span class="task-date">

            <span class="material-symbols-rounded">
                calendar_month
            </span>

            ${task.date || "No Date"}

        </span>

        ${
            task.startTime || task.endTime
            ? `
            <span class="task-time">

                <span class="material-symbols-rounded">
                    schedule
                </span>

                ${task.startTime || "--:--"}
                -
                ${task.endTime || "--:--"}

            </span>
            `
            : ""
        }

        ${
            task.priority
            ? `
            <span class="task-priority">

                ${getPriorityDot(task.priority)}

                ${
                    task.priority === "red"
                    ? "High"
                    : task.priority === "orange"
                    ? "Medium"
                    : task.priority === "blue"
                    ? "Low"
                    : "No Priority"
                }

            </span>
            `
            : ""
        }

    </div>

</div>

<div class="task-actions">

    <button
        class="task-action-btn"
        onclick="deleteTask('${listType}', ${task.id}); event.stopImmediatePropagation();"
    >

        <span class="material-symbols-rounded">
            delete
        </span>

    </button>

    <button
        class="task-action-btn"
        onclick="showTaskDetail('${listType}', ${task.id}); event.stopImmediatePropagation();"
    >

        <span class="material-symbols-rounded">
            chevron_right
        </span>

    </button>

</div>
        `;

        taskList.appendChild(card);
    });
}

// Render Completed (按列表分组) 
function renderCompleted() {
    let container = document.getElementById("completedList");
    container.innerHTML = "";

    let hasCompleted = false;

    Object.keys(taskData).forEach(listType => {
        let completedTasks = taskData[listType].filter(t => t.status === "completed");
        
        if (completedTasks.length === 0) return;

        hasCompleted = true;

        const section = document.createElement("div");
        section.style.marginBottom = "25px";

section.innerHTML = `
    <h3 class="completed-section-title">

        <span class="material-symbols-rounded">
            task_alt
        </span>

        ${listType.charAt(0).toUpperCase() + listType.slice(1)} Tasks (${completedTasks.length})

    </h3>
`;

        const taskContainer = document.createElement("div");

        completedTasks.forEach(task => {
            const card = document.createElement("div");
            card.className = "task-card completed";
            card.style.marginBottom = "8px";

            card.innerHTML = `
                <div class="task-info" style="flex:1;">
                <div class="task-title">${task.text}</div>
                <div class="task-meta">

                <span class="task-date">

                <span class="material-symbols-rounded">
                    calendar_month
                </span>
                ${task.date || "No Date"}

                </span>

                </div>
                
                <button
                 class="task-action-btn"
                 onclick="restoreFromCompleted('${listType}', ${task.id})"
                >

    <span class="material-symbols-rounded">
        undo
    </span>

</button>

<button
    class="task-action-btn"
    onclick="deleteTask('${listType}', ${task.id});"
>

    <span class="material-symbols-rounded">
        delete
    </span>

</button>
            `;

            taskContainer.appendChild(card);
        });

        section.appendChild(taskContainer);
        container.appendChild(section);
    });

    if (!hasCompleted) {
        container.innerHTML = `<p style="text-align:center; color:#888; padding:60px 20px;">No completed tasks yet.</p>`;
    }
}

// Render Trash (按列表分组) 
function renderTrash() {
    let container = document.getElementById("trashList");
    container.innerHTML = "";

    let hasTrash = false;

    Object.keys(taskData).forEach(listType => {
        let trashTasks = taskData[listType].filter(t => t.status === "trash");
        
        if (trashTasks.length === 0) return;

        hasTrash = true;

        const section = document.createElement("div");
        section.style.marginBottom = "25px";

        section.innerHTML = `
       <h3 class="trash-section-title">

        <span class="material-symbols-rounded">
            delete
        </span>

        ${listType.charAt(0).toUpperCase() + listType.slice(1)} Tasks (${trashTasks.length})

       </h3>
    `;

        const taskContainer = document.createElement("div");

        trashTasks.forEach(task => {
            const card = document.createElement("div");
            card.className = "task-card";
            card.style.opacity = "0.75";
            card.style.marginBottom = "8px";

            card.innerHTML = `
                <div class="task-info" style="flex:1;">
                <div class="task-title">${task.text}</div>
                <div class="task-meta">

                <span class="task-date">
                <span class="material-symbols-rounded">
                   calendar_month
                </span>

                ${task.date || "No Date"}

                </span>

                </div>

                <button
                class="restore-btn"
                onclick="restoreTask('${listType}', ${task.id})"
                >

                <span class="material-symbols-rounded">
                undo
                </span>

                 Restore

                </button>
            `;

            taskContainer.appendChild(card);
        });

        section.appendChild(taskContainer);
        container.appendChild(section);
    });

    if (!hasTrash) {
        container.innerHTML = `<p style="text-align:center; color:#888; padding:60px 20px;">Trash is empty.</p>`;
    }
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

    let today = new Date().toISOString().split("T")[0];

    Object.keys(taskData).forEach(list => {
        let tasks = taskData[list].filter(t =>
            t.status === "active" && t.date === today
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

// ToggleCalendar
function toggleCalendar(btn, e) {
    if (e) e.stopPropagation(); 

    let popup = document.getElementById("calendarPopup");

    document.body.appendChild(popup);

    let extra = document.getElementById("extraPopup");
    if (extra) extra.style.display = "none";

    let rect = btn.getBoundingClientRect();

    popup.style.position = "absolute";
    popup.style.top = rect.bottom + window.scrollY + "px";
    popup.style.left = rect.left + window.scrollX + "px";

    popup.style.display =
        popup.style.display === "block" ? "none" : "block";
}

// ToggleCalendar
function toggleExtra(btn, e) {
    if (e) e.stopPropagation(); 

    let popup = document.getElementById("extraPopup");

    document.body.appendChild(popup);

    let cal = document.getElementById("calendarPopup");
    if (cal) cal.style.display = "none";

    let rect = btn.getBoundingClientRect();

    popup.style.position = "absolute";
    popup.style.top = rect.bottom + window.scrollY + "px";
    popup.style.left = rect.right + window.scrollX - 200 + "px";

    popup.style.display =
        popup.style.display === "block" ? "none" : "block";
}

// Close
function closeCalendar() {
    document.getElementById("calendarPopup").style.display = "none";
}

function closeExtra() {
    document.getElementById("extraPopup").style.display = "none";
}

// GetPriorityDot
function getPriorityDot(priority) {
    if (priority === "red") return "🔴";
    if (priority === "orange") return "🟠";
    if (priority === "blue") return "🔵";
    if (priority === "gray") return "⚫";
    return "";
}
function setPriority(icon, e) {
    selectedPriority = icon;

    // reset all
    let all = document.querySelectorAll(".priority-box span");
    all.forEach(el => {
        el.style.opacity = "0.5";
        el.style.fontWeight = "normal";
    });

    // highlight selected
    if (e) {
        e.target.style.opacity = "1";
        e.target.style.fontWeight = "bold";
    }
}

// Apply Date
function applyDate() {
    let dateInput = document.getElementById("popupDate");
    let startInput = document.getElementById("startTime");
    let endInput = document.getElementById("endTime");
    let reminderInput = document.getElementById("reminder");

    selectedDate = dateInput.value;
    selectedStart = startInput.value;
    selectedEnd = endInput.value;
    selectedReminder = reminderInput.value;

    // 关闭 popup
    closeCalendar();
}

document.addEventListener("DOMContentLoaded", function() {

    let reminder = document.getElementById("reminder");
    let repeat = document.getElementById("repeat");

    if (reminder) {
        reminder.addEventListener("change", function() {
            let box = document.getElementById("customReminderBox");
            box.style.display = this.value === "custom" ? "flex" : "none";
        });
    }

    if (repeat) {
        repeat.addEventListener("change", function() {
            let box = document.getElementById("customRepeatBox");
            box.style.display = this.value === "custom" ? "flex" : "none";
        });
    }

});

// ===============================
// PERSISTENCE - localStorage
// ===============================
function saveTasks() {
    localStorage.setItem("taskData", JSON.stringify(taskData));
}

function loadTasks() {
    const saved = localStorage.getItem("taskData");
    if (saved) taskData = JSON.parse(saved);
}

function getPriorityColor(priority) {
    if (priority === "red") return "#ef4444";
    if (priority === "orange") return "#f59e0b";
    if (priority === "blue") return "#3b82f6";
    return "#6b7280";
}

// Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    
    // 重要：加载后重新渲染所有列表
    renderToday();
    
    // 渲染所有任务列表
    ["work", "shopping", "study", "personal", "workout"].forEach(list => {
        renderTasks(list);
    });
});

// Auto save after changes
const originalCompleteTask = completeTask;
completeTask = function(listType, id) {
    originalCompleteTask.call(this, listType, id);
    saveTasks();
    if (document.getElementById("calendar").classList.contains("active")) generateCalendar();
};

const originalDeleteTask = deleteTask;
deleteTask = function(listType, id) {
    originalDeleteTask.call(this, listType, id);
    saveTasks();
    if (document.getElementById("calendar").classList.contains("active")) generateCalendar();
};

// Toggle complete status
function toggleComplete(listType, id, checkbox) {
    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;

    task.status = checkbox.checked ? "completed" : "active";

    renderTasks(listType);
    renderToday();
    renderCompleted();
    saveTasks();
}

// Show Editable Detail Panel 
let currentTaskListType = "";
let currentTaskId = null;

function showTaskDetail(listType, id) {
    currentTaskListType = listType;
    currentTaskId = id;

    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;

    // 填充可编辑字段
    document.getElementById("panelTitleInput").value = task.text || "";
    document.getElementById("panelDescription").value = task.description || "";
    document.getElementById("panelDateInput").value = task.date || "";
    document.getElementById("panelStartTime").value = task.startTime || "";
    document.getElementById("panelEndTime").value = task.endTime || "";
    document.getElementById("panelPrioritySelect").value = task.priority || "";
    document.getElementById("panelTagInput").value = task.tag || "";

  // 完全显示面板
    const panel = document.getElementById("taskDetailPanel");
    panel.style.visibility = "visible";
    panel.style.opacity = "1";
    panel.style.right = "0";
}

function closeDetailPanel() {
    const panel = document.getElementById("taskDetailPanel");
    panel.style.right = "-450px";
    // 延迟隐藏，防止闪烁
    setTimeout(() => {
        panel.style.visibility = "hidden";
        panel.style.opacity = "0";
    }, 350);
}

// Save Changes from Detail Panel 
function saveTaskChanges() {
    let task = taskData[currentTaskListType].find(t => t.id === currentTaskId);
    if (!task) return;

    task.text = document.getElementById("panelTitleInput").value.trim();
    task.description = document.getElementById("panelDescription").value.trim();
    task.date = document.getElementById("panelDateInput").value;
    task.startTime = document.getElementById("panelStartTime").value;
    task.endTime = document.getElementById("panelEndTime").value;
    task.priority = document.getElementById("panelPrioritySelect").value;
    task.tag = document.getElementById("panelTagInput").value.trim();

    saveTasks();
    renderTasks(currentTaskListType);   // 刷新列表
    closeDetailPanel();

    alert("✅ Changes saved successfully!");
}

function deleteCurrentTask() {
    if (confirm("Delete this task?")) {
        deleteTask(currentTaskListType, currentTaskId);
        closeDetailPanel();
    }
}

// Restore from Completed
function restoreFromCompleted(listType, id) {
    let task = taskData[listType].find(t => t.id === id);
    if (!task) return;
    task.status = "active";
    renderCompleted();
    renderTasks(listType);
    renderToday();
    saveTasks();
}