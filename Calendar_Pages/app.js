// ==================================================
// CALENDAR SYSTEM
// This function generates a full monthly calendar
// ==================================================

function generateCalendar() {

 // Get HTML elements
    let calendar = document.getElementById("calendarDays");
    let title = document.getElementById("monthTitle");

 // Clear previous calendar content
    calendar.innerHTML = "";

     // Get current date information
    let today = new Date();
    let year = today.getFullYear();   
    let month = today.getMonth();     

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
