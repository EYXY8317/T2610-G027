// ==================================================
// CALENDAR SYSTEM
// ==================================================
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let currentView = "month";

// ==================================================
// GENERATE MONTH VIEW WITH TASK BADGES
// ==================================================
function generateCalendar() {
    const calendar = document.getElementById("calendarDays");
    const title = document.getElementById("monthTitle");

    if (!calendar || !title) return;

    calendar.innerHTML = "";

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    title.innerText = monthNames[currentMonth] + " " + currentYear;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        calendar.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= totalDays; day++) {
        const dayEl = document.createElement("div");
        dayEl.classList.add("day");

        const dateEl = document.createElement("div");
        dateEl.classList.add("date");
        dateEl.textContent = day;
        dayEl.appendChild(dateEl);

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Highlight today
        const now = new Date();
        if (day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
            dayEl.classList.add("today");
        }

        // Count tasks
        let taskCount = 0;
        Object.keys(taskData).forEach(list => {
            taskCount += taskData[list].filter(t => t.status === "active" && t.date === dateStr).length;
        });

// =====================================
// TASK NOTIFICATION BELL
// Show 🔔 + task count
// =====================================

if (taskCount > 0) {

    const badge =
        document.createElement("div");

    badge.className =
        "task-badge";

    badge.innerHTML = `
        <span
            class="material-symbols-rounded"
        >
            notifications
        </span>

        ${
            taskCount > 9
            ? "9+"
            : taskCount
        }
    `;

    dayEl.appendChild(
        badge
    );

}

        // Click to show tasks modal
        dayEl.style.cursor = "pointer";
        dayEl.addEventListener("click", () => showDayTasks(dateStr));

        calendar.appendChild(dayEl);
    }
}



// ==================================================
// DAY TASKS MODAL
// Display all active tasks for selected date
// ==================================================

function showDayTasks(dateStr) {

    // Convert date string into Date object
    const date =
        new Date(dateStr);

    // Format date for modal title
    const displayDate =
    `${date.getDate()} ${
        date.toLocaleString(
            "en-US",
            { month: "long" }
        )
    } ${
        date.getFullYear()
    }`;

    // Modal HTML start
    let html = `

    <div class="calendar-modal-header">

        <h2>

            ${displayDate}

        </h2>

        <button
            class="calendar-close-icon"
            onclick="closeDayModal()"
        >

            ✕

        </button>

    </div>

    <div class="calendar-modal-content">

    `;

    // Track whether tasks exist
    let hasTasks = false;

    // Loop through all task categories
    Object.keys(taskData).forEach(list => {

        // Get active tasks for selected date
        const tasks =
            taskData[list].filter(
                t =>
                    t.status === "active" &&
                    t.date === dateStr
            );

        tasks.forEach(task => {

            hasTasks = true;

            // Get priority border color
            const color =
                getPriorityColor(
                    task.priority
                );

            html += `

            <div
                class="calendar-task-card"
                style="
                    border-left:4px solid ${color};
                "
            >

                <!-- LEFT CONTENT -->

                <div class="calendar-task-content">

                    <!-- Task Category -->

                    <div
                        class="calendar-task-category"
                    >

                        ${
                            list.charAt(0)
                                .toUpperCase()
                            +
                            list.slice(1)
                        }

                    </div>

                    <!-- Task Title -->

                    <div
                        class="calendar-task-title"
                    >

                        ${task.text}

                    </div>

                    <!-- Task Information -->

                    <div
                        class="calendar-task-meta"
                    >

                        <div>

                            🕒

                            ${
                                task.startTime &&
                                task.endTime

                                ? `${task.startTime}
                                   - ${task.endTime}`

                                : task.startTime

                                ? task.startTime

                                : "No Time"
                            }

                        </div>

                        <div
                            class="
                            task-priority
                            priority-${task.priority}
                            "
                        >
                            <span
                                class="
                                material-symbols-rounded
                  "
                            >
                              flag
                            </span>

                            ${
                               task.priority === "red"

                               ? "High"

                               : task.priority === "orange"

                               ? "Medium"

                               : task.priority === "blue"

                               ? "Low"

                               : "No Priority"
                             }

                        </div>

                    </div>

                </div>

                <!-- RIGHT BUTTONS -->

                <div
                    class="calendar-task-actions"
                >

                    <button
                        class="
                        calendar-complete-btn
                        "
                        onclick="
                            completeTask(
                                '${list}',
                                ${task.id}
                            );
                            closeDayModal();
                        "
                    >

                        <span
                            class="
                            material-symbols-rounded
                            "
                        >
                            task_alt
                        </span>

                        Complete

                    </button>

                    <button
                        class="
                        calendar-delete-btn
                        "
                        onclick="
                            deleteTask(
                                '${list}',
                                ${task.id}
                            );
                            closeDayModal();
                        "
                    >

                        <span
                            class="
                            material-symbols-rounded
                            "
                        >
                            delete
                        </span>

                        Delete

                    </button>

                </div>

            </div>

            `;

        });

    });

    // Display message if no tasks found
    if (!hasTasks) {

        html += `

        <p
            style="
                text-align:center;
                color:#8a8aa3;
                padding:30px 0;
            "
        >

            No tasks on this day

        </p>

        `;

    }

    // Close modal content
    html += `

    </div>

    `;

    // Get existing modal
    let modal =
        document.getElementById(
            "dayModal"
        );

    // Create modal if it doesn't exist
    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "dayModal";

        modal.className =
            "calendar-day-modal";

        document.body.appendChild(
            modal
        );

    }

    // Insert generated HTML
    modal.innerHTML = html;

    // Show modal
    modal.style.display =
        "block";

}


// ==================================================
// CLOSE DAY MODAL
// ==================================================

function closeDayModal() {

    const modal =
        document.getElementById(
            "dayModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

    generateCalendar();

}



// ==================================================
// VIEW SWITCH
// ==================================================
function setView(view) {
    currentView = view;
    if (view === "month") {
        document.getElementById("monthView").style.display = "block";
        document.getElementById("yearView").style.display = "none";
        document.getElementById("monthTitle").style.display = "block";
        generateCalendar();
    } else {
        document.getElementById("monthView").style.display = "none";
        document.getElementById("yearView").style.display = "block";
        document.getElementById("monthTitle").style.display = "none";
        generateYearView();
    }
}

// ==================================================
// NAVIGATION (HEADER BUTTONS)
// ==================================================
function goPrev() {
    if (currentView === "month") {
        prevMonth();
    } else {
        prevYear();
    }
}

function goNext() {
    if (currentView === "month") {
        nextMonth();
    } else {
        nextYear();
    }
}

function goToday() {
    let now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();

    if (currentView === "month") {
        generateCalendar();
    } else {
        generateYearView();
    }
}


// ==================================================
// MONTH NAVIGATION
// ==================================================
function prevMonth() {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    generateCalendar();
}

function nextMonth() {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    generateCalendar();
}


// ==================================================
// YEAR VIEW
// ==================================================
function generateYearView() {

    document.getElementById("yearTitle").innerText = currentYear;

    let yearGrid = document.getElementById("yearGrid");
    yearGrid.innerHTML = "";

    let monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    let weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    let today = new Date();
    let currentDay = today.getDate();
    let currentMonthNum = today.getMonth();
    let currentYearNum = today.getFullYear();

    for (let m = 0; m < 12; m++) {

        let box = document.createElement("div");
        box.classList.add("month-box");

        // 标题
        let title = document.createElement("div");
        title.classList.add("month-title");
        title.innerText = monthNames[m];
        box.appendChild(title);

        // 星期
        let weekRow = document.createElement("div");
        weekRow.classList.add("mini-weekdays");

        weekdays.forEach(day => {
            let d = document.createElement("div");
            d.innerText = day;
            weekRow.appendChild(d);
        });

        box.appendChild(weekRow);

        // 日期
        let mini = document.createElement("div");
        mini.classList.add("mini-calendar");

        let firstDay = new Date(currentYear, m, 1).getDay();
        let totalDays = new Date(currentYear, m + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            let empty = document.createElement("div");
            empty.classList.add("mini-empty");
            mini.appendChild(empty);
        }

        for (let d = 1; d <= totalDays; d++) {
            let day = document.createElement("div");
            day.innerText = d;
            day.classList.add("mini-day");

            // 高亮今天
            if (m === currentMonthNum && 
                d === currentDay && 
                currentYear === currentYearNum) {
                day.classList.add("today");
            }

            mini.appendChild(day);
        }

        box.appendChild(mini);

        // 点击 → 回到 month view
        box.onclick = function () {
            currentMonth = m;
            setView("month");
        };

        yearGrid.appendChild(box);
    }
}
// ==================================================
// YEAR NAVIGATION
// ==================================================
function prevYear() {
    currentYear--;
    generateYearView();
}

function nextYear() {
    currentYear++;
    generateYearView();
}

