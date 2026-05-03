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
