// =====================================
// LOCAL DATE STRING
// Build a YYYY-MM-DD string from local
// date parts (not UTC), so it matches
// the date stored by the <input type="date">
// picker used when creating tasks
//
// 使用本地日期（而非 UTC）拼接 YYYY-MM-DD 字符串，
// 与新增任务时日期选择器保存的日期格式保持一致
// =====================================

function getLocalDateString(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}

// =====================================
// 1. TODAY DATE
// Display current date on Today page
//
// 在 Today 页面显示当前日期
// =====================================

function loadTodayDate() {

    // Get current date and time
    // 获取当前日期和时间
    const now = new Date();

    // Set date display format
    // 设置日期显示格式
    const options = {

        weekday: "long", // Day of the week (e.g. Monday)
                           // 星期几（例如 Monday）

        year: "numeric", // Full year (e.g. 2026)
                           // 完整年份（例如 2026）

        month: "long",   // Full month name (e.g. June)
                           // 完整月份名称（例如 June）

        day: "numeric"   // Day number (e.g. 30)
                           // 日期数字（例如 30）

    };

    // Display formatted date on Today page
    // 在 Today 页面显示格式化后的日期
    document.getElementById("date").textContent =
    now.toLocaleDateString(
        "en-GB",
        options
    );

}

// =====================================
// 2. DAILY QUOTE SECTION
//    Display motivational quote
//
//    显示每日励志语录
// =====================================

function loadDailyQuote() {

    // List of available motivational quotes
    // 可供显示的励志语录列表
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
    // 获取今天是这个月的第几天
    const today = new Date().getDate();

    // Select a quote based on today's date
    // 根据今天的日期选择语录
    const selectedQuote =
        quotes[today % quotes.length];

    // Display the selected quote on the page
    // 在页面上显示选中的语录
    document.getElementById("dailyQuote")
        .textContent = selectedQuote;

}

// =====================================
// 3. PROGRESS OVERVIEW SECTION
//    Calculate today's task completion
//    Update:
//    1. Progress percentage
//    2. Progress bar width
//    3. Completed task count
//    4. Total task count
//    5. Motivation badge
//
//    更新：
//    1. 完成百分比
//    2. 进度圆环
//    3. 统计卡片
//    4. 逾期任务数量
//    5. 激励讯息
// =====================================

function updateProgress() {

    // Get today's date
    // 获取今天日期
    const today =
        getLocalDateString(new Date());

    // Total tasks scheduled for today
    // 今天的任务总数
    let totalTasks = 0;

    // Completed tasks scheduled for today
    // 今天已完成的任务数
    let completedTasks = 0;

    // Overdue tasks
    // 超期任务数
    let overdueTasks = 0;

    // Loop through all task categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(list => {

        // Loop through tasks in each category
        // 遍历每个分类中的任务
        taskData[list].forEach(task => {

            // Count only today's tasks
            // 只统计今天且未删除的任务
            if (
                task.date === today &&
                task.status !== "trash"
            ) {

                // Increase total task count
                // 增加任务总数
                totalTasks++;

                // Count completed tasks
                // 统计已完成的任务
                if (task.status === "completed") {

                    completedTasks++;

                }

                // Count overdue tasks
                // 统计超期任务
                if (
                    task.status === "active" &&
                    task.startTime
                ) {

                    // Get current time
                    // 获取当前时间                    
                    const now =
                        new Date();

                    // Get task due time
                    // 获取任务开始时间
                    const due =
                        new Date(
                            `${today}T${task.startTime}`
                        );

                    // Check whether task is overdue
                    // 检查任务是否已逾期
                    if (due < now) {

                        overdueTasks++;

                    }

                }

            }

        });

    });

    // Calculate completion percentage
    // 计算完成百分比
    const progress =
        totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks / totalTasks) * 100
        );

    // Update progress percentage
    // 更新进度百分比
    document.getElementById(
        "progressPercent"
    ).textContent =
        progress + "%";


// =====================================
// Update Progress Ring
//
// 更新进度圆环
// =====================================

// Get current theme colors
// 获取当前主题主颜色
const primaryColor =
    getComputedStyle(
        document.documentElement
    ).getPropertyValue(
        '--primary'
    );

// Get current theme border color
// 获取当前主题边框颜色    
const borderColor =
    getComputedStyle(
        document.documentElement
    ).getPropertyValue(
        '--primary-border'
    );

// Convert percentage into degrees
// 将百分比转换成角度
const angle =
    progress * 3.6;

// Update progress ring appearance
// 更新进度圆环颜色
document.getElementById(
    "progressCircle"
).style.background =

`
    conic-gradient(
        ${primaryColor} ${angle}deg,
        ${borderColor} ${angle}deg
    )
`;

    // Update statistics cards
    // 更新统计卡片
    document.getElementById(
        "totalStat"
    ).textContent =
        totalTasks;

    document.getElementById(
        "completedStat"
    ).textContent =
        completedTasks;

    document.getElementById(
        "remainingStat"
    ).textContent =
        totalTasks - completedTasks;

    document.getElementById(
        "overdueStat"
    ).textContent =
        overdueTasks;

    // Get motivation badge element
    // 获取激励标签元素
    const badge =
        document.getElementById(
            "progressBadge"
        );

    // Display motivational message
    // 根据完成进度显示激励讯息
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
// 4. TODAY TASKS SECTION
// Display all active tasks
// scheduled for today's date
// 显示今天所有进行中的任务
//
// Features:
// 1. Show all today's tasks
// 2. Display priority flag
// 3. Display task category
// 4. Display remaining time
// 5. Show overdue status
//
// 功能：
// 1. 显示今天所有任务
// 2. 显示优先级标记
// 3. 显示任务分类
// 4. 显示剩余时间
// 5. 显示逾期状态
// =====================================

function renderTodayTasks() {

    // Get Today task container
    // 获取 Today 页面任务容器
    const container =
        document.getElementById(
            "todayTasks"
        );

    // Clear previous content
    // 清空之前显示的任务内容
    container.innerHTML = "";

    // Get today's date in YYYY-MM-DD format
    // 获取今天的日期（YYYY-MM-DD 格式）
    const today =
        getLocalDateString(new Date());

    // Store today's active tasks
    // 用来存放今天所有进行中的任务
    let todayTasks = [];

    // =====================================
    // COLLECT TODAY'S TASKS
    // Loop through all categories
    // and collect active tasks
    // scheduled for today
    //
    // 收集今天的任务
    // 遍历所有任务分类，
    // 收集今天且状态为 active 的任务
    // =====================================

    Object.keys(taskData).forEach(list => {

        // Loop through tasks in current category
        // 遍历当前分类中的所有任务
        taskData[list].forEach(task => {

            // Check whether task is active
            // and scheduled for today
            // 检查任务是否为进行中且日期为今天
            if (

                task.status === "active" &&

                task.date === today &&

                (
                    !currentSearchKeyword ||
                    task.text.toLowerCase().includes(currentSearchKeyword)
                )

            ) {

                // Save task together with its category
                // 保存任务，并记录所属分类
                todayTasks.push({

                    ...task,

                    category: list

                });

            }

        });

    });

    // =====================================
    // SORT TASKS BY START TIME
    // Earlier tasks appear first
    //
    // 按开始时间排序任务
    // 较早的任务会先显示
    // =====================================

    todayTasks.sort((a, b) => {

        // Compare task start times
        // If a task has no start time,
        // assign "99:99" so it appears last
        //
        // 比较任务开始时间
        // 如果任务没有开始时间，
        // 则使用 "99:99"，让它排在最后
        return (
            a.startTime || "99:99"
        ).localeCompare(
            b.startTime || "99:99"
        );

    });


    // =====================================
    // UPDATE DASHBOARD EVENT COUNTER
    // Display today's total task count
    //
    // 更新 Dashboard 事件计数器
    // 显示今天的任务总数
    // =====================================

    // Get Dashboard event counter element
    // 获取 Dashboard 事件计数元素
    const eventBox =
        document.getElementById(
             "dashboardEventCount"
       );

    // Check if the counter exists
    // 检查计数器是否存在
    if (eventBox) {

        // Display today's task count
        // 显示今天的任务数量
        eventBox.innerHTML =
           `☰ ${todayTasks.length} Events Today`;

    }

    // =====================================
    // SHOW EMPTY STATE
    // No tasks scheduled today
    //
    // 显示空状态
    // 当今天没有任务时显示提示讯息
    // =====================================

    // Check whether there are no tasks for today
    // 检查今天是否没有任务
    if (todayTasks.length === 0) {

        // Display empty message
        // 显示没有任务的提示信息
        container.innerHTML = `

            <div class="empty">

                No tasks for today

            </div>

        `;

        // Stop further execution
        // 停止继续执行后续代码
        return;

    }


// =====================================
// RENDER TIMELINE TASK
// Display today's tasks in timeline format
//
// 以时间轴方式显示今天的任务
// =====================================

todayTasks.forEach(task => {

    // Store due status text
    // 用于储存任务状态文字
    let dueText = "";

    // Check whether task has a start time
    // 检查任务是否设置了开始时间
    if (task.startTime) {

        // Get current time
        // 获取当前时间
        const now =
            new Date();

        // Create task due time object
        // 创建任务时间对象
        const due =
            new Date(
                `${today}T${task.startTime}`
            );

        // Calculate time difference
        // 计算剩余时间
        const diff =
            due - now;

        // Check if task time has not passed
        // 检查任务时间是否还未到
        if (diff > 0) {

            // Calculate remaining hours
            // 计算剩余小时数
            const hours =
                Math.floor(
                    diff / 3600000
                );

            // Calculate remaining minutes
            // 计算剩余分钟数
            const minutes =
                Math.floor(
                    (diff % 3600000)
                    / 60000
                );

            // Display remaining time
            // 显示剩余时间
            dueText =
                `Due in ${hours}h ${minutes}m`;

        }

        else {

            // Task time has passed
            // 任务已经逾期
            dueText =
                "Overdue";

        }

    }

    // Add task into timeline container
    // 将任务加入时间轴容器
    container.innerHTML += `

<div class="today-timeline-item">

    <!-- Timeline decoration -->
    <!-- 时间轴装饰 -->

    <div class="timeline-left">

        <div class="timeline-dot"></div>

        <div class="timeline-line"></div>

    </div>

    <!-- Task content -->
    <!-- 任务内容 -->

    <div class="timeline-right">

        <!-- Task start time -->
        <!-- 任务开始时间 -->

        <div class="today-time">

            ${task.startTime || "--:--"}

        </div>

        <!-- Task title -->
        <!-- 任务标题 -->

        <div class="timeline-task-title">

            ${task.text}

        </div>

        <!-- Task additional information -->
        <!-- 任务附加信息 -->

        <div class="today-info">

            <!-- Task category -->
            <!-- 任务分类 -->

            <span class="today-category-badge">

                ${
                    task.category
                        .charAt(0)
                        .toUpperCase()
                    +
                    task.category
                        .slice(1)
                }

            </span>

            <!-- Due status -->
            <!-- 剩余时间或逾期状态 -->

            <span class="today-due-text">

                • ${dueText}

            </span>

        </div>

    </div>

</div>

`;

});

}


// =====================================
// 5. TODAY DASHBOARD CONTROLLER
// Refresh all Today page components
//
// Components:
// 1. Today's Tasks
// 2. Progress Overview
//
// 更新 Today 页面所有组件
//
// 组件：
// 1. 今日任务列表
// 2. 进度概览
// =====================================

function updateTodayDashboard() {

    // Render today's task timeline
    // 显示今天的任务时间轴
    renderTodayTasks();

    // Update progress section
    // 更新进度概览区域
    updateProgress();

}

// =====================================
// INITIALIZE TODAY PAGE
// Run when page is fully loaded
//
// 初始化 Today 页面
// 当页面完全加载后执行
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Display current date
        // 显示当前日期
        loadTodayDate();

        // Display daily motivational quote
        // 显示每日励志语录
        loadDailyQuote();

        // Load and refresh Today dashboard
        // 加载并刷新 Today 页面数据
        updateTodayDashboard();

        // Keep due-in/overdue countdowns live while the page
        // stays open, instead of only updating on task actions
        // or page navigation
        // 页面停留期间也定时刷新倒计时/逾期状态，
        // 而不是只在任务操作或切换页面时才更新
        setInterval(
            updateTodayDashboard,
            60000
        );

    }
);