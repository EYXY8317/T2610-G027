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
// TASK ↔ CALENDAR CONNECTION
// This part links the calendar with the task system
// It finds which tasks belong to each day box
// ==================================================


// Convert current loop date into "YYYY-MM-DD" format
// This format must match the task.date format (important!)
let monthStr = String(month + 1).padStart(2, "0"); // month is 0-based → +1
let dayStr = String(i).padStart(2, "0");           // ensure 2 digits (01, 02, etc.)
let fullDate = `${year}-${monthStr}-${dayStr}`;    // final date string


// Get all tasks that match this date
// Also exclude tasks in trash (only show active + completed)
let tasksForDay = tasks.filter(t => 
    t.date === fullDate && 
    t.status !== "trash"
);

tasksForDay.forEach(task => {
    let taskDiv = document.createElement("div");

    taskDiv.style.fontSize = "12px";
    taskDiv.style.marginTop = "2px";
    taskDiv.innerText = task.text;

    day.appendChild(taskDiv);
});

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
        // Show month calendar
        document.querySelector(".calendar").style.display = "block";

        // Hide year view
        document.getElementById("yearView").style.display = "none";

    } else {
        // Hide month calendar
        document.querySelector(".calendar").style.display = "none";

        // Show year view
        document.getElementById("yearView").style.display = "block";
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

// ==================================================
// RUN FUNCTION (when page loads)
// ==================================================

generateCalendar();
