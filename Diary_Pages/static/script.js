// ======================== REMINDER POPUP ========================
// ======================== 提示弹窗 ========================
// showReminderPopup is defined globally by DiaryHomepage' js/shared/reminderPopup.js
// (loaded as a <script type="module"> above this file in diary.html) so both pages
// share one implementation instead of maintaining two copies in sync by hand.
// showReminderPopup 是由 DiaryHomepage 的 js/shared/reminderPopup.js
// （在 diary.html 里以 <script type="module"> 的方式加载在这个文件之前）
// 挂到全局 window 上的，这样两个页面就能共用同一份实现，
// 不用手动维护两份一模一样的代码保持同步。

// ======================== USER-SCOPED STORAGE ========================
// ======================== 按用户区分的本地存储 ========================
// Namespaces localStorage keys by the logged-in username (injected by
// diary.html via window.__CURRENT_USERNAME__) so cached diary data never
// leaks to a different account sharing the same browser.
// 把 localStorage 的 key 按当前登录用户名加上"命名空间"前缀
// （用户名是 diary.html 通过 window.__CURRENT_USERNAME__ 注入进来的），
// 这样如果同一台电脑上有好几个人共用浏览器，缓存的日记数据
// 也不会串到别人的账号里。

function scopedKey(base) {
    return base + "::" + (window.__CURRENT_USERNAME__ || "guest");
}

// ======================== ELEMENTS ========================
// ======================== 页面元素 ========================

let box = document.getElementById("box");
let editBtn = document.getElementById("editBtn");
let deleteBtn = document.getElementById("deleteBtn");
let mood = document.getElementById("mood");
let saveStatus = document.getElementById("saveStatus");
let topic = document.getElementById("topic");

// URLSearchParams：浏览器内置的工具，专门用来读取网址 "?xxx=yyy"
// 这部分的查询参数，比自己手写字符串解析要方便安全得多。
// URLSearchParams: a built-in browser utility for reading the "?xxx=yyy"
// query-string part of the URL — much easier and safer than parsing that
// string by hand.

let params = new URLSearchParams(window.location.search);

// ======================== STATE ========================
// ======================== 页面状态 ========================

let results = [];
let currentIndex = 0;

// ======================== LOAD SAVED RESULTS ========================
// ======================== 读取上次保存的搜索结果 ========================
// 如果用户之前搜索过，把上次的搜索结果从 localStorage 里读回来——
// 这样从搜索结果点进某一篇日记后，"上一个/下一个结果"按钮还能继续用，
// 不需要重新搜索一次。
// If the user previously searched, restore that search result list from
// localStorage — this way, after clicking into one diary entry from the
// results, the "previous/next result" buttons still work without having
// to search again.

let savedResults = localStorage.getItem(scopedKey("searchResults"));
if (savedResults) {
    results = JSON.parse(savedResults);
}

// ======================== VIEW MODE LOCK ========================
// ======================== 只读模式锁定 ========================
// mode 由 diary.html 内联脚本事先定义好（不在这个文件里）——
// "view" 模式表示这是别人分享/查看历史记录时的只读页面，
// 这里把画布设成不可编辑、心情选择器禁用点击、主题栏设成只读。
// `mode` is defined earlier by an inline script in diary.html (not in this
// file) — "view" mode means this is a read-only page (e.g. viewing a past
// entry), so the canvas is made non-editable, the mood picker has clicks
// disabled, and the topic field is made read-only.

if (mode === "view") {
    box.setAttribute("contenteditable", "false");
    mood.style.pointerEvents = "none";
    mood.style.opacity = "1";
    topic.setAttribute("readonly", true);
}

// ======================== CURRENT DATE ========================
// ======================== 当前日期 ========================

let currentDate = params.get("date");
if (!currentDate) {
    currentDate = document.getElementById("dateDisplay").innerText.trim();
}

// ======================== SYNC INDEX ========================
// ======================== 同步搜索结果下标 ========================
// 如果当前打开的这篇日记刚好也在搜索结果列表里，
// 把 currentIndex 对准它，这样"上一个/下一个"按钮的起点是对的，
// 而不是每次都从第一条结果开始数。
// If the diary entry currently open also happens to be in the search
// results list, point currentIndex at it, so the "previous/next" buttons
// start from the right place instead of always counting from the first
// result.

if (results.length > 0 && currentDate) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].date === currentDate) {
            currentIndex = i;
            break;
        }
    }
}

// ======================== EDIT MODE ========================
// ======================== 编辑模式 ========================

let editing = false;
let timer;

if (mode === "add") {
    editing = true;
}

// ======================== EDIT BUTTON ========================
// ======================== 编辑按钮 ========================

editBtn.addEventListener("click", function() {
    if (!window.__CURRENT_USERNAME__) {
        window.showLoginRequiredPopup && window.showLoginRequiredPopup();
        return;
    }
    editing = true;
    box.setAttribute("contenteditable", "true");
    mood.style.pointerEvents = "auto";
    mood.removeAttribute("disabled");
    topic.removeAttribute("readonly");
});

// ======================== DELETE BUTTON ========================
// ======================== 删除按钮 ========================

deleteBtn.addEventListener("click", function() {
    if (!window.__CURRENT_USERNAME__) {
        window.showLoginRequiredPopup && window.showLoginRequiredPopup();
        return;
    }
    showReminderPopup({
        title: "Delete Entry?",
        message: "Are you sure you want to delete everything? This includes topic, mood, and diary.",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
        onConfirm: function() {
            // FormData：专门用来打包表单数据（包括文件）发给后端的浏览器
            // 内置对象；fetch(...) 发起一个真正的网络请求（这里是 POST），
            // 不需要刷新整个页面就能跟服务器通信。
            // FormData: a built-in browser object for packaging form data
            // (including files) to send to the backend; fetch(...) makes a
            // real network request (a POST here) without needing to
            // reload the whole page to talk to the server.
            let data = new FormData();
            data.append("date", currentDate);

            fetch("/delete", {
                method: "POST",
                body: data
            }).then(() => {
                localStorage.removeItem(scopedKey("diary_mood_today"));
                try {
                    // 删除日记后，同步清理今日情绪组件缓存的心情状态，
                    // 避免仪表盘上还显示着已经被删掉的心情。
                    // After deleting the entry, also clean up the cached
                    // mood state in the Today Emotion widget's storage, so
                    // the dashboard doesn't keep showing a mood that no
                    // longer has an entry behind it.
                    const key = scopedKey("today-emotion-state");
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const state = JSON.parse(raw);
                        state.selectedIndexes = [];
                        const today = new Date().toISOString().slice(0, 10);
                        if (state.history) delete state.history[today];
                        localStorage.setItem(key, JSON.stringify(state));
                    }
                } catch (_) {}
                location.reload();
            });
        }
    });
});

// ======================== AUTOSAVE TEXT ========================
// ======================== 文字自动保存 ========================
// "防抖"（debounce）技巧：每次用户打字都会触发 input 事件，
// 但没必要每敲一个字就发一次请求给后端——所以每次都先用
// clearTimeout 取消上一次还没触发的保存计时器，重新等 1 秒；
// 只有用户停下来不打字超过 1 秒后，才真正发起保存请求。
// 这样可以大幅减少发给后端的请求次数。
// "Debounce" technique: every keystroke fires an input event, but it's
// wasteful to send a save request to the backend on every single
// character — so each time, clearTimeout cancels whatever save timer
// hasn't fired yet and restarts a fresh 1-second wait. The actual save
// request only fires once the user has stopped typing for a full second,
// dramatically cutting down how many requests hit the backend.

box.addEventListener("input", function(event) {
    if (!editing) return;
    if (event.target.tagName === "IMG") return;

    clearTimeout(timer);
    saveStatus.innerText = "";

    timer = setTimeout(() => {
        let data = new FormData();
        data.append("content", box.innerHTML);
        data.append("mood", mood.value);
        data.append("topic", topic.value);
        data.append("date", currentDate);

        fetch("/autosave", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";
            document.getElementById("msg").innerText = res.message;
        })
        .catch(err => {
            console.log("ERROR", err);
        });
    }, 1000);
});

// ======================== AUTOSAVE MOOD ========================
// ======================== 心情自动保存 ========================
// 心情是下拉选单，选一次就立刻保存，不需要像打字那样"防抖"等待，
// 因为选择一次就是一次完整的操作，不会像打字一样连续触发很多次。
// Mood is a dropdown, so it saves immediately on change — no debounce
// wait needed like the typing case, since picking one option is already a
// single complete action, not a rapid burst of events like typing is.

mood.addEventListener("change", function() {
    if (!editing) return;

    saveStatus.innerText = "";

    let data = new FormData();
    data.append("content", box.innerHTML);
    data.append("mood", mood.value);
    data.append("topic", topic.value);
    data.append("date", currentDate);

    fetch("/autosave", {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(res => {
        saveStatus.innerText = "Saved ✅";
        saveStatus.style.color = "green";
        document.getElementById("msg").innerText = res.message;
    });
});

// ======================== AUTOSAVE TOPIC ========================
// ======================== 主题自动保存 ========================

topic.addEventListener("input", function() {
    // 限制主题最多 20 个字：超过就直接砍掉多出来的部分；
    // trimStart() 去掉开头打出来的空格，防止主题以空白开头。
    // Caps the topic at 20 characters: anything past that is simply cut
    // off; trimStart() removes leading spaces so the topic can't start
    // with blank space.
    if (topic.value.length > 20) {
        topic.value = topic.value.slice(0, 20);
    }
    topic.value = topic.value.trimStart();

    clearTimeout(timer);
    saveStatus.innerText = "";

    timer = setTimeout(() => {
        let data = new FormData();
        data.append("content", box.innerHTML);
        data.append("mood", mood.value);
        data.append("topic", topic.value);
        data.append("date", currentDate);

        fetch("/autosave", {
            method: "POST",
            body: data
        })
        .then(res => res.json())
        .then(res => {
            saveStatus.innerText = "Saved ✅";
            saveStatus.style.color = "green";
            document.getElementById("msg").innerText = res.message;
        });
    }, 1000);
});

// ======================== CALENDAR ========================
// ======================== 日历选择器 ========================
// flatpickr 是一个第三方的日期选择器库（在 diary.html 的 <head> 里
// 通过 CDN 引入）；这里把它绑定到日期显示区上，点一下就能弹出一个
// 日历选日期，选中后直接跳转到那一天的日记页面。
// flatpickr is a third-party date-picker library (loaded via CDN in
// diary.html's <head>); it's attached to the date display here so
// clicking it pops up a calendar to pick a date, jumping straight to that
// day's diary entry once one is chosen.

let dateDisplay = document.getElementById("dateDisplay");
if (dateDisplay && typeof flatpickr !== "undefined") {
    flatpickr(dateDisplay, {
        dateFormat: "d/m/Y",
        defaultDate: currentDate,
        position: "below",
        onChange: function(selectedDates, dateStr) {
            window.location.href = "/diary?date=" + dateStr;
        }
    });
}

// ======================== DATE NAV ========================
// ======================== 日期前进/后退 ========================

function changeDate(days) {
    // currentDate 是 "DD/MM/YYYY" 格式的字符串，先拆成三段
    // day/month/year，用它们构造一个真正的 JS Date 对象才能做加减天数
    // 的运算（字符串本身是不能直接加减天数的）。
    // currentDate is a "DD/MM/YYYY" string; it's split into
    // day/month/year parts to build a real JS Date object, since only a
    // proper Date (not the raw string) supports adding/subtracting days.
    let parts = currentDate.split("/");
    let d = new Date(parts[2], parts[1] - 1, parts[0]);
    d.setDate(d.getDate() + days);

    // padStart(2, '0')：把个位数的日期/月份补上前导 0
    // （比如 5 -> "05"），拼回统一的 "DD/MM/YYYY" 格式。
    // padStart(2, '0'): pads single-digit day/month with a leading zero
    // (e.g. 5 -> "05"), reassembling the consistent "DD/MM/YYYY" format.
    let newDate =
        String(d.getDate()).padStart(2, '0') + "/" +
        String(d.getMonth() + 1).padStart(2, '0') + "/" +
        d.getFullYear();

    window.location.href = "/diary?date=" + newDate;
}

// ======================== COUNTER ========================
// ======================== 搜索结果计数 ========================

function updateCounter() {
    let resultCount = document.getElementById("resultCount");
    if (resultCount) {
        resultCount.innerText = (currentIndex + 1) + " / " + results.length;
    }
}

// ======================== GO TO RESULT ========================
// ======================== 跳转到某条搜索结果 ========================

function goToResult(index) {
    let r = results[index];
    currentDate = r.date;

    let data = new FormData();
    data.append("date", r.date);

    fetch("/get_entry", {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(entry => {
        box.innerHTML = entry.content || "";
        mood.value = entry.mood || "";
        document.getElementById("dateDisplay").innerText = r.date;
        // history.pushState：只改浏览器地址栏的网址，不真正刷新页面——
        // 这样"上一步/下一步"浏览器按钮能正常工作，网址也能直接分享，
        // 但又不用为了换一条日记而重新加载整个页面。
        // history.pushState: only updates the browser's address bar URL
        // without actually reloading the page — so the browser's
        // back/forward buttons keep working and the URL stays shareable,
        // without paying the cost of a full page reload just to switch
        // to a different diary entry.
        window.history.pushState({}, "", "/diary?date=" + r.date);
    });
}

// ======================== DOM READY ========================
// ======================== 页面加载完成后执行 ========================

document.addEventListener("DOMContentLoaded", function() {

    // ===== Prev / Next Date =====
    // ===== 上一天 / 下一天 =====
    let prev = document.getElementById("prevDate");
    let next = document.getElementById("nextDate");

    if (prev) {
        prev.addEventListener("click", function() { changeDate(-1); });
    }
    if (next) {
        next.addEventListener("click", function() { changeDate(1); });
    }

    // ===== Prev / Next Search Result =====
    // ===== 上一条 / 下一条搜索结果 =====
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", function() {
            if (results.length === 0) return;
            currentIndex--;
            // 到了第一条再往前，就绕回最后一条（循环导航），
            // 而不是停在那里没有反应。
            // Going before the first result wraps back around to the
            // last one (cyclic navigation), instead of just doing nothing.
            if (currentIndex < 0) currentIndex = results.length - 1;
            updateCounter();
            goToResult(currentIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            if (results.length === 0) return;
            currentIndex++;
            if (currentIndex >= results.length) currentIndex = 0;
            updateCounter();
            goToResult(currentIndex);
        });
    }

    // ======================== SEARCH WIDGET ========================
    // ======================== 搜索组件 ========================
    const searchWidget  = document.getElementById("searchWidget");
    const searchIconBtn = document.getElementById("searchIconBtn");
    const searchBox     = document.getElementById("searchBox");
    const searchBtn     = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    searchIconBtn.addEventListener("click", (e) => {
        // stopPropagation()：阻止这次点击继续往上"冒泡"到 document，
        // 不然下面第 318 行绑定在 document 上的"点击别处就收起搜索框"
        // 逻辑会立刻把刚打开的搜索框马上关掉。
        // stopPropagation(): stops this click from bubbling further up to
        // document — otherwise the "click elsewhere closes the search box"
        // listener on document (further down) would immediately close the
        // search box that was just opened.
        e.stopPropagation();
        if (!window.__CURRENT_USERNAME__) {
            window.showLoginRequiredPopup && window.showLoginRequiredPopup();
            return;
        }
        searchWidget.classList.toggle("open");
        if (searchWidget.classList.contains("open")) {
            searchBox.focus();
        } else {
            searchBox.value = "";
            searchResults.innerHTML = "";
        }
    });

    // 点击搜索框和搜索结果列表以外的任何地方，就自动收起搜索框。
    // Clicking anywhere outside the search box and its results list
    // automatically collapses the search widget.

    document.addEventListener("click", (e) => {
        if (!searchWidget.contains(e.target) && !searchResults.contains(e.target)) {
            searchWidget.classList.remove("open");
            searchBox.value = "";
            searchResults.innerHTML = "";
        }
    });

    searchBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });

    searchBtn.addEventListener("click", () => {
        const keyword = searchBox.value.trim();
        if (!keyword) return;

        const formData = new FormData();
        formData.append("keyword", keyword);

        fetch("/search", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                results = data.results;
                currentIndex = 0;
                localStorage.setItem(scopedKey("searchResults"), JSON.stringify(results));

                searchResults.innerHTML = "";

                if (results.length === 0) {
                    searchResults.innerHTML = "<p style='color:#aaa;font-size:13px;padding:8px;'>No results found.</p>";
                    return;
                }

                // 日记内容存的是带 "||ITEM||" 分隔符和 HTML 标签的原始格式
                // （跟 app.py 里 _diary_text 处理的是同一种格式），
                // 这里把它转换成一段干净的纯文字预览，最多显示 80 个字。
                // Diary content is stored in the raw "||ITEM||"-separated,
                // HTML-tagged format (the same format app.py's _diary_text
                // parses) — this converts it into a clean plain-text
                // preview, capped at 80 characters.

                function extractPreview(raw) {
                    if (!raw) return "";
                    const parts = raw.split("||ITEM||");
                    const texts = [];
                    for (const part of parts) {
                        try {
                            const d = JSON.parse(part.trim());
                            if (d.type === "text" && d.html) {
                                // 用一个"没有加进页面"的临时 <div> 承接 HTML，
                                // 再读它的 innerText——这是浏览器提供的
                                // 一个巧妙技巧，能把 HTML 标签去掉、
                                // 只留纯文字，不用自己写正则表达式处理。
                                // A temporary <div> (never actually added to
                                // the page) receives the HTML, then its
                                // innerText is read — a handy browser trick
                                // for stripping HTML tags down to plain
                                // text without writing a regex by hand.
                                const tmp = document.createElement("div");
                                tmp.innerHTML = d.html;
                                const t = tmp.innerText.trim();
                                if (t) texts.push(t);
                            }
                        } catch(e) {
                            if (part.trim() && !part.trim().startsWith("{")) texts.push(part.trim());
                        }
                    }
                    return texts.join(" ").slice(0, 80);
                }

                // 心情名称的映射表：把各种大小写/新旧命名的心情值
                // 统一对应到当前用的图片文件名（happy/sad/angry/anxious/unwell），
                // 兼容改版前存的旧数据。
                // A mood-name lookup table: maps various old/new,
                // differently-cased mood values onto the current image
                // filenames (happy/sad/angry/anxious/unwell), so data saved
                // before a redesign still displays correctly.
                const MOOD_LABELS = { happy:"happy", sad:"sad", angry:"angry", anxious:"anxious", unwell:"unwell", Happy:"happy", Sad:"sad", Angry:"angry", meh:"unwell", smile:"happy", neutral:"sad" };

                results.forEach((r, i) => {
                    const item = document.createElement("div");
                    item.className = "search-result-item";
                    const preview = extractPreview(r.content);
                    const moodKey = r.mood ? (MOOD_LABELS[r.mood] || r.mood.toLowerCase()) : "";
                    const moodHtml = moodKey
                        ? `<img src="/diary_home_static/assets/emotions/${moodKey}.png" class="result-mood-img" alt="${moodKey}">`
                        : "";
                    item.innerHTML = `
                        <div class="result-date">${r.date}</div>
                        <div class="result-meta">
                            ${r.topic ? `<span class="result-topic">${r.topic}</span>` : ""}
                            ${moodHtml}
                        </div>
                        ${preview ? `<div class="result-preview">${preview}</div>` : ""}
                    `;
                    item.addEventListener("click", () => {
                        window.location.href = "/diary?date=" + encodeURIComponent(r.date);
                    });
                    searchResults.appendChild(item);
                });
            });
    });

});
