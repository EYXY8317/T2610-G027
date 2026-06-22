// ===============================
// PAGE SWITCH (Sidebar Navigation)
// Handle page navigation and
// refresh page-specific content
// ===============================

function showPage(pageId, element) {

    // Close all popups
    closeCalendar();

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

//Tag Filter
let currentTagFilter = "all";

// =====================================
// COMPLETED PAGE FILTERS
// =====================================

let selectedDateFilter =
    "all";

let selectedCategoryFilter =
    "all";

// Selected schedule information
let selectedDate = "";
let selectedStart = "";
let selectedEnd = "";

// Selected repeat settings
let selectedRepeat = "";

// Selected task settings
let selectedPriority = "";


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
// SET TAG FILTER
// ===============================

function setTagFilter(tag) {

    currentTagFilter = tag;

    renderTagFilters();

    [
        "work",
        "shopping",
        "study",
        "personal",
        "workout"
    ].forEach(list => {

        renderTasks(list);

    });

}


// ===============================
// ADD NEW TASK
// Create and save a new task
// ===============================

async function addTask(listType) {

    // Get task title
    let text =
        document.getElementById(
            listType + "TaskText"
        ).value.trim();

    // Prevent empty task
    if (!text) return;

    // Date is required
    if (!selectedDate) {

        alert(
            "Please select a date first"
        );

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

        tag:
            document.getElementById(
                "taskTag"
            )
                .value
                .trim()
                .toLowerCase(),

        description: "",

        status: "active"

    };

    // Save task into local taskData
    taskData[listType].push(task);

    // ===============================
    // SAVE TASK TO FLASK
    // ===============================

    await fetch(
        "/calendar/add_task",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                ...task,

                category: listType

            })

        }
    );

    // ===============================
    // CLEAR INPUTS
    // ===============================

    document.getElementById(
        listType + "TaskText"
    ).value = "";

    document.getElementById(
        "taskTag"
    ).value = "";

    // ===============================
    // REFRESH UI
    // ===============================

    renderTasks(listType);

    updateTodayDashboard();

    renderTagFilters();

    if (
        document.getElementById("calendar")
            .classList.contains("active")
    ) {

        generateCalendar();

    }

    // ===============================
    // RESET TEMPORARY DATA
    // ===============================

    selectedDate = "";

    selectedStart = "";

    selectedEnd = "";

    selectedRepeat = "";

    selectedPriority = "";

    // Reset priority button selection
    document
        .querySelectorAll(
            ".priority-box > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

        });

}





// ===============================
// MOVE TASK TO TRASH
// Move task from active/completed
// to Trash page
// ===============================

async function deleteTask(listType, id) {

    // Find selected task
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    if (!task) return;

    // Move task to trash
    task.status = "trash";

    const response =
        await fetch(
            "/calendar/update_task",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(task)
            }
        );

    const result =
        await response.json();

    if (!result.success) {

        alert(
            "Failed to update task"
        );

        return;

    }

    // Refresh active task list
    renderTasks(listType);

    // Refresh completed page
    renderCompleted();

    // Refresh trash page
    renderTrash();

    // Refresh Today Dashboard
    updateTodayDashboard();

    // Refresh tag filters
    renderTagFilters();

    // Refresh calendar if open
    if (
        document.getElementById("calendar")
            .classList.contains("active")
    ) {

        generateCalendar();

    }

}



// ===============================
// RENDER TAG FILTERS
// ===============================

function renderTagFilters() {

    const pages = [
        "work",
        "shopping",
        "study",
        "personal",
        "workout"
    ];

    pages.forEach(listType => {

        const container =
            document.getElementById(
                listType + "TagFilter"
            );

        if (!container) return;

        container.innerHTML = "";

        // All Button
        container.innerHTML += `

            <button
                class="
                    tag-chip
                    ${currentTagFilter === "all"
                ? "active"
                : ""
            }
                "
                onclick="setTagFilter('all')"
            >

                All

            </button>

        `;

        // Collect tags from this category
        const tags = new Set();

        taskData[listType].forEach(task => {

            if (
                task.tag &&
                task.tag.trim()
            ) {

                tags.add(
                    task.tag.trim()
                );

            }

        });

        // Create tag chips
        [...tags]
            .sort()
            .forEach(tag => {

                container.innerHTML += `

                <button
                    class="
                        tag-chip
                        ${currentTagFilter === tag
                        ? "active"
                        : ""
                    }
                    "
                    onclick="setTagFilter('${tag}')"
                >

                   ${tag.charAt(0).toUpperCase()
                    + tag.slice(1)
                    }

                </button>

            `;

            });

    });

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
        taskData[listType].filter(task => {

            if (task.status !== "active") {

                return false;

            }

            if (
                currentTagFilter !== "all" &&
                task.tag !== currentTagFilter
            ) {

                return false;

            }

            return true;

        });

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

                    ${task.startTime || task.endTime
                ? `
                        <span class="task-time">

                            <span class="material-symbols-rounded">
                                schedule
                            </span>

                              ${task.startTime && task.endTime
                    ? `${task.startTime} - ${task.endTime}`
                    : task.startTime
                        ? task.startTime
                        : ""
                }
                        </span>
                        `
                : ""
            }

                    ${task.priority
                ? `
                        <span class="task-priority">

                            ${getPriorityDot(task.priority)}

                            ${task.priority === "red"
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

   // =====================================
   // CATEGORY FILTER
   // Show only selected category
   // =====================================

    if (

    selectedCategoryFilter !==
    "all"

    &&

    listType !==
    selectedCategoryFilter

) {

    return;

}

let completedTasks =
    taskData[listType].filter(
        task => {

            // Only show completed tasks
            if (
                task.status !==
                "completed"
            ) {

                return false;

            }

            // Skip date filter if All Dates selected
            if (
                selectedDateFilter ===
                "all"
            ) {

                return true;

            }

            const completedDate =
                new Date(
                    task.completedDate
                );

            const today =
                new Date();

            // =====================================
            // TODAY
            // =====================================

            if (
                selectedDateFilter ===
                "today"
            ) {

                return (

                    completedDate
                    .toDateString()

                    ===

                    today
                    .toDateString()

                );

            }

            // =====================================
            // THIS WEEK
            // =====================================

            if (
                selectedDateFilter ===
                "thisWeek"
            ) {

                const weekAgo =
                    new Date();

                weekAgo.setDate(
                    today.getDate() - 7
                );

                return (
                    completedDate >=
                    weekAgo
                );

            }

            // =====================================
            // THIS MONTH
            // =====================================

            if (
                selectedDateFilter ===
                "thisMonth"
            ) {

                return (

                    completedDate
                    .getMonth()

                    ===

                    today
                    .getMonth()

                    &&

                    completedDate
                    .getFullYear()

                    ===

                    today
                    .getFullYear()

                );

            }

            // =====================================
            // LAST WEEK
            // =====================================

            if (
                selectedDateFilter ===
                "lastWeek"
            ) {

                const startOfThisWeek =
                    new Date();

                startOfThisWeek.setDate(
                    today.getDate() - 7
                );

                const startOfLastWeek =
                    new Date();

                startOfLastWeek.setDate(
                    today.getDate() - 14
                );

                return (

                    completedDate >=
                    startOfLastWeek

                    &&

                    completedDate <
                    startOfThisWeek

                );

            }

            // =====================================
            // LAST MONTH
            // =====================================

            if (
                selectedDateFilter ===
                "lastMonth"
            ) {

                const lastMonthDate =
                    new Date();

                lastMonthDate.setMonth(
                    today.getMonth() - 1
                );

                return (

                    completedDate
                    .getMonth()

                    ===

                    lastMonthDate
                    .getMonth()

                    &&

                    completedDate
                    .getFullYear()

                    ===

                    lastMonthDate
                    .getFullYear()

                );

            }

            // =====================================
            // OLDER
            // More than 30 days ago
            // =====================================

            if (
                selectedDateFilter ===
                "older"
            ) {

                const thirtyDaysAgo =
                    new Date();

                thirtyDaysAgo.setDate(
                    today.getDate() - 30
                );

                return (

                    completedDate <
                    thirtyDaysAgo

                );

            }

            return true;

        }
    );
    
        if (completedTasks.length === 0) return;

        hasCompleted = true;

// Create category section
const section =
    document.createElement("div");

section.style.marginBottom = "25px";

section.innerHTML = `

<div class="completed-group-card">

    <div class="completed-group-header">

        <div class="completed-group-icon">

            <span class="material-symbols-rounded">

                ${
                    listType === "work"
                    ? "work"

                    : listType === "shopping"
                    ? "shopping_cart"

                    : listType === "study"
                    ? "menu_book"

                    : listType === "personal"
                    ? "person"

                    : "fitness_center"
                }

            </span>

        </div>

        <div>

            <div class="completed-group-name">

                ${
                    listType.charAt(0)
                    .toUpperCase()
                    +
                    listType.slice(1)
                }

            </div>

            <div class="completed-group-count">

                ${completedTasks.length}
                Completed Tasks

            </div>

        </div>

    </div>

    <div class="completed-group-list">

    </div>

</div>

`;


    const taskContainer =
       section.querySelector(
           ".completed-group-list"
        );

        // Create completed task cards
        completedTasks.forEach(task => {

            const card =
                document.createElement("div");

            card.className =
                 "completed-task-row";

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

                        ${task.startTime || task.endTime
                    ? `
                            <span class="task-time">

                                <span class="material-symbols-rounded">
                                    schedule
                                </span>

                                ${task.startTime && task.endTime
                        ? `${task.startTime} - ${task.endTime}`
                        : task.startTime
                            ? task.startTime
                            : ""
                    }

                            </span>
                            `
                    : ""
                }

                        ${task.priority
                    ? `
                            <span class="task-priority">

                                ${getPriorityDot(task.priority)}

                                ${task.priority === "red"
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

        section.style.marginBottom = "16px";

        section.innerHTML = `

            <h3 class="trash-section-title">

                <span class="material-symbols-rounded">
                    delete
                </span>

                ${listType.charAt(0).toUpperCase()
            + listType.slice(1)
            }

                 (${trashTasks.length})

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

                        ${task.startTime || task.endTime
                    ? `
                            <span class="task-time">

                                <span class="material-symbols-rounded">
                                    schedule
                                </span>

                               ${task.startTime && task.endTime
                        ? `${task.startTime} - ${task.endTime}`
                        : task.startTime
                            ? task.startTime
                            : ""
                    }

                            </span>
                            `
                    : ""
                }

                        <!-- Priority -->

                        ${task.priority
                    ? `
                            <span class="task-priority">

                                ${getPriorityDot(task.priority)}

                                ${task.priority === "red"
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

        // Insert task cards into section
        section.appendChild(
              taskContainer
);

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
// DELETE TASK PERMANENTLY
// Remove task forever from storage
// ===============================

async function permanentlyDeleteTask(listType, id) {

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

const response =
    await fetch(
        "/calendar/delete_task",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    id: id
                })
        }
    );

const result =
    await response.json();

if (!result.success) {

    alert(
        "Delete failed"
    );

    return;

}

    renderTrash();

    renderTagFilters();

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

    renderTagFilters();

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

    const popup =
        document.getElementById(
            "calendarPopup"
        );

    if (!popup) return;

    if (
        popup.style.display === "block"
    ) {

        popup.style.display = "none";

        return;

    }

    popup.style.display = "block";

    const rect =
        btn.getBoundingClientRect();

    const popupWidth = 420;

    let left =
        rect.right - popupWidth;

    let top =
        rect.bottom + 12;

    if (left < 10) {

        left = 10;

    }

    popup.style.left =
        left + "px";

    popup.style.top =
        top + "px";

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
// GET PRIORITY FLAG ICON
// Return colored Material Symbol
// ===============================

let panelSelectedPriority = "";

function setPanelPriority(priority, e) {

    panelSelectedPriority = priority;

    document
        .querySelectorAll(
            "#panelPriorityBox > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

        });

    e.currentTarget.classList.add(
        "priority-selected"
    );

}

function getPriorityDot(priority) {

    if (priority === "red") {

        return `

        <span
            class="
            material-symbols-rounded
            priority-high
            "
        >

            flag

        </span>

        `;

    }

    if (priority === "orange") {

        return `

        <span
            class="
            material-symbols-rounded
            priority-medium
            "
        >

            flag

        </span>

        `;

    }

    if (priority === "blue") {

        return `

        <span
            class="
            material-symbols-rounded
            priority-low
            "
        >

            flag

        </span>

        `;

    }

    if (priority === "gray") {

        return `

        <span
            class="
            material-symbols-rounded
            priority-none
            "
        >

            outlined_flag

        </span>

        `;

    }

    return "";

}



// ===============================
// SET PRIORITY
// Highlight selected priority
// ===============================

function setPriority(priority, e) {

    selectedPriority = priority;

    document
        .querySelectorAll(
            ".priority-box > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

        });

    if (e) {

        e.currentTarget.classList.add(
            "priority-selected"
        );

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
// PERSISTENCE 
// Load task data from Flask API
// ===============================

async function loadTasks() {

    try {

        const response =
            await fetch(
                "/calendar/tasks"
            );

        taskData =
            await response.json();

    }

    catch(error) {

        console.error(
            "Failed to load tasks:",
            error
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

    async () => {

        // Load task data
        await loadTasks();

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

        // Refresh Tag filters
        renderTagFilters();

// =====================================
// COMPLETED PAGE FILTER EVENTS
// =====================================

const dateFilter =
    document.getElementById(
        "dateFilter"
    );

if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        e => {

            selectedDateFilter =
                e.target.value;

            renderCompleted();

        }
    );

}

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        e => {

            selectedCategoryFilter =
                e.target.value;

            renderCompleted();

        }
    );

}

        // Tag suggestion
        const tagInput =
            document.getElementById(
                "panelTagInput"
            );

        if (tagInput) {

            tagInput.addEventListener(
                "input",

                function () {

                    renderTagSuggestions(
                        this.value
                    );

                }

            );

        }

    }

);


// ===============================
// TOGGLE COMPLETE STATUS
// Active ↔ Completed
// Move task between Active
// and Completed
// ===============================

async function toggleComplete(
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

// =====================================
// COMPLETE TASK ANIMATION
// Play completion animation
// before moving task into
// Completed page
// =====================================

if (checkbox.checked) {

    // Get current task card
    const taskCard =
        checkbox.closest(
            ".task-card"
        );

    // Add slide-out animation
    if (taskCard) {

        taskCard.classList.add(
            "task-completing"
        );

    }

    // Wait for animation to finish
    setTimeout(async () => {

        // Update task status
        task.status =
            "completed";

        // Save completion timestamp
        task.completedDate =
            new Date()
            .toISOString();

        // Save updated task to Flask
        await fetch(
            "/calendar/update_task",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    task
                )
            }
        );

        // Refresh active task page
        renderTasks(
            listType
        );

        // Refresh completed page
        renderCompleted();

        // Refresh trash page
        renderTrash();

        // Refresh Today Dashboard
        updateTodayDashboard();

        // Refresh tag filters
        renderTagFilters();

        // Show completion message
        showToast(
            "✨ You Did It!"
        );

        // Refresh calendar if open
        if (
            document.getElementById(
                "calendar"
            )
            .classList.contains(
                "active"
            )
        ) {

            generateCalendar();

        }

    }, 600);

    return;

}

// =====================================
// UNCHECK TASK
// Move task back to active
// =====================================

task.status =
    "active";
    
await fetch(
    "/calendar/update_task",
    {
        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify(task)
    }
);

    // Refresh pages
    renderTasks(listType);

    renderCompleted();

    renderTrash();

    updateTodayDashboard();

    renderTagFilters();

 
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
        "panelRepeatSelect"
    ).value =
        task.repeat || "none";

    panelSelectedPriority =
        task.priority || "";

    document
        .querySelectorAll(
            "#panelPriorityBox > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

            if (
                el.dataset.priority ===
                panelSelectedPriority
            ) {

                el.classList.add(
                    "priority-selected"
                );

            }

        });

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

async function saveTaskChanges() {

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

    task.repeat =
        document.getElementById(
            "panelRepeatSelect"
        ).value;

    task.priority =
        panelSelectedPriority;

    task.tag =
        document.getElementById(
            "panelTagInput"
        )
            .value
            .trim()
            .toLowerCase();

    // Save data
    saveTasks();

    // Refresh pages
    renderTasks(
        currentTaskListType
    );

    renderTagFilters();

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

async function restoreTask(listType, id) {

    let task =
        taskData[listType].find(
            t => t.id === id
        );

    if (!task) return;

    // Restore task
    task.status = "active";

    const response =
    await fetch(
        "/calendar/update_task",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(task)
        }
    );

const result =
    await response.json();

if (!result.success) {

    alert("Restore failed");

    return;

}

    // Refresh pages
    renderCompleted();

    renderTasks(listType);

    updateTodayDashboard();

    renderTagFilters();

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

// ===============================
// EMPTY TRASH
// Permanently delete all trashed tasks
// ===============================

async function emptyTrash() { 

    if (
        !confirm(
            "Permanently delete all tasks in Trash?"
        )
    ) {
        return;
    }

    Object.keys(taskData).forEach(listType => {

        taskData[listType] =
            taskData[listType].filter(
                task => task.status !== "trash"
            );

    });

const response =
    await fetch(
        "/calendar/empty_trash",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            }
        }
    );

const result =
    await response.json();

if (!result.success) {

    alert(
        "Failed to empty trash"
    );

    return;

}

const response =
    await fetch(
        "/calendar/empty_trash",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            }
        }
    );

const result =
    await response.json();

if (!result.success) {

    alert(
        "Failed to empty trash"
    );

    return;

}

    renderTrash();

    renderTagFilters();
}

// ===============================
// RENDER TAG SUGGESTIONS
// ===============================

function renderTagSuggestions(keyword) {

    const container =
        document.getElementById(
            "tagSuggestions"
        );

    if (!container) return;

    container.innerHTML = "";

    keyword =
        keyword
            .trim()
            .toLowerCase();

    // 没输入就隐藏
    if (!keyword) {

        container.style.display =
            "none";

        return;

    }

    const tags =
        new Set();

    Object.keys(taskData).forEach(list => {

        taskData[list].forEach(task => {

            if (
                task.tag &&
                task.tag.includes(keyword)
            ) {

                tags.add(task.tag);

            }

        });

    });

    // 没匹配结果
    if (tags.size === 0) {

        container.style.display =
            "none";

        return;

    }

    [...tags]
        .sort()
        .forEach(tag => {

            container.innerHTML += `

            <div
                class="tag-suggestion"
                onclick="selectTagSuggestion('${tag}')"
            >

                ${tag.charAt(0).toUpperCase()
                + tag.slice(1)
                }

            </div>

        `;

        });

    container.style.display =
        "block";

}

// ===============================
// SELECT POPUP TAG
// ===============================

function selectPopupTagSuggestion(tag) {

    document.getElementById(
        "taskTag"
    ).value = tag;

    document.getElementById(
        "popupTagSuggestions"
    ).style.display = "none";

}

// ===============================
// SELECT TAG SUGGESTION
// ===============================

function selectTagSuggestion(tag) {

    document.getElementById(
        "panelTagInput"
    ).value = tag;

    document.getElementById(
        "tagSuggestions"
    ).style.display = "none";

}

// ===============================
// POPUP TAG SUGGESTIONS
// ===============================

function renderPopupTagSuggestions(keyword) {

    const container =
        document.getElementById(
            "popupTagSuggestions"
        );

    container.innerHTML = "";

    keyword =
        keyword
            .trim()
            .toLowerCase();

    if (!keyword) {

        container.style.display =
            "none";

        return;

    }

    const tags =
        new Set();

    Object.keys(taskData).forEach(list => {

        taskData[list].forEach(task => {

            if (
                task.tag &&
                task.tag.startsWith(keyword)
            ) {

                tags.add(task.tag);

            }

        });

    });

    if (tags.size === 0) {

        container.style.display =
            "none";

        return;

    }

    [...tags]
        .sort()
        .forEach(tag => {

            container.innerHTML += `

            <div
                class="tag-suggestion"
                onclick="
                    selectPopupTagSuggestion(
                        '${tag}'
                    )
                "
            >

                ${tag.charAt(0).toUpperCase()
                + tag.slice(1)
                }

            </div>

        `;

        });

    container.style.display =
        "block";

}


// =====================================
// SHOW TOAST MESSAGE
// Display a temporary notification
// on the top-right corner
//
// Features:
// 1. Show custom message
// 2. Smooth fade-in animation
// 3. Auto hide after 2 seconds
// =====================================

function showToast(message){

    // Get toast element
    const toast =
        document.getElementById(
            "toast"
        );

    // Update toast text
    toast.textContent =
        message;

    // Show toast animation
    toast.classList.add(
        "show"
    );

    // Auto hide after 2 seconds
    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2000);

}


// =====================================
// COMPLETE TASK FROM CALENDAR MODAL
// Complete task directly from calendar
// =====================================

async function completeTask(
    listType,
    id
) {

    const task =
        taskData[listType].find(
            t => t.id === id
        );

    if (!task) return;

    // Update task status
    task.status =
        "completed";

    task.completedDate =
        new Date().toISOString();

    // Save to Flask
    await fetch(
        "/calendar/update_task",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(task)
        }
    );

    // Refresh all pages
    renderTasks(listType);

    renderCompleted();

    renderTrash();

    updateTodayDashboard();

    renderTagFilters();

    generateCalendar();

    // Success toast
    showToast(
        "✨ You Did It!"
    );

}