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

// Selected repeat settings
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

    // Reset repeat settings
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




// ===============================
// RENDER TASKS
// Display all active tasks
// for the selected category
// ===============================

function renderTasks(listType) {

    // Get task container
    let taskList =
        document.getElementById(
            listType + "TaskList"
        );

    // Get empty message
    let emptyMsg =
        document.getElementById(
            listType + "EmptyMsg"
        );

    // Stop if elements don't exist
    if (!taskList || !emptyMsg) return;

    // Clear existing tasks
    taskList.innerHTML = "";

    // Get active tasks only
    let activeTasks =
        taskData[listType].filter(
            task => task.status === "active"
        );

    // Show / hide empty message
    emptyMsg.style.display =
        activeTasks.length === 0
        ? "block"
        : "none";

    // Create task cards
    activeTasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";

        card.dataset.id = task.id;

        card.dataset.list = listType;

        card.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                onchange="toggleComplete('${listType}', ${task.id}, this)"
            >

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
                    onclick="deleteTask('${listType}', ${task.id}); event.stopPropagation();"
                >

                    <span class="material-symbols-rounded">
                        delete
                    </span>

                </button>

                <button
                    class="task-action-btn"
                    onclick="showTaskDetail('${listType}', ${task.id}); event.stopPropagation();"
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




// ===============================
// RENDER COMPLETED TASKS
// Group completed tasks by category
// ===============================

function renderCompleted() {

    // Get completed page container
    let container =
        document.getElementById(
            "completedList"
        );

    container.innerHTML = "";

    // Track whether completed tasks exist
    let hasCompleted = false;

    // Loop through all categories
    Object.keys(taskData).forEach(listType => {

        let completedTasks =
            taskData[listType].filter(
                task => task.status === "completed"
            );

        if (completedTasks.length === 0) return;

        hasCompleted = true;

        // Create category section
        const section =
            document.createElement("div");

        section.style.marginBottom = "25px";

        section.innerHTML = `

            <h3 class="completed-section-title">

                <span class="material-symbols-rounded">
                    task_alt
                </span>

                ${
                    listType.charAt(0).toUpperCase()
                    + listType.slice(1)
                }

                Tasks (${completedTasks.length})

            </h3>

        `;

        const taskContainer =
            document.createElement("div");

        // Create completed task cards
        completedTasks.forEach(task => {

            const card =
                document.createElement("div");

            card.className =
                "task-card completed";

            card.style.marginBottom =
                "8px";

            card.innerHTML = `

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
                        onclick="restoreFromCompleted('${listType}', ${task.id})"
                    >

                        <span class="material-symbols-rounded">
                            undo
                        </span>

                    </button>

                    <button
                        class="task-action-btn"
                        onclick="deleteTask('${listType}', ${task.id})"
                    >

                        <span class="material-symbols-rounded">
                            delete
                        </span>

                    </button>

                </div>

            `;

            taskContainer.appendChild(card);

        });

        section.appendChild(taskContainer);

        container.appendChild(section);

    });

    // Show empty message
    if (!hasCompleted) {

        container.innerHTML = `

            <p
                style="
                    text-align:center;
                    color:#888;
                    padding:60px 20px;
                "
            >

                No completed tasks yet.

            </p>

        `;

    }

}




// ===============================
// RENDER TRASH TASKS
// Group trashed tasks by category
// ===============================

function renderTrash() {

    // Get Trash page container
    let container =
        document.getElementById(
            "trashList"
        );

    // Clear existing content
    container.innerHTML = "";

    // Track whether Trash contains tasks
    let hasTrash = false;

    // Loop through all task categories
    Object.keys(taskData).forEach(listType => {

        let trashTasks =
            taskData[listType].filter(
                task => task.status === "trash"
            );

        // Skip empty categories
        if (trashTasks.length === 0) return;

        hasTrash = true;

        // Create category section
        const section =
            document.createElement("div");

        section.style.marginBottom = "25px";

        section.innerHTML = `

            <h3 class="trash-section-title">

                <span class="material-symbols-rounded">
                    delete
                </span>

                ${
                    listType.charAt(0).toUpperCase()
                    + listType.slice(1)
                }

                Tasks (${trashTasks.length})

            </h3>

        `;

        // Task container
        const taskContainer =
            document.createElement("div");

        // Render each trashed task
        trashTasks.forEach(task => {

            const card =
                document.createElement("div");

            card.className = "task-card";

            card.style.opacity = "0.75";

            card.style.marginBottom = "8px";

            card.innerHTML = `

                <div class="task-info">

                    <div class="task-title">

                        ${task.text}

                    </div>

                    <div class="task-meta">

                        <!-- Date -->

                        <span class="task-date">

                            <span class="material-symbols-rounded">
                                calendar_month
                            </span>

                            ${task.date || "No Date"}

                        </span>

                        <!-- Time -->

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

                        <!-- Priority -->

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
                       onclick="restoreTask('${listType}', ${task.id})"
                       title="Restore Task"
                    >

                   <span class="material-symbols-rounded">
                       undo
                    </span>

                    </button>

                <button
                     class="task-action-btn"
                     onclick="permanentlyDeleteTask('${listType}', ${task.id})"
                     title="Delete Forever"
                >

                <span class="material-symbols-rounded">
                    delete_forever
                </span>

            </button>

        </div>

            `;

            taskContainer.appendChild(card);

        });

        // Add task list into section
        section.appendChild(taskContainer);

        // Add section into page
        container.appendChild(section);

    });

    // Show empty state
    if (!hasTrash) {

        container.innerHTML = `

            <p
                style="
                    text-align:center;
                    color:#888;
                    padding:60px 20px;
                "
            >

                Trash is empty.

            </p>

        `;

    }

}



// ===============================
// RESTORE TASK
// Move task from Trash
// back to Active Tasks
// ===============================

function restoreTask(listType, id) {

    // Find selected task
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    if (!task) return;

    // Restore task to active status
    task.status = "active";

    // Refresh Trash page
    renderTrash();

    // Refresh task list page
    renderTasks(listType);

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
// DELETE TASK PERMANENTLY
// Remove task forever from storage
// ===============================

function permanentlyDeleteTask(listType, id) {

    if (
        !confirm(
            "Permanently delete this task?"
        )
    ) {
        return;
    }

    taskData[listType] =
        taskData[listType].filter(
            task => task.id !== id
        );

    renderTrash();

    saveTasks();

}


// ===============================
// ENTER KEY SUPPORT
// Press Enter to add a task
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        [
            "work",
            "shopping",
            "study",
            "personal",
            "workout"
        ].forEach(list => {

            let input =
                document.getElementById(
                    list + "TaskText"
                );

            if (input) {

                input.addEventListener(
                    "keypress",
                    function (e) {

                        if (e.key === "Enter") {

                            addTask(list);

                        }

                    }
                );

            }

        });

    }
);


// ===============================
// TOGGLE CALENDAR POPUP
// Show or hide date popup
// ===============================

function toggleCalendar(btn, e) {

    if (e) e.stopPropagation();

    let popup =
        document.getElementById(
            "calendarPopup"
        );

    if (!popup) return;

    let extra =
        document.getElementById(
            "extraPopup"
        );

    if (extra) {

        extra.style.display = "none";

    }

    const rect =
        btn.getBoundingClientRect();

    popup.style.position =
        "fixed";

    popup.style.top =
        rect.bottom + 10 + "px";

    const popupWidth = 340;

    popup.style.left =
    (rect.right - popupWidth) + "px";

    popup.style.display =
        popup.style.display === "block"
        ? "none"
        : "block";

}


// ===============================
// TOGGLE EXTRA POPUP
// Show or hide extra options popup
// ===============================

function toggleExtra(btn, e) {

    if (e) e.stopPropagation();

    let popup =
        document.getElementById(
            "extraPopup"
        );

    if (!popup) return;

    let cal =
        document.getElementById(
            "calendarPopup"
        );

    if (cal) {

        cal.style.display = "none";

    }

    const rect =
        btn.getBoundingClientRect();

    popup.style.position =
        "fixed";

    popup.style.top =
        rect.bottom + 10 + "px";

    popup.style.left =
        (rect.right - 280) + "px";

    popup.style.display =
        popup.style.display === "block"
        ? "none"
        : "block";

}



// ===============================
// CLOSE CALENDAR POPUP
// ===============================

function closeCalendar() {

    const popup =
        document.getElementById(
            "calendarPopup"
        );

    if (popup) {

        popup.style.display =
            "none";

    }

}

// ===============================
// CLOSE EXTRA POPUP
// ===============================

function closeExtra() {

    const popup =
        document.getElementById(
            "extraPopup"
        );

    if (popup) {

        popup.style.display =
            "none";

    }

}




// ===============================
// GET PRIORITY ICON
// Return priority emoji
// ===============================

function getPriorityDot(priority) {

    if (priority === "red") {

        return "🔴";

    }

    if (priority === "orange") {

        return "🟠";

    }

    if (priority === "blue") {

        return "🔵";

    }

    if (priority === "gray") {

        return "⚫";

    }

    return "";

}

// ===============================
// SET PRIORITY
// Highlight selected priority
// ===============================

function setPriority(icon, e) {

    selectedPriority = icon;

    let all =
        document.querySelectorAll(
            ".priority-box span"
        );

    all.forEach(el => {

        el.style.opacity =
            "0.5";

        el.style.fontWeight =
            "normal";

    });

    if (e) {

        e.target.style.opacity =
            "1";

        e.target.style.fontWeight =
            "bold";

    }

}

// ===============================
// APPLY DATE SETTINGS
// Save selected task options
// ===============================

function applyDate() {

    let dateInput =
        document.getElementById(
            "popupDate"
        );

    let startInput =
        document.getElementById(
            "startTime"
        );

    let endInput =
        document.getElementById(
            "endTime"
        );

    let repeatInput =
        document.getElementById(
            "repeat"
        );

    // Save date
    selectedDate =
        dateInput
        ? dateInput.value
        : "";

    // Save start time
    selectedStart =
        startInput
        ? startInput.value
        : "";

    // Save end time
    selectedEnd =
        endInput
        ? endInput.value
        : "";

    // Save repeat option
    selectedRepeat =
        repeatInput
        ? repeatInput.value
        : "";

    // Close popup
    closeCalendar();

}





// ===============================
// PERSISTENCE - LOCAL STORAGE
// Save and load task data
// ===============================

function saveTasks() {

    localStorage.setItem(
        "taskData",
        JSON.stringify(taskData)
    );

}

function loadTasks() {

    const saved =
        localStorage.getItem(
            "taskData"
        );

    try {

        if (saved) {

            taskData =
                JSON.parse(saved);

        }

    }

    catch {

        console.error(
            "Failed to load task data"
        );

        localStorage.removeItem(
            "taskData"
        );

    }

}

// ===============================
// GET PRIORITY COLOR
// Return color for calendar badges
// ===============================

function getPriorityColor(priority) {

    if (priority === "red") {

        return "#ef4444";

    }

    if (priority === "orange") {

        return "#f59e0b";

    }

    if (priority === "blue") {

        return "#3b82f6";

    }

    return "#6b7280";

}

// ===============================
// LOAD SAVED TASKS
// Restore tasks when page loads
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Load saved task data
        loadTasks();

        // Render all task categories
        [
            "work",
            "shopping",
            "study",
            "personal",
            "workout"
        ].forEach(list => {

            renderTasks(list);

        });

        // Refresh Completed page
        renderCompleted();

        // Refresh Trash page
        renderTrash();

        // Refresh Today dashboard
        updateTodayDashboard();

    }
);

// ===============================
// TOGGLE COMPLETE STATUS
// Move task between Active
// and Completed
// ===============================

function toggleComplete(
    listType,
    id,
    checkbox
) {

    let task =
        taskData[listType].find(
            t => t.id === id
        );

    if (!task) return;

// Create next recurring task
if (
    checkbox.checked &&
    task.repeat &&
    task.repeat !== "none" &&
    task.date
) {

    let nextDate =
        new Date(task.date);

    switch (task.repeat) {

        case "daily":

            nextDate.setDate(
                nextDate.getDate() + 1
            );

            break;

        case "weekly":

            nextDate.setDate(
                nextDate.getDate() + 7
            );

            break;

        case "monthly":

            nextDate.setMonth(
                nextDate.getMonth() + 1
            );

            break;

        case "yearly":

            nextDate.setFullYear(
                nextDate.getFullYear() + 1
            );

            break;

    }

    taskData[listType].push({

        ...task,

        id: Date.now(),

        status: "active",

        date:
            nextDate
            .toISOString()
            .split("T")[0]

    });

}

    // Update task status
    task.status =
        checkbox.checked
        ? "completed"
        : "active";


    // Refresh pages
    renderTasks(listType);

    renderCompleted();

    renderTrash();

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
// TASK DETAIL PANEL
// Manage task editing panel
// ===============================

// Store currently selected task
let currentTaskListType = "";

let currentTaskId = null;

// ===============================
// SHOW TASK DETAIL PANEL
// Display task information
// inside editable side panel
// ===============================

function showTaskDetail(
    listType,
    id
) {

    currentTaskListType =
        listType;

    currentTaskId =
        id;

    let task =
        taskData[listType].find(
            t => t.id === id
        );

    if (!task) return;

    // Fill editable fields
    document.getElementById(
        "panelTitleInput"
    ).value =
        task.text || "";

    document.getElementById(
        "panelDescription"
    ).value =
        task.description || "";

    document.getElementById(
        "panelDateInput"
    ).value =
        task.date || "";

    document.getElementById(
        "panelStartTime"
    ).value =
        task.startTime || "";

    document.getElementById(
        "panelEndTime"
    ).value =
        task.endTime || "";

    document.getElementById(
        "panelPrioritySelect"
    ).value =
        task.priority || "";

    document.getElementById(
        "panelTagInput"
    ).value =
        task.tag || "";

    // Show panel
    const panel =
        document.getElementById(
            "taskDetailPanel"
        );

    panel.style.visibility =
        "visible";

    panel.style.opacity =
        "1";

    panel.style.right =
        "0";

}




// ===============================
// CLOSE TASK DETAIL PANEL
// Hide side panel smoothly
// ===============================

function closeDetailPanel() {

    const panel =
        document.getElementById(
            "taskDetailPanel"
        );

    if (!panel) return;

    panel.style.right =
        "-450px";

    setTimeout(() => {

        panel.style.visibility =
            "hidden";

        panel.style.opacity =
            "0";

    }, 350);

}

// ===============================
// SAVE TASK CHANGES
// Save edited task information
// ===============================

function saveTaskChanges() {

    let task =
        taskData[currentTaskListType]
        .find(
            t => t.id === currentTaskId
        );

    if (!task) return;

    // Update task data
    task.text =
        document.getElementById(
            "panelTitleInput"
        ).value.trim();

    task.description =
        document.getElementById(
            "panelDescription"
        ).value.trim();

    task.date =
        document.getElementById(
            "panelDateInput"
        ).value;

    task.startTime =
        document.getElementById(
            "panelStartTime"
        ).value;

    task.endTime =
        document.getElementById(
            "panelEndTime"
        ).value;

    task.priority =
        document.getElementById(
            "panelPrioritySelect"
        ).value;

    task.tag =
        document.getElementById(
            "panelTagInput"
        ).value.trim();

    // Save data
    saveTasks();

    // Refresh pages
    renderTasks(
        currentTaskListType
    );

    renderCompleted();

    renderTrash();

    updateTodayDashboard();

    // Refresh calendar if open
    if (
        document.getElementById(
            "calendar"
        ).classList.contains(
            "active"
        )
    ) {

        generateCalendar();

    }

    // Close panel
    closeDetailPanel();

    alert(
        "✅ Changes saved successfully!"
    );

}

// ===============================
// DELETE CURRENT TASK
// Move current task to Trash
// ===============================

function deleteCurrentTask() {

    if (
        confirm(
            "Delete this task?"
        )
    ) {

        deleteTask(
            currentTaskListType,
            currentTaskId
        );

        closeDetailPanel();

    }

}

// ===============================
// RESTORE FROM COMPLETED
// Move task back to active list
// ===============================

function restoreFromCompleted(
    listType,
    id
) {

    let task =
        taskData[listType].find(
            t => t.id === id
        );

    if (!task) return;

    // Restore task
    task.status = "active";

    // Refresh pages
    renderCompleted();

    renderTasks(listType);

    updateTodayDashboard();

    // Save changes
    saveTasks();

    // Refresh calendar if open
    if (
        document.getElementById(
            "calendar"
        ).classList.contains(
            "active"
        )
    ) {

        generateCalendar();

    }

}