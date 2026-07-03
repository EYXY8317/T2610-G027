// ==================================================
// CALENDAR SYSTEM
// ==================================================
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let currentView = "month";

// Diary entries matching the active search, shown directly on the
// calendar grid (mood + topic + content preview) instead of a
// separate results list.
// Maps ISO date (YYYY-MM-DD, used by the calendar grid) -> the full
// search result { date, topic, mood, content }, where result.date is
// the raw DD/MM/YYYY string stored in the diary entry (required by
// the /diary?date= route, which differs from the calendar's ISO keys).
// 当前日记搜索匹配到的日期，直接在日历格子上显示心情、标题和内容预览，而不是另外列出结果列表
// Map: 日历用的 ISO 日期 (YYYY-MM-DD) -> 完整搜索结果对象 { date, topic, mood, content }
let diaryMatchDates = new Map();

// Mood value -> picture/label, mirrors DiaryHomepage/js/mood_sync.js MOOD_LIST
const DIARY_MOODS = {
    happy:   { label: "Happy",   image: "/diary_home_static/assets/emotions/happy.png" },
    sad:     { label: "Sad",     image: "/diary_home_static/assets/emotions/sad.png" },
    angry:   { label: "Angry",   image: "/diary_home_static/assets/emotions/angry.png" },
    anxious: { label: "Anxious", image: "/diary_home_static/assets/emotions/anxious.png" },
    unwell:  { label: "Unwell",  image: "/diary_home_static/assets/emotions/unwell.png" },
};

// Strip the diary's ||ITEM|| block format down to a short plain-text preview
// 将日记的 ||ITEM|| 分段格式转换为简短的纯文本预览
function extractDiaryPreview(raw) {
    if (!raw) return "";
    const parts = raw.split("||ITEM||");
    const texts = [];
    for (const part of parts) {
        try {
            const d = JSON.parse(part.trim());
            if (d.type === "text" && d.html) {
                const tmp = document.createElement("div");
                tmp.innerHTML = d.html;
                const t = tmp.innerText.trim();
                if (t) texts.push(t);
            }
        } catch (e) {
            if (part.trim() && !part.trim().startsWith("{")) texts.push(part.trim());
        }
    }
    return texts.join(" ").slice(0, 70);
}

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
        dayEl.dataset.date = dateStr;

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
// DIARY SEARCH MATCH PREVIEW
// Show this day's matching diary entry
// (mood + topic + content) directly on
// the calendar, no separate list shown
// 日记搜索匹配预览
// 当该日期的日记匹配当前搜索时，
// 直接在日历格子上显示心情、标题和内容，
// 不再另外列出结果
// =====================================

if (diaryMatchDates.has(dateStr)) {

    const match = diaryMatchDates.get(dateStr);

    dayEl.classList.add("diary-match");

    const card = document.createElement("div");
    card.className = "diary-match-card";
    card.title = "Click to open this diary entry";

    const moodInfo = DIARY_MOODS[match.mood];
    if (moodInfo) {
        const moodEl = document.createElement("div");
        moodEl.className = "diary-match-mood";

        const moodImg = document.createElement("img");
        moodImg.className = "diary-match-mood-icon";
        moodImg.src = moodInfo.image;
        moodImg.alt = moodInfo.label;
        moodEl.appendChild(moodImg);

        const moodLabelEl = document.createElement("span");
        moodLabelEl.className = "diary-match-mood-label";
        moodLabelEl.textContent = moodInfo.label;
        moodEl.appendChild(moodLabelEl);

        card.appendChild(moodEl);
    }

    if (match.topic) {
        const topicEl = document.createElement("div");
        topicEl.className = "diary-match-topic";
        topicEl.textContent = match.topic;
        card.appendChild(topicEl);
    }

    const preview = extractDiaryPreview(match.content);
    if (preview) {
        const previewEl = document.createElement("div");
        previewEl.className = "diary-match-preview";
        previewEl.textContent = preview;
        card.appendChild(previewEl);
    }

    // Clicking the card opens that day's diary entry
    // without triggering the day cell's task modal
    // 点击卡片直接打开当天日记，不触发任务弹窗
    card.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = "/diary?date=" + encodeURIComponent(match.date);
    });

    dayEl.appendChild(card);

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

    // Diary route expects DD/MM/YYYY, not the ISO dateStr
    // 日记路由需要 DD/MM/YYYY 格式，而不是 ISO 日期字符串
    const [modalYear, modalMonth, modalDay] = dateStr.split("-");
    const diaryDate = `${modalDay}/${modalMonth}/${modalYear}`;

    // Modal HTML start
    // 开始建立弹窗 HTML 内容
    let html = `

    <div class="calendar-modal-header">

        <h2>

            ${displayDate}

            <a
                class="modal-shortcut-icon"
                href="/view?start=${dateStr}&end=${dateStr}"
                title="Open Finance"
            >
                <img src="/calendar_static/images/finance.png" alt="Finance">
            </a>

            <a
                class="modal-shortcut-icon"
                href="/diary?date=${encodeURIComponent(diaryDate)}"
                title="Open Diary"
            >
                <img src="/calendar_static/images/Diary.png" alt="Diary">
            </a>

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

// ==================================================
// TOPBAR SEARCH (shared search-box)
// Behavior depends on which sidebar page is active:
//   - Calendar page  -> searches diary entries (/search)
//   - Today page     -> filters today's task list
//   - Work/Shopping/Study/Personal/Workout -> filters that list's tasks
// 顶部共享搜索框，根据当前所在页面执行不同的搜索：
//   - Calendar 页面 -> 搜索日记内容
//   - Today 页面    -> 筛选今日任务
//   - 其余任务分类页面 -> 筛选该分类下的任务
// ==================================================
const TASK_LIST_PAGES = ["work", "shopping", "study", "personal", "workout"];

document.addEventListener("DOMContentLoaded", function () {

    const searchInput   = document.getElementById("diarySearchInput");
    const searchResults = document.getElementById("diarySearchResults");

    if (!searchInput || !searchResults) return;

    // Guests: the backend always returns empty results when logged out, so
    // typing here silently does nothing. Gate it up front with the shared
    // login popup instead, matching every other guest-restricted feature.
    // (login-gate.js already does this for plain <input> fields, but this
    // one still needs a manual mousedown gate since it's a search box that
    // should stay focusable/typeable once actually logged in.)
    const loggedIn = window.isLoggedIn ? window.isLoggedIn() : (function () {
        const meta = document.querySelector('meta[name="logged-in"]');
        return !!meta && meta.content === "true";
    })();
    if (!loggedIn) {
        searchInput.addEventListener("mousedown", function (e) {
            e.preventDefault();
            searchInput.blur();
            window.showLoginRequiredModal && window.showLoginRequiredModal();
        });
        searchInput.addEventListener("focus", function () {
            searchInput.blur();
        });
        return;
    }

    let debounceTimer = null;

    function getActivePageId() {
        const activePage = document.querySelector(".page.active");
        return activePage ? activePage.id : "";
    }

    // Diary entries store dates as DD/MM/YYYY; the calendar grid keys
    // its day cells by ISO YYYY-MM-DD. Convert for matching.
    // 日记条目的日期是 DD/MM/YYYY 格式，而日历格子用 ISO YYYY-MM-DD 作为键，需要转换才能匹配
    function toIsoDate(raw) {
        const parts = (raw || "").split("/");
        if (parts.length !== 3) return null;
        const [d, m, y] = parts;
        if (!d || !m || !y) return null;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Pick which month to jump to when none of the matching
    // dates are visible in the currently displayed month:
    // the match closest to today (past or future).
    // 当前月份没有任何匹配结果时，跳转到与今天最接近的匹配日期所在月份
    function pickClosestDate(dates) {
        const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        let best = dates[0];
        let bestDiff = Infinity;
        dates.forEach(d => {
            const [y, m, day] = d.split("-").map(Number);
            const diff = Math.abs(new Date(y, m - 1, day).getTime() - todayTime);
            if (diff < bestDiff) {
                bestDiff = diff;
                best = d;
            }
        });
        return best;
    }

    // Show diary search matches directly on the calendar grid
    // instead of a dropdown list of results.
    // 直接在日历格子上显示日记搜索结果，而不是显示下拉列表
    function showDiaryMatchesOnCalendar(results) {
        searchResults.classList.remove("open");
        searchResults.innerHTML = "";

        diaryMatchDates = new Map();
        results.forEach(r => {
            const iso = toIsoDate(r.date);
            if (iso) diaryMatchDates.set(iso, r);
        });
        const dates = [...diaryMatchDates.keys()];

        if (currentView !== "month") {
            setView("month");
        }

        if (dates.length > 0) {
            const hasMatchInView = dates.some(d => {
                const [y, m] = d.split("-").map(Number);
                return y === currentYear && (m - 1) === currentMonth;
            });

            if (!hasMatchInView) {
                const [y, m] = pickClosestDate(dates).split("-").map(Number);
                currentYear = y;
                currentMonth = m - 1;
            }
        }

        generateCalendar();

        if (dates.length === 0) {
            searchResults.innerHTML = '<div class="diary-result-empty">No results found.</div>';
            searchResults.classList.add("open");
        }
    }

    function runSearch() {
        const keyword = searchInput.value.trim();
        const activePageId = getActivePageId();

        // Calendar page: search diary entries, highlight matches on the calendar
        // Calendar 页面：搜索日记，直接在日历上高亮匹配结果
        if (activePageId === "calendar") {
            if (!keyword) {
                diaryMatchDates.clear();
                searchResults.classList.remove("open");
                searchResults.innerHTML = "";
                if (currentView === "month") generateCalendar();
                return;
            }

            const formData = new FormData();
            formData.append("keyword", keyword);

            fetch("/search", { method: "POST", body: formData })
                .then(res => res.json())
                .then(data => showDiaryMatchesOnCalendar(data.results || []));
            return;
        }

        // Any other page: filter that page's own task list instead
        // 其他页面：筛选该页面自己的任务列表
        searchResults.classList.remove("open");
        searchResults.innerHTML = "";
        currentSearchKeyword = keyword.toLowerCase();

        if (activePageId === "today") {
            renderTodayTasks();
        } else if (activePageId === "completed") {
            renderCompleted();
        } else if (activePageId === "trash") {
            renderTrash();
        } else if (TASK_LIST_PAGES.includes(activePageId)) {
            renderTasks(activePageId);
        }
    }

    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runSearch, 250);
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            clearTimeout(debounceTimer);
            runSearch();
        }
    });

    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim() && searchResults.innerHTML) {
            searchResults.classList.add("open");
        }
    });

    document.addEventListener("click", (e) => {
        const box = document.getElementById("diarySearchBox");
        if (box && !box.contains(e.target)) {
            searchResults.classList.remove("open");
        }
    });
});
