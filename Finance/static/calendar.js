// ==================================================
// CALENDAR SYSTEM
// This function generates a full monthly calendar
// ==================================================

// ===== CURRENT STATE =====
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// ===== VIEW STATE（control month / year）====
let currentView = "month";

function generateCalendar() {

 // Get HTML elements
    let calendar = document.getElementById("calendarDays");
    let title = document.getElementById("monthTitle");

 // Clear previous calendar content
    calendar.innerHTML = "";

     // Get current date information
    let month = currentMonth;  
    let year = currentYear;

     // List of month names
    let monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    // Display month and year on top
    title.innerText = monthNames[month] + " " + year;

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

    // ==================================================
    // STEP 4: Highlight today's date
    // ==================================================

    if (
            i === today.getDate() &&          // same day
            month === today.getMonth() &&    // same month
            year === today.getFullYear()     // same year
        ) {
            day.classList.add("today"); // apply highlight style
        }
     // Add day box into calendar
        calendar.appendChild(day);
    }
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
