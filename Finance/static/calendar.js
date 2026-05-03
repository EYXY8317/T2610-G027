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

        // Task badge
        if (taskCount > 0) {
            const badge = document.createElement("div");
            badge.className = "task-badge";
            badge.textContent = taskCount > 9 ? "9+" : taskCount;
            dayEl.appendChild(badge);
        }

        // Click to show tasks modal
        dayEl.style.cursor = "pointer";
        dayEl.addEventListener("click", () => showDayTasks(dateStr));

        calendar.appendChild(dayEl);
    }
}

// ==================================================
// DAY TASKS MODAL
// ==================================================
function showDayTasks(dateStr) {
    let html = `<h3>Tasks on ${dateStr}</h3><div style="max-height:400px; overflow-y:auto;">`;

    let hasTasks = false;
    Object.keys(taskData).forEach(list => {
        const tasks = taskData[list].filter(t => t.status === "active" && t.date === dateStr);
        tasks.forEach(task => {
            hasTasks = true;
            const color = getPriorityColor(task.priority);
            html += `
                <div style="padding:10px; margin:8px 0; border-left:4px solid ${color}; background:#f9fafb;">
                    <strong>[${list}]</strong> ${task.text}
                    <button onclick="completeTask('${list}', ${task.id}); closeDayModal()" style="margin-left:15px; color:green;">✔ Complete</button>
                    <button onclick="deleteTask('${list}', ${task.id}); closeDayModal()" style="margin-left:8px; color:red;">🗑 Delete</button>
                </div>`;
        });
    });

    if (!hasTasks) html += "<p>No tasks on this day.</p>";

    html += `</div><button onclick="closeDayModal()" style="margin-top:15px; padding:8px 16px;">Close</button>`;

    let modal = document.getElementById("dayModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "dayModal";
        modal.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border:2px solid #333; border-radius:8px; z-index:10000; min-width:350px; max-width:500px;";
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.style.display = "block";
}

function closeDayModal() {
    const modal = document.getElementById("dayModal");
    if (modal) modal.style.display = "none";
    generateCalendar();
}


     // ==================================================
    // STEP 4: Highlight today's date
    // ==================================================
    if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
    ) {
        day.classList.add("today");
    }

// ==================================================
// VIEW SWITCH FUNCTION
// ==================================================
function setView(view) {
    currentView = view;

    if (view === "month") {

        document.getElementById("monthView").style.display = "block";
        document.getElementById("yearView").style.display = "none";

        document.querySelector(".calendar-header").style.display = "flex"; // 👈 显示回来

        generateCalendar();

    } else {

        document.getElementById("monthView").style.display = "none";
        document.getElementById("yearView").style.display = "block";

        document.querySelector(".calendar-header").style.display = "none"; // 👈 隐藏！

        generateYearView();
    }
}

    // ===== PREVIOUS MONTH =====
    function prevMonth() {
         currentMonth--;

         if (currentMonth < 0) {
             currentMonth = 11;
             currentYear--;
    }

    generateCalendar();
}

    // ===== NEXT MONTH =====
    function nextMonth() {
         currentMonth++;

         if (currentMonth > 11) {
             currentMonth = 0;
             currentYear++;
    }

    generateCalendar();
}

function generateYearView() {

    document.getElementById("yearTitle").innerText = currentYear;

    let yearGrid = document.getElementById("yearGrid");
    yearGrid.innerHTML = "";

    let monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    let weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    for (let m = 0; m < 12; m++) {

        let box = document.createElement("div");
        box.classList.add("month-box");

        // ===== 标题 =====
        let title = document.createElement("div");
        title.classList.add("month-title");
        title.innerText = monthNames[m];
        box.appendChild(title);

        // ===== 星期 =====
        let weekRow = document.createElement("div");
        weekRow.classList.add("mini-weekdays");

        weekdays.forEach(day => {
            let d = document.createElement("div");
            d.innerText = day;
            weekRow.appendChild(d);
        });

        box.appendChild(weekRow);

        // ===== 日期 =====
        let mini = document.createElement("div");
        mini.classList.add("mini-calendar");

        let firstDay = new Date(currentYear, m, 1).getDay();
        let totalDays = new Date(currentYear, m + 1, 0).getDate();

        // Space
        for (let i = 0; i < firstDay; i++) {
            let empty = document.createElement("div");
            empty.classList.add("mini-empty");
            mini.appendChild(empty);
        }

        // Date
        for (let d = 1; d <= totalDays; d++) {
            let day = document.createElement("div");
            day.innerText = d;
            day.classList.add("mini-day");
            mini.appendChild(day);
        }

        box.appendChild(mini);

        // Click and back to Month
        box.onclick = function () {
            currentMonth = m;
            setView("month");
        };

        yearGrid.appendChild(box);
    }
}
    function prevYear() {
    currentYear--;
    generateYearView();
}

    function nextYear() {
    currentYear++;
    generateYearView();
}   

// ==================================================
// RUN FUNCTION (when page loads)
// ==================================================

generateCalendar();
