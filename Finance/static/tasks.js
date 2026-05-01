// ==================================================
// TASK SYSTEM (Multi-Category To-Do)
// This file handles all task logic
// ==================================================

// ==================================================
// GLOBAL STATE (Single Source of Truth)
// ==================================================

let tasks = [];                // Stores all tasks (all lists)
let currentList = "study";     // Current active list
let selectedTaskId = null;     // Currently selected task (for detail panel)
let hideCompleted = false;     // Toggle: hide/show completed tasks




   