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
    // STEP 1: Calculate important values
    // ==================================================

    // Get the first day of the month (0 = Sunday, 6 = Saturday)
    let firstDay = new Date(year, month, 1).getDay();

     // Get total number of days in this month
    let totalDays = new Date(year, month + 1, 0).getDate();

    // ==================================================
    // STEP 2: Create empty cells (for alignment)
    // Example: if first day is Friday → add 5 empty boxes
    // ==================================================

    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement("div");
        empty.classList.add("empty"); // style for blank cell
        calendar.appendChild(empty);
    }

     // ==================================================
    // STEP 3: Create actual day cells (1 → 30/31)
    // ==================================================

    for (let i = 1; i <= totalDays; i++) {

    // Create one day box
    let day = document.createElement("div");
    day.classList.add("day");

    // Create date label (top-left number)
    let date = document.createElement("div");
    date.classList.add("date");
    date.innerText = i;

    // Add date into day box
    day.appendChild(date);

    for (let i = 1; i <= totalDays; i++) {

    let day = document.createElement("div");
    day.classList.add("day");
  
    let date = document.createElement("div");
    date.classList.add("date");
    date.innerText = i;
 
    day.appendChild(date);
    
    // MAKE DAY CLICKABLE
    day.style.cursor = "pointer";

    day.addEventListener("click", function () {

        let selectedDay = String(i).padStart(2, '0');
        let selectedMonth = String(currentMonth + 1).padStart(2, '0');
        let selectedYear = currentYear;

        let formattedDate = selectedDay + "/" + selectedMonth + "/" + selectedYear;

        window.location.href = "/diary?date=" + formattedDate;
    });

    // EXISTING TODAY HIGHLIGHT (KEEP THIS)
     if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
    ) {
        day.classList.add("today");
    }

    calendar.appendChild(day);
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

    calendar.appendChild(day);
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
