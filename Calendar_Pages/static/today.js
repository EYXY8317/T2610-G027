// =====================================
// TODAY DATE
// Display current date on Today page
// =====================================

function loadTodayDate() {

    // Get current date
    const now = new Date();

   // Date display format
    const options = {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    };

    // Update Today page date
    document.getElementById("date").textContent =
    now.toLocaleDateString(
        "en-GB",
        options
    );

}

// =====================================
// DAILY QUOTE SECTION
// Display motivational quote
// =====================================

function loadDailyQuote() {

    // Available quotes
   const quotes = [

    "Small progress is still progress.",

    "Done is better than perfect.",

    "One task at a time.",

    "Focus on progress, not perfection.",

    "Your future self will thank you.",

    "Consistency beats intensity.",

    "Every day is a fresh start."

];

    // Get today's day number
    const today = new Date().getDate();

    // Alternate between quotes
    const selectedQuote =
        quotes[today % quotes.length];

    // Display quote
    document.getElementById("dailyQuote")
        .textContent = selectedQuote;

}

// =====================================
// PROGRESS OVERVIEW SECTION
// Calculate today's task completion
// Update:
// 1. Progress percentage
// 2. Progress bar width
// 3. Completed task count
// 4. Total task count
// 5. Motivation badge
// =====================================

function updateProgress() {

    // Get today's date
    const today =
        new Date().toISOString().split("T")[0];

    // Total tasks scheduled for today
    let totalTasks = 0;

    // Completed tasks scheduled for today
    let completedTasks = 0;

    // Loop through all task categories
    Object.keys(taskData).forEach(list => {

        taskData[list].forEach(task => {

            // Count only today's tasks
            if (
                task.date === today &&
                task.status !== "trash"
            ) {

                totalTasks++;

                // Count completed tasks
                if (task.status === "completed") {

                    completedTasks++;

                }

            }

        });

    });

    // Calculate completion percentage
    const progress =
        totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks / totalTasks) * 100
        );

    // Update percentage text
    document.getElementById("progressPercent")
        .textContent = progress + "%";

    // Update completed task count
    document.getElementById("completedTasksCount")
        .textContent = completedTasks;

    // Update total task count
    document.getElementById("totalTasksCount")
        .textContent = totalTasks;

    // Update progress bar width
    document.getElementById("progressFill")
        .style.width = progress + "%";

    // Get progress badge element
    const badge =
        document.getElementById("progressBadge");

    // Update motivational message
    if (progress === 0) {

        badge.textContent =
            "🚀 Ready to Start";

    }

    else if (progress <= 25) {

        badge.textContent =
            "🌱 Small Progress Matters";

    }

    else if (progress <= 50) {

        badge.textContent =
            "✨ Keep Moving Forward";

    }

    else if (progress <= 75) {

        badge.textContent =
            "💜 You're Doing Great";

    }

    else if (progress < 100) {

        badge.textContent =
            "🌟 Almost There";

    }

    else {

        badge.textContent =
            "🎉 You Did It!";

    }

}

// =====================================
// TODAY TASKS SECTION
// Display all active tasks scheduled
// for today's date
// =====================================

function renderTodayTasks() {

    // Get Today task container
    const container =
        document.getElementById("todayTasks");

    // Clear previous content
    container.innerHTML = "";

    // Get today's date
    const today =
        new Date().toISOString().split("T")[0];

    // Track whether any task exists
    let hasTask = false;

    // Loop through all task categories
    Object.keys(taskData).forEach(list => {

        taskData[list].forEach(task => {

            // Show only active tasks for today
            if (
                task.status === "active" &&
                task.date === today
            ) {

                hasTask = true;

                container.innerHTML += `

                <div class="today-task-card">

                    <div class="today-task-title">

                        ${task.text}

                    </div>

                    <div class="today-task-meta">

                     ${
                           task.startTime && task.endTime
                           ? `${task.startTime} - ${task.endTime}`
                           : task.startTime || ""
                      }

                        </div>

                    </div>

                `;

            }

        });

    });

    // Show message when no task exists
    if (!hasTask) {

        container.innerHTML = `

        <div class="empty">

            No tasks for today

        </div>

        `;

    }

}

// =====================================
// TODAY DASHBOARD CONTROLLER
// Refresh all Today page components
// Components:
// 1. Today's Tasks
// 2. Progress Overview
// =====================================

function updateTodayDashboard() {

    renderTodayTasks();

    updateProgress();

}

// =====================================
// INITIALIZE TODAY PAGE
// Run when page is fully loaded
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Display current date
        loadTodayDate();

        // Display daily quote
        loadDailyQuote();

        // Load Today dashboard data
        updateTodayDashboard();

    }
);