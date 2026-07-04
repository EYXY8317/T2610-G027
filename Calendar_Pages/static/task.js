// ===============================
// 1.GLOBAL STATE
//   Store temporary values used
//   across the application
// 
// 全局状态变量
// 用于储存整个应用程序中
// 会重复使用的数据
// ===============================

// 当前日期对象
let today = new Date();

// Task storage
// 用于储存所有任务数据
let taskData = {

    work: [],
    shopping: [],
    study: [],
    personal: [],
    workout: []

};

// Tag filter
// 当前选中的标签筛选器
let currentTagFilter = "all";

// Topbar search keyword (task pages only — Calendar page searches diary instead)
// 顶部搜索关键字（仅用于任务分类页面，Calendar 页面另外搜索日记）
let currentSearchKeyword = "";

// Completed page filters
// Completed 页面筛选条件
let selectedDateFilter = "all";
let selectedCategoryFilter = "all";

// Calendar popup selections
// 日历弹窗中选择的日期与时间
let selectedDate = "";
let selectedStart = "";
let selectedEnd = "";
let selectedRepeat = "";

// Priority selections
// 当前选中的任务优先级
let selectedPriority = "";
let panelSelectedPriority = "";

// Current Task
// 当前正在操作的任务信息
let currentTaskListType = "";
let currentTaskId = null;



// ===============================
// 2. PAGE SWITCH (Sidebar Navigation)
// Handle page navigation and
// refresh page-specific content
//
// 页面切换（侧边栏导航）
// 负责切换页面并刷新对应页面内容
// ===============================

function showPage(pageId, element) {

    // Reset topbar search when switching pages
    // (Calendar page searches diary; task pages filter their own list)
    // 切换页面时重置顶部搜索框
    // （Calendar 页面搜索日记，任务页面则筛选各自的任务列表）
    currentSearchKeyword = "";
    if (typeof diaryMatchDates !== "undefined") diaryMatchDates.clear();
    const topbarSearchInput = document.getElementById("diarySearchInput");
    const topbarSearchResults = document.getElementById("diarySearchResults");
    if (topbarSearchInput) {
        topbarSearchInput.value = "";
        const placeholders = {
            calendar: "Search diary...",
            today:    "Search today's tasks...",
            work:     "Search Work Tasks...",
            shopping: "Search Shopping List...",
            study:    "Search Study Plan...",
            personal: "Search Personal Memos...",
            workout:  "Search Workout Plan...",
            completed:"Search completed tasks...",
            trash:    "Search trash..."
        };
        topbarSearchInput.placeholder = placeholders[pageId] || "Search";
    }
    if (topbarSearchResults) {
        topbarSearchResults.innerHTML = "";
        topbarSearchResults.classList.remove("open");
    }

    // Close all calendar popups
    // 关闭所有日历弹窗
    closeCalendar();

    // Close task detail panel
    // 关闭任务详情面板
    closeDetailPanel();

    // Hide all pages
    // 隐藏所有页面
    document.querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });

    // Show selected page
    // 显示被选中的页面
    document.getElementById(pageId)
        .classList.add("active");

    // Remove active state from all menu items
    // 移除所有菜单的 active 状态
    document.querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.remove("active");

        });

    // Highlight selected menu item
    // 高亮当前选中的菜单
    if (element) {

        element.classList.add("active");

    }

    // ===============================
    // Refresh page content
    // Refresh specific page data
    //
    // 刷新页面内容
    // 根据页面类型更新对应数据
    // ===============================

    // Refresh Completed page
    // 刷新 Completed 页面
    if (pageId === "completed") {

        renderCompleted();

    }

    // Refresh Trash page
    // 刷新 Trash 页面
    else if (pageId === "trash") {

        renderTrash();

    }

    // Refresh Today page
    // 刷新 Today 页面
    else if (pageId === "today") {

        updateTodayDashboard();

    }

    // Refresh task category pages
    // 刷新各任务分类页面
    else if (
        ["work", "shopping", "study", "personal", "workout"]
            .includes(pageId)
    ) {

        renderTasks(pageId);

    }

    // Refresh Calendar page
    // 刷新 Calendar 页面
    else if (pageId === "calendar") {

        generateCalendar();

    }

}


// =====================================
// 3.DATA MANAGEMENT 数据管理
// =====================================

// ===============================
// PERSISTENCE
// Load task data from Flask API
//
// 数据持久化
// 从 Flask API 加载任务数据
// ===============================

async function loadTasks() {

    try {

        // Send request to Flask backend
        // 向 Flask 后端发送请求
        const response =
            await fetch(
                "/calendar/tasks"
            );

        // Convert response into JSON
        // 将响应数据转换为 JSON 格式
        taskData =
            await response.json();

    }

    catch(error) {

        // Display error message in console
        // 在控制台显示错误信息
        console.error(
            "Failed to load tasks:",
            error
        );

    }

}


// =====================================
// 4. TASK CRUD
// Create, Read, Update and Delete tasks
//
// 任务 CRUD 操作
// 用于创建、读取、更新和删除任务
// =====================================

// ===============================
// ADD NEW TASK
// Create and save a new task
//
// 新增任务
// 创建并保存一个新任务
// ===============================

async function addTask(listType) {

    // Get task title from input field
    // 从输入框获取任务标题
    let text =
        document.getElementById(
            listType + "TaskText"
        ).value.trim();


    // =====================================
    // Validate task name and schedule
    // 检查任务名称与日期是否填写
    // =====================================

    if (!text && !selectedDate) {

        showReminderPopup({

            title: "⚠️ Missing Information",

            message: "Please enter a task name and set the schedule (Date)",

            confirmText: "OK"

        });

        return;

    }

    if (!text) {

        showReminderPopup({

            title: "⚠️ Missing Information",

            message: "Please enter a task name",

            confirmText: "OK"

        });

        return;

    }

    if (!selectedDate) {

        showReminderPopup({

            title: "⚠️ Missing Information",

            message: "Please set the schedule (Date)",

            confirmText: "OK"

        });

        return;

    }

    // Create task object
    // 创建任务对象
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
    // 将任务保存到本地 taskData
    taskData[listType].push(task);

    // ===============================
    // SAVE TASK TO FLASK
    // Send task data to backend API
    //
    // 保存任务到 Flask 后端
    // 将任务资料发送到后端 API
    // ===============================

try {

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

}

catch(error) {

    // Remove task if saving failed
    // 如果保存失败，则移除刚刚新增的任务
    taskData[listType] =
        taskData[listType].filter(
            t => t.id !== task.id
        );

    console.error(
        "Failed to save task:",
        error
    );

    showReminderPopup({
        title: "Save Failed",
        message: "Failed to save task.",
        confirmText: "OK"
    });

    return;

}

    // ===============================
    // CLEAR INPUTS
    // Reset input fields after saving
    //
    // 清空输入栏
    // 保存后重置输入框内容
    // ===============================

    document.getElementById(
        listType + "TaskText"
    ).value = "";

    document.getElementById(
        "taskTag"
    ).value = "";

    // ===============================
    // REFRESH UI
    // Update all related interfaces
    //
    // 刷新界面
    // 更新所有相关页面显示
    // ===============================

    // Refresh current task list
    // 刷新当前任务列表
    renderTasks(listType);

    // Refresh Today page dashboard
    // 刷新 Today 页面
    updateTodayDashboard();

    // Refresh tag filter buttons
    // 刷新标签筛选器
    renderTagFilters();

    // Refresh calendar if Calendar page is active
    // 如果当前在 Calendar 页面，则刷新日历
    if (
        document.getElementById("calendar")
            .classList.contains("active")
    ) {

        generateCalendar();

    }

    // ===============================
    // RESET TEMPORARY DATA
    // Clear temporary selections
    //
    // 重置临时数据
    // 清空当前选择的数据
    // ===============================

    selectedDate = "";

    selectedStart = "";

    selectedEnd = "";

    selectedRepeat = "";

    selectedPriority = "";

    // Reset priority button selection
    // 重置优先级按钮选中状态
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
//
// 移动任务到垃圾桶
// 将任务从 Active 或 Completed
// 页面移动到 Trash 页面
// ===============================

async function deleteTask(listType, id) {

    // Find selected task
    // 查找指定的任务
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    // 如果任务不存在则停止执行
    if (!task) return;

    // Store current task status
    // 保存任务当前状态
    const oldStatus =
    task.status;

    // Move task to trash
    // 将任务状态改为 trash
    task.status = "trash";

    // Send updated task data to Flask backend
    // 将更新后的任务数据发送到 Flask 后端
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

    // Convert response into JSON
    // 将响应转换成 JSON 格式
    const result =
        await response.json();

    // Show error if update failed
    // 如果更新失败则显示错误信息
    if (!result.success) {

        // Restore previous task status
        // 恢复任务原本的状态
         task.status =
             oldStatus;

        showReminderPopup({
            title: "Update Failed",
            message: "Failed to update task.",
            confirmText: "OK"
        });

        return;

    }

    // Refresh active task list
    // 刷新当前任务列表
    renderTasks(listType);

    // Refresh completed page
    // 刷新 Completed 页面
    renderCompleted();

    // Refresh trash page
    // 刷新 Trash 页面
    renderTrash();

    // Refresh Today Dashboard
    // 刷新 Today 页面
    updateTodayDashboard();

    // Refresh tag filters
    // 刷新标签筛选器
    renderTagFilters();

    // Refresh calendar if Calendar page is open
    // 如果当前正在 Calendar 页面，则刷新日历
    if (
        document.getElementById("calendar")
            .classList.contains("active")
    ) {

        generateCalendar();

    }

}

// =====================================
// RESTORE TASK
// Restore task from Trash
// Move task back to Active list
//
// 恢复任务
// 将任务从 Trash 页面恢复到 Active 列表
// =====================================

async function restoreTask(listType, id) {

    // Find the selected task
    // 查找指定的任务
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop function if task does not exist
    // 如果任务不存在，则停止执行
    if (!task) return;

    // =====================================
    // OPTIMISTIC UI UPDATE
    // Immediately update UI before
    // waiting for server response
    //
    // 乐观更新机制
    // 在等待服务器响应前，
    // 先立即更新界面
    // =====================================

    // Store original status
    // Used to rollback if save fails
    //
    // 保存原本状态
    // 如果保存失败可用于恢复
    const oldStatus =
        task.status;

    // Restore task locally
    // 在本地先恢复任务状态
    task.status = "active";

    // Refresh pages immediately
    // 立即刷新相关页面
    renderCompleted();

    renderTasks(listType);

    renderTrash();

    updateTodayDashboard();

    renderTagFilters();

    // Refresh calendar if open
    // 如果当前正在 Calendar 页面，则刷新日历
    if (
        document.getElementById(
            "calendar"
        ).classList.contains(
            "active"
        )
    ) {

        generateCalendar();

    }

    // =====================================
    // SAVE CHANGES TO SERVER
    // Send updated task data to backend
    //
    // 保存修改到服务器
    // 将更新后的任务数据发送到后端
    // =====================================

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

    // Convert server response into JSON
    // 将服务器响应转换为 JSON 格式
    const result =
        await response.json();

    // =====================================
    // ROLLBACK IF SAVE FAILED
    // Restore previous status if
    // server update was unsuccessful
    //
    // 回滚机制
    // 如果服务器更新失败，
    // 则恢复任务原本状态
    // =====================================

    if (!result.success) {

        // Revert task status
        // 恢复任务原本状态
        task.status =
            oldStatus;

        // Refresh all related pages again
        // 重新刷新所有相关页面
        renderCompleted();

        renderTasks(listType);

        renderTrash();

        updateTodayDashboard();

        renderTagFilters();

        // Refresh calendar if open
        // 如果当前正在 Calendar 页面，则刷新日历
        if (
            document.getElementById(
                "calendar"
            ).classList.contains(
                "active"
            )
        ) {

            generateCalendar();

        }

        // Display error message
        // 显示恢复失败提示
        showReminderPopup({
            title: "Restore Failed",
            message: "Restore failed.",
            confirmText: "OK"
        });

    }

}

// ===============================
// DELETE CURRENT TASK
// Move current task to Trash
//
// 删除当前任务
// 将当前任务移动到垃圾桶
// ===============================

function deleteCurrentTask() {

    // Ask user for confirmation
    // 询问用户是否确认删除
    showReminderPopup({
        title: "Delete Task?",
        message: "Delete this task?",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
        onConfirm: function() {

            // Move current task to Trash
            // 将当前任务移动到垃圾桶
            deleteTask(
                currentTaskListType,
                currentTaskId
            );

            // Close task detail panel
            // 关闭任务详情面板
            closeDetailPanel();

        }
    });

}

// ===============================
// DELETE TASK PERMANENTLY
// Remove task forever from storage
//
// 永久删除任务
// 从系统中彻底移除任务
// ===============================

function permanentlyDeleteTask(listType, id) {

    // Ask user for confirmation
    // 询问用户是否确认永久删除
    showReminderPopup({
        title: "Permanently Delete?",
        message: "Permanently delete this task?",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
        onConfirm: async function() {

            // Remove task from local taskData
            // 从本地 taskData 中删除任务
            taskData[listType] =
                taskData[listType].filter(
                    task => task.id !== id
                );

            // Send delete request to Flask backend
            // 向 Flask 后端发送删除请求
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

            // Convert response into JSON
            // 将服务器响应转换为 JSON 格式
            const result =
                await response.json();

            // Display error message if deletion failed
            // 如果删除失败，则显示错误信息
            if (!result.success) {

                showReminderPopup({
                    title: "Delete Failed",
                    message: "Delete failed.",
                    confirmText: "OK"
                });

                return;

            }

            // Refresh Trash page
            // 刷新垃圾桶页面
            renderTrash();

            // Refresh tag filters
            // 刷新标签筛选器
            renderTagFilters();

        }
    });

}

// ===============================
// EMPTY TRASH
// Permanently delete all trashed tasks
//
// 清空垃圾桶
// 永久删除所有垃圾桶中的任务
// ===============================

function emptyTrash() {

    // Ask user for confirmation
    // 询问用户是否确认清空垃圾桶
    showReminderPopup({
        title: "Empty Trash?",
        message: "Permanently delete all tasks in Trash?",
        confirmText: "Delete All",
        cancelText: "Cancel",
        danger: true,
        onConfirm: async function() {

            // Remove all tasks with status "trash"
            // 删除所有状态为 "trash" 的任务
            Object.keys(taskData).forEach(listType => {

                taskData[listType] =
                    taskData[listType].filter(
                        task => task.status !== "trash"
                    );

            });

            // Send request to Flask backend
            // 向 Flask 后端发送清空垃圾桶请求
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

            // Convert server response into JSON
            // 将服务器响应转换为 JSON 格式
            const result =
                await response.json();

            // Display error message if operation failed
            // 如果操作失败，则显示错误信息
            if (!result.success) {

                showReminderPopup({
                    title: "Empty Trash Failed",
                    message: "Failed to empty trash.",
                    confirmText: "OK"
                });

                return;

            }

            // Refresh Trash page
            // 刷新垃圾桶页面
            renderTrash();

            // Refresh tag filters
            // 刷新标签筛选器
            renderTagFilters();

        }
    });
}

// =====================================
// 5. TASK COMPLETION
//
// 任务完成功能
// =====================================

// ===============================
// TOGGLE COMPLETE STATUS
// Active ↔ Completed
// Move task between Active
// and Completed
//
// 切换任务完成状态
// Active ↔ Completed
// 在进行中和已完成之间切换
// ===============================

async function toggleComplete(
    listType,
    id,
    checkbox
) {

    // Find selected task
    // 查找指定任务
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task does not exist
    // 如果任务不存在，则停止执行
    if (!task) return;

    // Create next recurring task
    // 如果任务为重复任务且被完成，
    // 自动创建下一次重复任务
    if (
        checkbox.checked &&
        task.repeat &&
        task.repeat !== "none" &&
        task.date
    ) {

        // Convert task date into Date object
        // 将任务日期转换为 Date 对象
        let nextDate =
            new Date(task.date);

        // Calculate next occurrence date
        // 根据重复类型计算下一次日期
        switch (task.repeat) {

            case "daily":

                // Add 1 day
                // 增加 1 天
                nextDate.setDate(
                    nextDate.getDate() + 1
                );

                break;

            case "weekly":

                // Add 7 days
                // 增加 7 天
                nextDate.setDate(
                    nextDate.getDate() + 7
                );

                break;

            case "monthly":

                // Add 1 month
                // 增加 1 个月
                nextDate.setMonth(
                    nextDate.getMonth() + 1
                );

                break;

            case "yearly":

                // Add 1 year
                // 增加 1 年
                nextDate.setFullYear(
                    nextDate.getFullYear() + 1
                );

                break;

        }

        // Create new recurring task
        // 创建新的重复任务
        taskData[listType].push({

            ...task,

            // Generate new unique ID
            // 生成新的唯一 ID
            id: Date.now(),

            // New task should remain active
            // 新任务状态设为 active
            status: "active",

            // Save next occurrence date
            // 保存下一次执行日期
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
//
// 完成任务动画
// 在任务移动到 Completed 页面前
// 播放完成动画
// =====================================

if (checkbox.checked) {

    // Get current task card
    // 获取当前任务卡片
    const taskCard =
        checkbox.closest(
            ".task-card"
        );

    // Add slide-out animation
    // 添加完成动画效果
    if (taskCard) {

        taskCard.classList.add(
            "task-completing"
        );

    }

    // Wait for animation to finish
    // 等待动画播放完成
    setTimeout(async () => {

        // Update task status
        // 更新任务状态为 completed
        task.status =
            "completed";

        // Save completion timestamp
        // 保存任务完成时间
        task.completedDate =
            new Date()
            .toISOString();

        // Save updated task to Flask
        // 将更新后的任务保存到 Flask 后端
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
        // 刷新当前任务页面
        renderTasks(
            listType
        );

        // Refresh completed page
        // 刷新 Completed 页面
        renderCompleted();

        // Refresh trash page
        // 刷新 Trash 页面
        renderTrash();

        // Refresh Today Dashboard
        // 刷新 Today 页面 Dashboard
        updateTodayDashboard();

        // Refresh tag filters
        // 刷新标签筛选器
        renderTagFilters();

        // Show completion message
        // 显示完成提示讯息
        showToast(
            "✨ You Did It!"
        );

        // Refresh calendar if Calendar page is open
        // 如果当前正在 Calendar 页面，则刷新日历
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

    // Stop executing remaining code
    // 停止执行后续代码
    return;

}

// =====================================
// UNCHECK TASK
// Move task back to active
//
// 取消完成任务
// 将任务恢复到 Active 状态
// =====================================

// Change task status back to active
// 将任务状态改回 active
task.status =
    "active";

// Save updated task to Flask backend
// 将更新后的任务保存到 Flask 后端
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

    // Refresh active task page
    // 刷新当前任务页面
    renderTasks(listType);

    // Refresh completed page
    // 刷新 Completed 页面
    renderCompleted();

    // Refresh trash page
    // 刷新 Trash 页面
    renderTrash();

    // Refresh Today Dashboard
    // 刷新 Today 页面 Dashboard
    updateTodayDashboard();

    // Refresh tag filters
    // 刷新标签筛选器
    renderTagFilters();

    // Refresh calendar if Calendar page is open
    // 如果当前正在 Calendar 页面，则刷新日历
    if (
        document.getElementById("calendar")
            .classList.contains("active")
    ) {

        generateCalendar();

    }

}

// =====================================
// COMPLETE TASK FROM CALENDAR MODAL
// Complete task directly from calendar
//
// 从 Calendar Modal 完成任务
// 直接在日历弹窗中完成任务
// =====================================

async function completeTask(
    listType,
    id
) {

    // Find selected task
    // 查找指定任务
    const task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop function if task does not exist
    // 如果任务不存在，则停止执行
    if (!task) return;

    // Update task status
    // 更新任务状态为 completed
    task.status =
        "completed";

    // Save completion timestamp
    // 保存任务完成时间
    task.completedDate =
        new Date().toISOString();

    // Save updated task to Flask backend
    // 将更新后的任务保存到 Flask 后端
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

    // Refresh active task page
    // 刷新当前任务页面
    renderTasks(listType);

    // Refresh Completed page
    // 刷新 Completed 页面
    renderCompleted();

    // Refresh Trash page
    // 刷新 Trash 页面
    renderTrash();

    // Refresh Today Dashboard
    // 刷新 Today 页面 Dashboard
    updateTodayDashboard();

    // Refresh tag filters
    // 刷新标签筛选器
    renderTagFilters();

    // Refresh calendar page
    // 刷新 Calendar 页面
    generateCalendar();

    // Show success message
    // 显示完成提示讯息
    showToast(
        "✨ You Did It!"
    );

}


// =====================================
// 6. TASK RENDERING
// Display tasks on the screen
//
// 任务渲染功能
// 负责将任务显示在页面上
// =====================================

// ===============================
// RENDER TASKS
// Display all active tasks
// for the selected category
//
// 渲染任务列表
// 显示所选分类中的所有进行中任务
// ===============================

function renderTasks(listType) {

    // Get task container
    // 获取任务列表容器
    let taskList =
        document.getElementById(
            listType + "TaskList"
        );

    // Get empty message element
    // 获取空状态提示元素
    let emptyMsg =
        document.getElementById(
            listType + "EmptyMsg"
        );

    // Stop if elements don't exist
    // 如果页面元素不存在则停止执行
    if (!taskList || !emptyMsg) return;

    // Clear existing tasks
    // 清空目前显示的任务
    taskList.innerHTML = "";

    // Get active tasks only
    // 只获取状态为 active 的任务
    let activeTasks =
        taskData[listType].filter(task => {

            // Skip non-active tasks
            // 跳过非 active 状态的任务
            if (task.status !== "active") {

                return false;

            }

            // Apply tag filter if selected
            // 如果有选择标签筛选，则过滤任务
            if (
                currentTagFilter !== "all" &&
                task.tag !== currentTagFilter
            ) {

                return false;

            }

            // Apply topbar search keyword if any
            // 如果顶部搜索框有关键字，则过滤任务
            if (
                currentSearchKeyword &&
                !task.text.toLowerCase().includes(currentSearchKeyword)
            ) {

                return false;

            }

            // Keep this task
            // 保留该任务
            return true;

        });

    // Show or hide empty message
    // 根据任务数量显示或隐藏空状态提示
    emptyMsg.style.display =
        activeTasks.length === 0
            ? "block"
            : "none";

    // Create task cards
    // 创建任务卡片
    activeTasks.forEach(task => {

        // Create task card element
        // 创建任务卡片元素
        const card =
            document.createElement("div");

        card.className = "task-card";

        // Store task ID
        // 储存任务 ID
        card.dataset.id = task.id;

        // Store task category
        // 储存任务分类
        card.dataset.list = listType;

        // Generate task card HTML
        // 生成任务卡片内容
        card.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                onchange="toggleComplete('${listType}', ${task.id}, this)"
            >

            <div class="task-info">

                <!-- Task title -->
                <!-- 任务标题 -->

                <div class="task-title">

                    ${task.text}

                </div>

                <div class="task-meta">

                    <!-- Task date -->
                    <!-- 任务日期 -->

                    <span class="task-date">

                        <span class="material-symbols-rounded">
                            calendar_month
                        </span>

                        ${task.date || "No Date"}

                    </span>

                    ${
                        task.startTime || task.endTime
                ? `
                        <!-- Task time -->
                        <!-- 任务时间 -->

                        <span class="task-time">

                            <span class="material-symbols-rounded">
                                schedule
                            </span>

                              ${
                                  task.startTime && task.endTime
                    ? `${task.startTime} - ${task.endTime}`
                    : task.startTime
                        ? task.startTime
                        : ""
                              }

                        </span>
                        `
                : ""
                    }

                    ${
                        task.priority
                ? `
                        <!-- Task priority -->
                        <!-- 任务优先级 -->

                        <span class="task-priority">

                            ${getPriorityDot(task.priority)}

                            ${
                                task.priority === "red"
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

            <!-- Task action buttons -->
            <!-- 任务操作按钮 -->

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

        // Add task card into container
        // 将任务卡片加入任务列表
        taskList.appendChild(card);

    });

    // Re-apply selected highlight if the detail panel
    // is currently open for a task in this list
    // 如果详情面板正为本列表中的任务打开，则重新应用高亮
    const detailPanel =
        document.getElementById(
            "taskDetailPanel"
        );

    if (
        detailPanel &&
        detailPanel.classList.contains("open") &&
        currentTaskListType === listType
    ) {

        highlightSelectedTaskCard();

    }

}

// ===============================
// RENDER COMPLETED TASKS
// Group completed tasks by category
//
// 渲染已完成任务
// 根据分类显示所有已完成任务
// ===============================

function renderCompleted() {

    // Get completed page container
    // 获取 Completed 页面容器
    let container =
        document.getElementById(
            "completedList"
        );

    // Clear previous content
    // 清空之前显示的内容
    container.innerHTML = "";

    // Track whether completed tasks exist
    // 记录是否存在已完成任务
    let hasCompleted = false;

    // Loop through all categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(listType => {

   // =====================================
   // CATEGORY FILTER
   // Show only selected category
   //
   // 分类筛选
   // 只显示所选分类
   // =====================================

    if (

    selectedCategoryFilter !==
    "all"

    &&

    listType !==
    selectedCategoryFilter

) {

    // Skip current category
    // 跳过当前分类
    return;

}

let completedTasks =
    taskData[listType].filter(
        task => {

            // Only show completed tasks
            // 只显示已完成任务
            if (
                task.status !==
                "completed"
            ) {

                return false;

            }

            // Apply topbar search keyword if any
            // 如果顶部搜索框有关键字，则过滤任务
            if (
                currentSearchKeyword &&
                !task.text.toLowerCase().includes(currentSearchKeyword)
            ) {

                return false;

            }

            // Skip date filter if All Dates selected
            // 如果选择 All Dates，则不过滤日期
            if (
                selectedDateFilter ===
                "all"
            ) {

                return true;

            }

            // Convert completion date into Date object
            // 将完成日期转换为 Date 对象
            const completedDate =
                new Date(
                    task.completedDate
                );

            // Get current date
            // 获取当前日期
            const today =
                new Date();

            // =====================================
            // TODAY
            // Show tasks completed today
            //
            // 今天完成的任务
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
            // Show tasks completed this week
            //
            // 本周完成的任务
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
            // Show tasks completed this month
            //
            // 本月完成的任务
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
            // Show tasks completed last week
            //
            // 上周完成的任务
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
            // Show tasks completed last month
            //
            // 上个月完成的任务
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
            //
            // 较早的任务
            // 超过 30 天前完成
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

        // Skip category if no completed tasks
        // 如果当前分类没有任务，则跳过
        if (completedTasks.length === 0) return;

        hasCompleted = true;

// Create category section
// 创建分类区域
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

    // Get task container inside category section
    // 获取当前分类的任务容器
    const taskContainer =
       section.querySelector(
           ".completed-group-list"
        );

        // Create completed task cards
        // 创建已完成任务卡片
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

            // Add card into category container
            // 将任务卡片加入分类容器
            taskContainer.appendChild(card);

        });

        // Add category section into page
        // 将分类区域加入页面
        container.appendChild(section);

    });

    // Show empty message
    // 如果没有任何已完成任务，则显示提示信息
    if (!hasCompleted) {

        container.innerHTML = `

    
        <div class="empty-box">

        No completed tasks

        </div>

    `;

    }

}

// ===============================
// RENDER TRASH TASKS
// Group trashed tasks by category
//
// 渲染垃圾桶任务
// 根据分类显示所有垃圾任务
// ===============================

function renderTrash() {

    // Get Trash page container
    // 获取 Trash 页面容器
    let container =
        document.getElementById(
            "trashList"
        );

    // Clear existing content
    // 清空之前显示的内容
    container.innerHTML = "";

    // Track whether Trash contains tasks
    // 记录垃圾桶中是否有任务
    let hasTrash = false;

    // Loop through all task categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(listType => {

        // Get tasks with status "trash"
        // 获取状态为 trash 的任务
        let trashTasks =
            taskData[listType].filter(
                task =>
                    task.status === "trash" &&
                    (
                        !currentSearchKeyword ||
                        task.text.toLowerCase().includes(currentSearchKeyword)
                    )
            );

        // Skip empty categories
        // 如果当前分类没有垃圾任务则跳过
        if (trashTasks.length === 0) return;

        hasTrash = true;

        // Create category section
        // 创建分类区域
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
        // 创建任务容器
        const taskContainer =
            document.createElement("div");

        // Render each trashed task
        // 渲染每一个垃圾任务
        trashTasks.forEach(task => {

            const card =
                document.createElement("div");

            card.className = "task-card";

            // Reduce opacity for trash items
            // 降低透明度以表示已删除状态
            card.style.opacity = "0.75";

            card.style.marginBottom = "8px";

            // Generate task card HTML
            // 生成任务卡片内容
            card.innerHTML = `

                <div class="task-info">

                    <div class="task-title">

                        ${task.text}

                    </div>

                    <div class="task-meta">

                        <!-- Date -->
                        <!-- 日期 -->

                        <span class="task-date">

                            <span class="material-symbols-rounded">
                                calendar_month
                            </span>

                            ${task.date || "No Date"}

                        </span>

                        <!-- Time -->
                        <!-- 时间 -->

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
                        <!-- 优先级 -->

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

                   <!-- Restore task button -->
                   <!-- 恢复任务按钮 -->

                   <button
                       class="task-action-btn"
                       onclick="restoreTask('${listType}', ${task.id})"
                       title="Restore Task"
                    >

                   <span class="material-symbols-rounded">
                       undo
                    </span>

                    </button>

                <!-- Permanently delete task button -->
                <!-- 永久删除任务按钮 -->

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

            // Add task card into container
            // 将任务卡片加入容器
            taskContainer.appendChild(card);

        });

        // Insert task cards into section
        // 将任务容器加入分类区域
        section.appendChild(
              taskContainer
);

        // Add section into page
        // 将分类区域加入页面
        container.appendChild(section);

    });

    // Show empty state
    // 如果垃圾桶为空则显示提示信息
    if (!hasTrash) {

        container.innerHTML = `

          <div class="empty-box">

             Trash is empty

          </div>
 
    `;

    }

}

// =====================================
// 7. TAG FILTER
// Handle task filtering by tags
//
// 标签筛选功能
// 根据标签筛选任务
// =====================================

// ===============================
// SET TAG FILTER
// Change current selected tag
//
// 设置标签筛选器
// 切换当前选中的标签
// ===============================

function setTagFilter(tag) {

    // Save selected tag
    // 保存当前选中的标签
    currentTagFilter = tag;

    // Refresh tag buttons
    // 刷新标签按钮状态
    renderTagFilters();

    // Refresh all task pages
    // 刷新所有任务页面
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
// RENDER TAG FILTERS
// Display all available tags
//
// 渲染标签筛选器
// 显示所有可用标签
// ===============================

function renderTagFilters() {

    // List of task categories
    // 所有任务分类
    const pages = [
        "work",
        "shopping",
        "study",
        "personal",
        "workout"
    ];

    // Loop through each category
    // 遍历每个分类
    pages.forEach(listType => {

        // Get tag filter container
        // 获取标签筛选容器
        const container =
            document.getElementById(
                listType + "TagFilter"
            );

        // Stop if container doesn't exist
        // 如果容器不存在则停止执行
        if (!container) return;

        // Clear existing tag buttons
        // 清空现有标签按钮
        container.innerHTML = "";

        // Create "All" button
        // 创建 All 按钮
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
        // 收集当前分类中的所有标签
        const tags = new Set();

        taskData[listType].forEach(task => {

            // Only collect non-empty tags
            // 只收集非空标签
            if (
                task.tag &&
                task.tag.trim()
            ) {

                tags.add(
                    task.tag.trim()
                );

            }

        });

        // Create tag filter buttons
        // 创建标签按钮
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


// =====================================
// 8.TAG SUGGESTIONS
// =====================================

// ===============================
// RENDER TAG SUGGESTIONS
// Display matching tag suggestions
//
// 渲染标签建议
// 显示符合输入内容的标签建议
// ===============================

function renderTagSuggestions(keyword) {

    // Get suggestion container
    // 获取标签建议容器
    const container =
        document.getElementById(
            "tagSuggestions"
        );

    // Stop if container doesn't exist
    // 如果容器不存在则停止执行
    if (!container) return;

    // Clear previous suggestions
    // 清空之前显示的建议
    container.innerHTML = "";

    // Remove spaces and convert to lowercase
    // 去除空格并转换成小写
    keyword =
        keyword
            .trim()
            .toLowerCase();

    // Hide suggestions if input is empty
    // 如果没有输入内容则隐藏建议框
    if (!keyword) {

        container.style.display =
            "none";

        return;

    }

    // Store matched tags without duplicates
    // 用于储存匹配到的标签（不重复）
    const tags =
        new Set();

    // Loop through all task categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(list => {

        // Loop through tasks in each category
        // 遍历当前分类中的所有任务
        taskData[list].forEach(task => {

            // Find matching tags
            // 查找符合关键字的标签
            if (
                task.tag &&
                task.tag.includes(keyword)
            ) {

                tags.add(task.tag);

            }

        });

    });

    // Hide suggestion box if no matches found
    // 如果没有匹配结果则隐藏建议框
    if (tags.size === 0) {

        container.style.display =
            "none";

        return;

    }

    // Create suggestion items
    // 创建标签建议项目
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

    // Show suggestion container
    // 显示标签建议框
    container.style.display =
        "block";

}

// ===============================
// SELECT POPUP TAG
// Select a tag from popup suggestions
//
// 选择弹窗标签
// 从弹窗建议中选择标签
// ===============================

function selectPopupTagSuggestion(tag) {

    // Insert selected tag into input field
    // 将选中的标签填入输入框
    document.getElementById(
        "taskTag"
    ).value = tag;

    // Hide popup suggestion list
    // 隐藏标签建议列表
    document.getElementById(
        "popupTagSuggestions"
    ).style.display = "none";

}

// ===============================
// SELECT TAG SUGGESTION
// Select a tag from panel suggestions
//
// 选择标签建议
// 从详情面板建议中选择标签
// ===============================

function selectTagSuggestion(tag) {

    // Insert selected tag into panel input field
    // 将选中的标签填入面板输入框
    document.getElementById(
        "panelTagInput"
    ).value = tag;

    // Hide suggestion list
    // 隐藏标签建议列表
    document.getElementById(
        "tagSuggestions"
    ).style.display = "none";

}

// ===============================
// POPUP TAG SUGGESTIONS
// Display matching tag suggestions
// in Add Task popup
//
// 弹窗标签建议
// 在新增任务弹窗中显示符合条件的标签建议
// ===============================

function renderPopupTagSuggestions(keyword) {

    // Get popup suggestion container
    // 获取弹窗标签建议容器
    const container =
        document.getElementById(
            "popupTagSuggestions"
        );

    // Clear previous suggestions
    // 清空之前的建议内容
    container.innerHTML = "";

    // Remove spaces and convert to lowercase
    // 去除空格并转换成小写
    keyword =
        keyword
            .trim()
            .toLowerCase();

    // Hide suggestion box if input is empty
    // 如果输入为空，则隐藏建议框
    if (!keyword) {

        container.style.display =
            "none";

        return;

    }

    // Store matching tags without duplicates
    // 用于储存符合条件的标签（不重复）
    const tags =
        new Set();

    // Loop through all task categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(list => {

        // Loop through tasks in current category
        // 遍历当前分类中的所有任务
        taskData[list].forEach(task => {

            // Find tags that start with the keyword
            // 查找以关键字开头的标签
            if (
                task.tag &&
                task.tag.startsWith(keyword)
            ) {

                tags.add(task.tag);

            }

        });

    });

    // Hide suggestion box if no matching tags found
    // 如果没有匹配结果，则隐藏建议框
    if (tags.size === 0) {

        container.style.display =
            "none";

        return;

    }

    // Create suggestion items
    // 创建标签建议项目
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

    // Show suggestion box
    // 显示标签建议框
    container.style.display =
        "block";

}


// =====================================
// 9.CALENDAR POPUP
// =====================================

// ===============================
// TOGGLE CALENDAR POPUP
// Show or hide date popup
//
// 切换日历弹窗
// 显示或隐藏日期弹窗
// ===============================

function toggleCalendar(btn, e) {

    // Prevent event bubbling
    // 防止事件冒泡
    if (e) e.stopPropagation();

    // Get calendar popup element
    // 获取日历弹窗元素
    const popup =
        document.getElementById(
            "calendarPopup"
        );

    // Stop if popup doesn't exist
    // 如果弹窗不存在则停止执行
    if (!popup) return;

    // Hide popup if already open
    // 如果弹窗已经打开，则关闭它
    if (
        popup.style.display === "block"
    ) {

        popup.style.display = "none";

        return;

    }

    // Show popup
    // 显示弹窗
    popup.style.display = "block";

   // Get button position
   // 获取按钮的位置
    const rect =
      btn.getBoundingClientRect();

    // Calendar popup width
    // 日历弹窗宽度
    const popupWidth = 420;

    // Add current page scroll position
    // 加上当前页面滚动距离
    let left =
       rect.right
       - popupWidth
       + window.scrollX;

    let top =
        rect.bottom
        + 12
        + window.scrollY;

    // Prevent popup from going outside screen
    // 防止弹窗超出页面左边界
    if (left < 10) {

        left = 10;

    }

    // Set popup position
    // 设置弹窗位置
    popup.style.left =
        left + "px";

    popup.style.top =
        top + "px";

}


// ===============================
// CLOSE CALENDAR POPUP
// Hide calendar popup
//
// 关闭日历弹窗
// 隐藏日期弹窗
// ===============================

function closeCalendar() {

    // Get calendar popup element
    // 获取日历弹窗元素
    const popup =
        document.getElementById(
            "calendarPopup"
        );

    // Hide popup if it exists
    // 如果弹窗存在，则隐藏它
    if (popup) {

        popup.style.display =
            "none";

    }

}

// ===============================
// APPLY DATE SETTINGS
// Save selected task options
//
// 应用日期设置
// 保存用户选择的任务选项
// ===============================

function applyDate() {

    // Get date input element
    // 获取日期输入框
    let dateInput =
        document.getElementById(
            "popupDate"
        );

    // Get start time input element
    // 获取开始时间输入框
    let startInput =
        document.getElementById(
            "startTime"
        );

    // Get end time input element
    // 获取结束时间输入框
    let endInput =
        document.getElementById(
            "endTime"
        );

    // Get repeat option input element
    // 获取重复选项输入框
    let repeatInput =
        document.getElementById(
            "repeat"
        );

    // Save selected date
    // 保存用户选择的日期
    selectedDate =
        dateInput
            ? dateInput.value
            : "";

    // Save selected start time
    // 保存用户选择的开始时间
    selectedStart =
        startInput
            ? startInput.value
            : "";

    // Save selected end time
    // 保存用户选择的结束时间
    selectedEnd =
        endInput
            ? endInput.value
            : "";

    // Save selected repeat option
    // 保存用户选择的重复设置
    selectedRepeat =
        repeatInput
            ? repeatInput.value
            : "";

    // Close calendar popup
    // 关闭日历弹窗
    closeCalendar();

}


// =====================================
// 10. PRIORITY
// Handle task priority settings
//
// 优先级功能
// 用于设置和显示任务优先级
// =====================================

// ===============================
// SET PRIORITY
// Highlight selected priority
//
// 设置优先级
// 高亮当前选中的优先级
// ===============================

function setPriority(priority, e) {

    // Save selected priority
    // 保存当前选中的优先级
    selectedPriority = priority;

    // Remove highlight from all priority buttons
    // 移除所有优先级按钮的选中状态
    document
        .querySelectorAll(
            ".priority-box > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

        });

    // Highlight selected priority button
    // 高亮当前点击的优先级按钮
    if (e) {

        e.currentTarget.classList.add(
            "priority-selected"
        );

    }

}

// ===============================
// SET PANEL PRIORITY
// Highlight selected priority
// in task detail panel
//
// 设置详情面板优先级
// 高亮任务详情面板中的优先级
// ===============================

function setPanelPriority(priority, e) {

    // Save selected priority
    // 保存当前选中的优先级
    panelSelectedPriority = priority;

    // Remove highlight from all priority buttons
    // 移除所有优先级按钮的选中状态
    document
        .querySelectorAll(
            "#panelPriorityBox > span"
        )
        .forEach(el => {

            el.classList.remove(
                "priority-selected"
            );

        });

    // Highlight selected priority button
    // 高亮当前点击的优先级按钮
    e.currentTarget.classList.add(
        "priority-selected"
    );

}

// ===============================
// GET PRIORITY FLAG ICON
// Return colored Material Symbol
//
// 获取优先级图标
// 根据优先级返回对应颜色的旗子图标
// ===============================

function getPriorityDot(priority) {

    // High priority (Red)
    // 高优先级（红色）
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

    // Medium priority (Orange)
    // 中优先级（橙色）
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

    // Low priority (Blue)
    // 低优先级（蓝色）
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

    // No priority (Gray)
    // 无优先级（灰色）
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

    // Return empty if no priority exists
    // 如果没有优先级则返回空值
    return "";

}


// ===============================
// 11.TASK DETAIL PANEL
//    Manage task editing panel
// ===============================

// ===============================
// DETACH PANEL FROM BODY
// Re-parent the panel to <html> so it
// stays fixed to the viewport even though
// the shared page-load animation leaves a
// lingering transform on <body> (a CSS
// transform on an ancestor turns "position:
// fixed" descendants into page-relative
// elements instead of viewport-relative ones)
//
// 将面板移出 body
// 由于共享的页面加载动画会在 body 上
// 留下持续的 transform（祖先元素的
// transform 会让 "position:fixed" 的
// 子元素相对于页面而非视口定位），
// 因此将面板重新挂载到 <html> 下，
// 以确保它始终固定于可视窗口
// ===============================

(function () {

    const panel =
        document.getElementById(
            "taskDetailPanel"
        );

    if (panel) {

        document.documentElement.appendChild(
            panel
        );

    }

})();

// ===============================
// SHOW TASK DETAIL PANEL
// Display task information
// inside editable side panel
//
// 显示任务详情面板
// 在可编辑侧边栏中显示任务信息
// ===============================

function showTaskDetail(
    listType,
    id
) {

    // Save current task category
    // 保存当前任务分类
    currentTaskListType =
        listType;

    // Save current task ID
    // 保存当前任务 ID
    currentTaskId =
        id;

    // Find selected task
    // 查找选中的任务
    let task =
        taskData[listType].find(
            t => t.id === id
        );

    // Stop if task doesn't exist
    // 如果任务不存在则停止执行
    if (!task) return;

    // Fill editable fields
    // 将任务资料填入编辑栏

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

    // Load saved priority
    // 加载已保存的优先级
    panelSelectedPriority =
        task.priority || "";

    // Highlight selected priority button
    // 高亮当前任务的优先级按钮
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

    // Load task tag
    // 加载任务标签
    document.getElementById(
        "panelTagInput"
    ).value =
        task.tag || "";

    // Show detail panel
    // 显示任务详情面板
    const panel =
        document.getElementById(
            "taskDetailPanel"
        );

    panel.classList.add(
        "open"
    );

    // Highlight the matching task card
    // 高亮对应的任务卡片
    highlightSelectedTaskCard();

}

// ===============================
// HIGHLIGHT SELECTED TASK CARD
// Mark the card matching the task
// currently open in the detail panel
//
// 高亮选中的任务卡片
// 标记当前在详情面板中打开的任务
// ===============================

function highlightSelectedTaskCard() {

    // Clear any previous highlight
    // 清除之前的高亮
    document
        .querySelectorAll(
            ".task-card.selected"
        )
        .forEach(el => {

            el.classList.remove(
                "selected"
            );

        });

    // Find and highlight the current task's card
    // 查找并高亮当前任务的卡片
    const card =
        document.querySelector(
            `.task-card[data-list="${currentTaskListType}"][data-id="${currentTaskId}"]`
        );

    if (card) {

        card.classList.add(
            "selected"
        );

    }

}

// ===============================
// SAVE TASK CHANGES
// Save edited task information
//
// 保存任务修改
// 保存用户编辑后的任务资料
// ===============================

async function saveTaskChanges() {

    // Find current task
    // 查找当前任务
    let task =
        taskData[currentTaskListType]
            .find(
                t => t.id === currentTaskId
            );

    // Stop if task doesn't exist
    // 如果任务不存在则停止执行
    if (!task) return;

    // Update task data
    // 更新任务资料
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

    // Save updated task to Flask backend
    // 将更新后的任务保存到 Flask 后端
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

    // Convert server response to JSON
    // 将服务器响应转换为 JSON 格式
const result =
    await response.json();

    // Display error message if save fails
    // 如果保存失败则显示错误信息
if (!result.success) {

    showReminderPopup({
        title: "Save Failed",
        message: "Failed to save task.",
        confirmText: "OK"
    });

    return;

}

    // Refresh active task page
    // 刷新当前任务页面
    renderTasks(
        currentTaskListType
    );

    // Refresh tag filters
    // 刷新标签筛选器
    renderTagFilters();

    // Refresh Completed page
    // 刷新 Completed 页面
    renderCompleted();

    // Refresh Trash page
    // 刷新 Trash 页面
    renderTrash();

    // Refresh Today Dashboard
    // 刷新 Today Dashboard
    updateTodayDashboard();

    // Refresh calendar if Calendar page is open
    // 如果当前正在 Calendar 页面，则刷新日历
    if (
        document.getElementById(
            "calendar"
        ).classList.contains(
            "active"
        )
    ) {

        generateCalendar();

    }

    // Close detail panel
    // 关闭任务详情面板
    closeDetailPanel();

    // Display success message
    // 显示保存成功提示
    showReminderPopup({
        title: "Saved",
        message: "✅ Changes saved successfully!",
        confirmText: "OK"
    });

}

// ===============================
// CLOSE TASK DETAIL PANEL
// Hide side panel smoothly
//
// 关闭任务详情面板
// 平滑隐藏侧边栏面板
// ===============================

function closeDetailPanel() {

    // Get task detail panel element
    // 获取任务详情面板元素
    const panel =
        document.getElementById(
            "taskDetailPanel"
        );

    // Stop if panel doesn't exist
    // 如果面板不存在则停止执行
    if (!panel) return;

    // Slide panel out to the right
    // 将面板向右滑出画面
    panel.classList.remove(
        "open"
    );

    // Clear the selected card highlight
    // 清除任务卡片的高亮
    document
        .querySelectorAll(
            ".task-card.selected"
        )
        .forEach(el => {

            el.classList.remove(
                "selected"
            );

        });

}

// =====================================
// 12. UTILITIES
// Utility helper functions
//
// 工具函数
// 提供辅助功能
// =====================================

// ===============================
// GET PRIORITY COLOR
// Return color for calendar badges
//
// 获取优先级颜色
// 为日历徽章返回对应颜色
// ===============================

function getPriorityColor(priority) {

    // High priority color (Red)
    // 高优先级颜色（红色）
    if (priority === "red") {

        return "#ef4444";

    }

    // Medium priority color (Orange)
    // 中优先级颜色（橙色）
    if (priority === "orange") {

        return "#f59e0b";

    }

    // Low priority color (Blue)
    // 低优先级颜色（蓝色）
    if (priority === "blue") {

        return "#3b82f6";

    }

    // Default color (Gray)
    // 默认颜色（灰色）
    return "#6b7280";

}

// =====================================
// SHOW TOAST MESSAGE
// Display a temporary notification
// on the top-right corner
//
// 显示 Toast 提示讯息
// 在页面右上角显示临时通知
//
// Features:
// 1. Show custom message
// 2. Smooth fade-in animation
// 3. Auto hide after 2 seconds
//
// 功能：
// 1. 显示自定义讯息
// 2. 平滑淡入动画
// 3. 2 秒后自动隐藏
// =====================================

function showToast(message){

    // Get toast element
    // 获取 Toast 元素
    const toast =
        document.getElementById(
            "toast"
        );

    // Update toast text
    // 更新提示讯息内容
    toast.textContent =
        message;

    // Show toast animation
    // 显示 Toast 动画
    toast.classList.add(
        "show"
    );

    // Auto hide after 2 seconds
    // 3 秒后自动隐藏 Toast
    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}



// =====================================
// 13. INITIALIZATION
// Initialize application when page loads
//
// 初始化程序
// 页面加载时初始化所有功能
// =====================================

// ===============================
// ENTER KEY SUPPORT
// Press Enter to add a task
//
// Enter 键支持
// 按下 Enter 键快速新增任务
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Loop through all task categories
        // 遍历所有任务分类
        [
            "work",
            "shopping",
            "study",
            "personal",
            "workout"
        ].forEach(list => {

            // Get task input field
            // 获取任务输入框
            let input =
                document.getElementById(
                    list + "TaskText"
                );

            // Add keyboard event if input exists
            // 如果输入框存在，则绑定键盘事件
            if (input) {

                input.addEventListener(
                    "keypress",
                    function (e) {

                        // Add task when Enter is pressed
                        // 按下 Enter 时新增任务
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
// LOAD SAVED TASKS
// Restore tasks when page loads
//
// 加载已保存任务
// 页面加载时恢复所有任务数据
// ===============================

document.addEventListener(
    "DOMContentLoaded",

    async () => {

        // Load task data from Flask backend
        // 从 Flask 后端加载任务数据
        await loadTasks();

        // Render all task categories
        // 渲染所有任务分类页面
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
        // 刷新 Completed 页面
        renderCompleted();

        // Refresh Trash page
        // 刷新 Trash 页面
        renderTrash();

        // Refresh Today dashboard
        // 刷新 Today Dashboard 页面
        updateTodayDashboard();

        // Refresh Tag filters
        // 刷新标签筛选器
        renderTagFilters();


// =====================================
// COMPLETED PAGE FILTER EVENTS
// Listen for filter changes
//
// Completed 页面筛选事件
// 监听筛选器变化
// =====================================

const dateFilter =
    document.getElementById(
        "dateFilter"
    );

// Add date filter event if element exists
// 如果日期筛选器存在，则绑定 change 事件
if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        e => {

            // Save selected date filter
            // 保存用户选择的日期筛选条件
            selectedDateFilter =
                e.target.value;

            // Refresh Completed page
            // 刷新 Completed 页面
            renderCompleted();

        }
    );

}

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

// Add category filter event if element exists
// 如果分类筛选器存在，则绑定 change 事件
if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        e => {

            // Save selected category filter
            // 保存用户选择的分类筛选条件
            selectedCategoryFilter =
                e.target.value;

            // Refresh Completed page
            // 刷新 Completed 页面
            renderCompleted();

        }
    );

}

        // Get tag input field
        // 获取标签输入框
        const tagInput =
            document.getElementById(
                "panelTagInput"
            );

        // Enable tag suggestions if input exists
        // 如果输入框存在，则启用标签建议功能
        if (tagInput) {

            tagInput.addEventListener(
                "input",

                function () {

                    // Display matching tag suggestions
                    // 显示符合条件的标签建议
                    renderTagSuggestions(
                        this.value
                    );

                }

            );

        }

        // Open a specific page on load if requested via URL
        // 如果 URL 中指定了页面参数，则加载后直接跳转到该页面
        const requestedView =
            new URLSearchParams(window.location.search).get("view");

        if (requestedView === "calendar") {

            const calendarMenuItem =
                document.querySelector(
                    ".menu-item[onclick*=\"showPage('calendar'\"]"
                );

            showPage("calendar", calendarMenuItem);

        }

    }

);



























