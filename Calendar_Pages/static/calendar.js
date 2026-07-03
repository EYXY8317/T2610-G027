// ==================================================
// CALENDAR SYSTEM
// ==================================================
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let currentView = "month";

// ==================================================
// GENERATE MONTH VIEW WITH TASK BADGES
// 生成月历视图并显示任务数量
// ==================================================
function generateCalendar() {

    // Get calendar container and title element
    // 获取日历容器和月份标题元素
    const calendar = document.getElementById("calendarDays");

    const title = document.getElementById("monthTitle");

    // Stop if elements do not exist
    // 如果找不到元素则停止执行
    if (!calendar || !title) return;

    // Clear old calendar
    // 清空旧日历内容
    calendar.innerHTML = "";

    // Month names for display
    // 月份名称
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    // Display current month and year
    // 显示当前月份和年份
    title.innerText = monthNames[currentMonth] + " " + currentYear;


    // Get first weekday of current month
    // 获取当前月份第一天是星期几
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Get total days in current month
    // 获取当前月份总天数
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty cells
    // 创建空白格子对齐第一天
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        calendar.appendChild(empty);
    }

    // ==================================================
    // GENERATE DAYS
    // 生成所有日期
    // ==================================================
    for (let day = 1; day <= totalDays; day++) {

        // Create day cell
        // 创建日期格子
        const dayEl = document.createElement("div");
        dayEl.classList.add("day");

        // Create date number
        // 创建日期数字
        const dateEl = document.createElement("div");
        dateEl.classList.add("date");
        dateEl.textContent = day;
        dayEl.appendChild(dateEl);

        // Create date string (YYYY-MM-DD)
        // 创建日期字符串
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Highlight today
        const now = new Date();
        if (day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
            dayEl.classList.add("today");
        }

        // Count tasks
        // 统计当天任务数量
        let taskCount = 0;
        Object.keys(taskData).forEach(list => {
            taskCount += taskData[list].filter(t => t.status === "active" && t.date === dateStr).length;
        });

        
// =====================================
// TASK NOTIFICATION BADGE
// Display notification icon and
// number of tasks for the day
// 任务提醒徽章
// 显示当天任务数量提醒
// =====================================

if (taskCount > 0) {

    // Create notification badge
    // 创建通知徽章
    const badge =
        document.createElement("div");

    // Add badge style class
    // 添加徽章样式   
    badge.className =
        "task-badge";

    // Display notification icon
    // and task count
    // 显示通知图标和任务数量    
    badge.innerHTML = `
        <span
            class="material-symbols-rounded"
        >
            notifications
        </span>

        
        ${
            taskCount > 9
            ? "9+"         // Show 9+ if task count exceeds 9
                           // 如果任务超过9个则显示 9+
            : taskCount    // Otherwise display actual count
                           // 否则显示实际数量
        }
    `;

    // Add badge to the day cell
    // 将徽章加入日期格子
    dayEl.appendChild(
        badge
    );

}

// =====================================
// DAY CELL CLICK EVENT
// Open task modal for selected day
//
// 日期点击事件
// 点击日期后打开任务弹窗
// =====================================

        // Change cursor to pointer
        // 鼠标移到日期上显示可点击效果
        dayEl.style.cursor = "pointer";

        // Open modal when day is clicked
        // 点击日期时显示当天任务
        dayEl.addEventListener("click", () => showDayTasks(dateStr));

        // Add day cell into calendar
        // 将日期格子加入日历
        calendar.appendChild(dayEl);
    }
}



// ==================================================
// DAY TASKS MODAL
// Display all active tasks for selected date
// 显示指定日期的所有进行中任务
// ==================================================

function showDayTasks(dateStr) {

    // Convert date string into Date object
    // 将日期字符串转换为 Date 对象
    const date =
        new Date(dateStr);

    // Format date for modal title
    // 格式化日期，显示在弹窗标题
    const displayDate =
    `${date.getDate()} ${
        date.toLocaleString(
            "en-US",
            { month: "long" }
        )
    } ${
        date.getFullYear()
    }`;

    // Modal HTML start
    // 开始建立弹窗 HTML 内容
    let html = `

    <div class="calendar-modal-header">

        <h2>

            ${displayDate}

        </h2>

        <button
            class="calendar-close-icon"
            onclick="closeDayModal()"
        >

            ✕

        </button>

    </div>

    <div class="calendar-modal-content">

    `;

    // Track whether tasks exist
    // 记录该日期是否有任务
    let hasTasks = false;

    // Loop through all task categories
    // 遍历所有任务分类
    Object.keys(taskData).forEach(list => {

        // Get active tasks for selected date
        // 获取该分类中指定日期且状态为 active 的任务
        const tasks =
            taskData[list].filter(
                t =>
                    t.status === "active" &&
                    t.date === dateStr
            );

        // Loop through each task
        // 遍历每一个任务
        tasks.forEach(task => {

            hasTasks = true;

            // Get priority border color
            // 根据优先级获取边框颜色
            const color =
                getPriorityColor(
                    task.priority
                );

            html += `

            <div
                class="calendar-task-card"
                style="
                    border-left:4px solid ${color};
                "
            >

                <!-- LEFT CONTENT -->
                <!-- 左边任务内容 -->

                <div class="calendar-task-content">

                    <!-- Task Category -->
                    <!-- 显示任务分类 -->

                    <div
                        class="calendar-task-category"
                    >

                        ${
                            list.charAt(0)
                                .toUpperCase()
                            +
                            list.slice(1)
                        }

                    </div>

                    <!-- Task Title -->
                    <!-- 显示任务标题 -->

                    <div
                        class="calendar-task-title"
                    >

                        ${task.text}

                    </div>

                    <!-- Task Information -->
                    <!-- 显示任务时间和优先级 -->

                    <div
                        class="calendar-task-meta"
                    >

                        <div>

                            🕒

                            ${
                                task.startTime &&
                                task.endTime

                                ? `${task.startTime}
                                   - ${task.endTime}`

                                : task.startTime

                                ? task.startTime

                                : "No Time"
                            }

                        </div>

                        <div
                            class="
                            task-priority
                            priority-${task.priority}
                            "
                        >
                            <span
                                class="
                                material-symbols-rounded
                  "
                            >
                              flag
                            </span>

                            ${
                               task.priority === "red"

                               ? "High"

                               : task.priority === "orange"

                               ? "Medium"

                               : task.priority === "blue"

                               ? "Low"

                               : "No Priority"
                             }

                        </div>

                    </div>

                </div>

                <!-- RIGHT BUTTONS -->
                <!-- 右边操作按钮 -->

                <div
                    class="calendar-task-actions"
                >

                    <button
                        class="
                        calendar-complete-btn
                        "
                        onclick="
                            completeTask(
                                '${list}',
                                ${task.id}
                            );
                            closeDayModal();
                        "
                    >

                        <span
                            class="
                            material-symbols-rounded
                            "
                        >
                            task_alt
                        </span>

                        Complete

                    </button>

                    <button
                        class="
                        calendar-delete-btn
                        "
                        onclick="
                            deleteTask(
                                '${list}',
                                ${task.id}
                            );
                            closeDayModal();
                        "
                    >

                        <span
                            class="
                            material-symbols-rounded
                            "
                        >
                            delete
                        </span>

                        Delete

                    </button>

                </div>

            </div>

            `;

        });

    });

    // Display message if no tasks found
    // 如果该日期没有任务，显示提示信息
    if (!hasTasks) {

        html += `

        <p
            style="
                text-align:center;
                color:#8a8aa3;
                padding:30px 0;
            "
        >

            No tasks on this day

        </p>

        `;

    }

    // Close modal content
    // 结束弹窗内容区域
    html += `

    </div>

    `;

    // Get existing modal
    // 获取已存在的弹窗元素
    let modal =
        document.getElementById(
            "dayModal"
        );

    // Create modal if it doesn't exist
    // 如果弹窗不存在，则创建新的弹窗
    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "dayModal";

        modal.className =
            "calendar-day-modal";

        document.body.appendChild(
            modal
        );

    }

    // Insert generated HTML
    // 将生成的 HTML 插入弹窗
    modal.innerHTML = html;

    // Show modal
    // 显示弹窗
    modal.style.display =
        "block";

}

// ==================================================
// CLOSE DAY MODAL
// Close and hide the task modal
// 关闭并隐藏任务弹窗
// ==================================================

function closeDayModal() {

    // Get the day modal element
    // 获取日期任务弹窗元素
    const modal =
        document.getElementById(
            "dayModal"
        );

    // Check whether the modal exists
    // 检查弹窗是否存在
    if (modal) {

        // Hide the modal
        // 隐藏弹窗
        modal.style.display =
            "none";

    }

    // Refresh calendar view
    // 刷新日历界面
    generateCalendar();

}


// ==================================================
// VIEW SWITCH
// Switch between Month View and Year View
// 切换月视图和年视图
// ==================================================
function setView(view) {

    // Save the selected view mode
    // 保存当前选择的视图模式
    currentView = view;

    // Check if Month View is selected
    // 检查是否选择月视图
    if (view === "month") {

        // Show month view container
        // 显示月视图区域
        document.getElementById("monthView").style.display = "block";

        // Hide year view container
        // 隐藏年视图区域
        document.getElementById("yearView").style.display = "none";

        // Show month title
        // 显示月份标题
        document.getElementById("monthTitle").style.display = "block";

        // Generate month calendar
        // 生成月历界面
        generateCalendar();

    } else {

        // Hide month view container
        // 隐藏月视图区域
        document.getElementById("monthView").style.display = "none";

        // Show year view container
        // 显示年视图区域
        document.getElementById("yearView").style.display = "block";

        // Hide month title
        // 隐藏月份标题
        document.getElementById("monthTitle").style.display = "none";

        // Generate year calendar
        // 生成年历界面
        generateYearView();

    }
}

// ==================================================
// NAVIGATION (HEADER BUTTONS)
// Handle previous, next, and today navigation
// 处理上一页、下一页和返回今天的导航按钮
// ==================================================

// ==================================================
// GO TO PREVIOUS
// Navigate to previous month or year
// 切换到上一个月份或年份
// ==================================================
function goPrev() {

    // Check current view mode
    // 检查当前视图模式
    if (currentView === "month") {

        // Move to previous month
        // 切换到上一个月份
        prevMonth();

    } else {

        // Move to previous year
        // 切换到上一年
        prevYear();

    }
}

// ==================================================
// GO TO NEXT
// Navigate to next month or year
// 切换到下一个月份或年份
// ==================================================
function goNext() {

    // Check current view mode
    // 检查当前视图模式
    if (currentView === "month") {

        // Move to next month
        // 切换到下一个月份
        nextMonth();

    } else {

        // Move to next year
        // 切换到下一年
        nextYear();

    }
}

// ==================================================
// GO TO TODAY
// Return calendar to current date
// 返回当前日期所在的月份或年份
// ==================================================
function goToday() {

    // Get current date
    // 获取当前日期
    let now = new Date();

    // Update current month and year
    // 更新当前月份和年份
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();

    // Refresh current view
    // 刷新当前视图
    if (currentView === "month") {

        // Regenerate month view
        // 重新生成月视图
        generateCalendar();

    } else {

        // Regenerate year view
        // 重新生成年视图
        generateYearView();

    }
}


// ==================================================
// MONTH NAVIGATION
// Navigate between previous and next month
// 在月份之间切换（上一月 / 下一月）
// ==================================================

// ==================================================
// PREVIOUS MONTH
// Move calendar to the previous month
// 切换到上一个月份
// ==================================================
function prevMonth() {

    // Decrease current month by 1
    // 当前月份减 1
    currentMonth--;

    // If month becomes less than January
    // 如果月份小于一月
    if (currentMonth < 0) {

        // Set month to December
        // 将月份设为十二月
        currentMonth = 11;

        // Move to previous year
        // 年份减 1
        currentYear--;

    }

    // Refresh month calendar
    // 重新生成月历
    generateCalendar();

}

// ==================================================
// NEXT MONTH
// Move calendar to the next month
// 切换到下一个月份
// ==================================================
function nextMonth() {

    // Increase current month by 1
    // 当前月份加 1
    currentMonth++;

    // If month becomes greater than December
    // 如果月份大于十二月
    if (currentMonth > 11) {

        // Set month to January
        // 将月份设为一月
        currentMonth = 0;

        // Move to next year
        // 年份加 1
        currentYear++;

    }

    // Refresh month calendar
    // 重新生成月历
    generateCalendar();

}


// ==================================================
// YEAR VIEW
// Generate the full year calendar view
// 生成年历视图
// ==================================================
function generateYearView() {

    // Display current year in the title
    // 在标题中显示当前年份
    document.getElementById("yearTitle").innerText = currentYear;

    // Get year grid container and clear old content
    // 获取年历容器并清空旧内容
    let yearGrid = document.getElementById("yearGrid");
    yearGrid.innerHTML = "";

    // Month names for display
    // 用于显示的月份名称
    let monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    // Weekday names
    // 星期名称
    let weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    // Get today's date information
    // 获取今天的日期信息
    let today = new Date();
    let currentDay = today.getDate();
    let currentMonthNum = today.getMonth();
    let currentYearNum = today.getFullYear();

    // Loop through all 12 months
    // 遍历 12 个月份
    for (let m = 0; m < 12; m++) {

        // Create month container
        // 创建月份容器
        let box = document.createElement("div");
        box.classList.add("month-box");

        // Month title
        // 月份标题
        let title = document.createElement("div");
        title.classList.add("month-title");
        title.innerText = monthNames[m];
        box.appendChild(title);

        // Create weekday row
        // 创建星期标题行
        let weekRow = document.createElement("div");
        weekRow.classList.add("mini-weekdays");

        // Add weekday names
        // 添加星期名称
        weekdays.forEach(day => {

            let d = document.createElement("div");
            d.innerText = day;
            weekRow.appendChild(d);

        });

        box.appendChild(weekRow);

        // Create mini calendar container
        // 创建迷你日历容器
        let mini = document.createElement("div");
        mini.classList.add("mini-calendar");

        // Get first weekday of the month
        // 获取该月份第一天是星期几
        let firstDay =
            new Date(currentYear, m, 1).getDay();

        // Get total number of days in the month
        // 获取该月份总天数
        let totalDays =
            new Date(currentYear, m + 1, 0).getDate();

        // Add empty cells before day 1
        // 在第一天之前添加空白格子
        for (let i = 0; i < firstDay; i++) {

            let empty = document.createElement("div");
            empty.classList.add("mini-empty");
            mini.appendChild(empty);

        }

        // Generate all dates
        // 生成所有日期
        for (let d = 1; d <= totalDays; d++) {

            let day = document.createElement("div");
            day.innerText = d;
            day.classList.add("mini-day");

            // Highlight today's date
            // 高亮显示今天
            if (
                m === currentMonthNum &&
                d === currentDay &&
                currentYear === currentYearNum
            ) {

                day.classList.add("today");

            }

            mini.appendChild(day);

        }

        // Add mini calendar into month box
        // 将迷你日历加入月份容器
        box.appendChild(mini);

        // Click month box to switch back to month view
        // 点击月份后切换到月视图
        box.onclick = function () {

            // Update current month
            // 更新当前月份
            currentMonth = m;

            // Switch to month view
            // 切换到月视图
            setView("month");

        };

        // Add month box into year grid
        // 将月份容器加入年历区域
        yearGrid.appendChild(box);

    }
}


// ==================================================
// YEAR NAVIGATION
// Navigate between previous and next year
// 在年份之间切换（上一年 / 下一年）
// ==================================================

// ==================================================
// PREVIOUS YEAR
// Move calendar to the previous year
// 切换到上一年
// ==================================================
function prevYear() {

    // Decrease current year by 1
    // 当前年份减 1
    currentYear--;

    // Refresh year view
    // 重新生成年历视图
    generateYearView();

}

// ==================================================
// NEXT YEAR
// Move calendar to the next year
// 切换到下一年
// ==================================================
function nextYear() {

    // Increase current year by 1
    // 当前年份加 1
    currentYear++;

    // Refresh year view
    // 重新生成年历视图
    generateYearView();

}
