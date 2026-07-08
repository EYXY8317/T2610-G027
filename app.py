from flask import Flask, render_template, request, session, send_from_directory, jsonify
from Diary_Pages.diary_system.routes import diary_bp
from auth_routes import auth_bp
from Finance.finance_routes import finance_bp
from Calendar_Pages.calendar_routes import calendar_bp

import json
import os
import re
from datetime import datetime, timedelta
import calendar as _cal
from jinja2 import ChoiceLoader, FileSystemLoader

from Profile_Pages.profile_routes import register_profile_routes
from db_store import load_data, save_data

# ================= BASE =================
# ================= 基础配置 =================

BASE_DIR = os.path.dirname(__file__)

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "Finance", "static")
)

app.secret_key = "my_secret_key"

register_profile_routes(app)

# ================= TEMPLATE LOADER =================
# ================= 模板加载器 =================

# 用 ChoiceLoader 把好几个模块各自的 templates 文件夹合并成一个"虚拟"的
# 模板目录 —— Flask 找模板时会按顺序依次尝试这几个文件夹，直到找到同名文件。
# 这样每个模块（Finance/Calendar/Diary/Profile）可以各自管理自己的 .html 文件，
# 而不用把所有模板都塞进同一个 templates 文件夹。
# ChoiceLoader merges several modules' separate `templates` folders into one
# combined lookup path — Flask tries each folder in order until it finds a
# file with the matching name. This lets each module (Finance/Calendar/Diary/
# Profile) keep its own .html files instead of everything living in one
# shared templates folder.

app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(BASE_DIR, "Finance", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Calendar_Pages", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Diary_Pages", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Profile_Pages", "templates")),
])

# ================= BLUEPRINTS =================
# ================= 蓝图注册 =================

# Flask 蓝图（Blueprint）让每个模块的路由可以写在自己的文件里，
# 最后统一注册到主 app 上，而不用把所有 @app.route 都写在这一个文件里。
# Flask blueprints let each module define its own routes in its own file;
# they all get registered onto the main `app` here instead of every
# @app.route living in this one giant file.

app.register_blueprint(diary_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(finance_bp)
app.register_blueprint(calendar_bp)

# ================= FILE PATHS =================
# ================= 文件路径 =================

f_users = os.path.join(BASE_DIR, "users.json")

# ================= HELPERS =================
# ================= 辅助函数 =================

def get_user_wallpaper():
    if "user" not in session:
        return None
    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return u.get("wallpaper")
    return None

def get_current_user():
    if "user" not in session:
        return None
    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return u

def _diary_text(content):
    # 日记内容存成一长串字符串，多个"区块"（文字/图片）之间用
    # "||ITEM||" 分隔；每个区块本身是一段 JSON。这个函数只把
    # type 为 "text" 的区块拼起来，去掉 HTML 标签，变成一段
    # 纯文字预览（给首页卡片用），并且最多只取前 160 个字。
    # Diary entries are stored as one long string, with individual
    # "chunks" (text/image blocks) separated by "||ITEM||"; each chunk is
    # itself a small JSON blob. This pulls out just the "text" chunks,
    # strips their HTML tags, and joins them into a short plain-text
    # preview (used on the dashboard card) — capped at 160 characters.

    content = (content or "").strip()
    if not content:
        return ""
    texts = []
    for chunk in content.split("||ITEM||"):
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            parsed = json.loads(chunk)
            if parsed.get("type") == "text":
                # <[^>]+> 匹配任意 HTML 标签（比如 <b>、</p>），
                # 用空字符串替换掉，相当于把富文本"去标签"变成纯文字。
                # <[^>]+> matches any HTML tag (e.g. <b>, </p>); replacing
                # it with an empty string strips the rich-text formatting
                # down to plain text.
                text = re.sub(r"<[^>]+>", "", parsed.get("html", "")).strip()
                if text:
                    texts.append(text)
        except Exception:
            # 这个区块不是合法 JSON（比如是旧格式数据）——
            # 那就把它当作普通文字直接去标签处理，而不是报错跳过。
            # This chunk isn't valid JSON (e.g. old-format data) — treat it
            # as plain text and still strip tags, instead of erroring out.
            text = re.sub(r"<[^>]+>", "", chunk).strip()
            if text:
                texts.append(text)
    return " · ".join(texts)[:160]

def _parse_ddate(ds):
    try:
        return datetime.strptime(ds, "%d/%m/%Y")
    except Exception:
        # 解析失败（空字符串/格式不对）时返回可能的最小日期，
        # 这样在后面按日期排序/比较大小时，这条记录永远排在最前面，
        # 不会导致程序因为一个坏日期而崩溃。
        # If parsing fails (empty string / wrong format), return the
        # smallest possible date so date comparisons/sorting downstream
        # still work — this entry just sorts first — instead of crashing
        # the whole page over one bad date value.
        return datetime.min

# ================= HOME / DASHBOARD =================
# ================= 首页 / 仪表盘 =================

@app.route("/")
@app.route("/dashboard")
def dashboard():
    user = session.get("user")
    users = load_data(f_users, [])
    current_user = next((u for u in users if u["username"] == user), None) if user else None

    # Finance data for home card
    records   = load_data(os.path.join(BASE_DIR, "Finance", "expenses.json"), [])
    budgets   = load_data(os.path.join(BASE_DIR, "Finance", "budget.json"), [])
    goals_all = load_data(os.path.join(BASE_DIR, "goals.json"), [])
    accounts  = load_data(os.path.join(BASE_DIR, "Finance", "accounts.json"), [])
    now       = datetime.now()
    cur_month = now.strftime("%Y-%m")
    prev_month= (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

    user_records = [r for r in records if r.get("username") == user]

    def month_expense(ym):
        # 只统计"支出"类型、且不是"转账/存钱"分类、日期属于指定月份（ym，
        # 格式 "YYYY-MM"）的记录金额总和 —— 转账和存钱不算真正花掉的钱。
        # Sums only "expense"-type records for the given month (ym, in
        # "YYYY-MM" form), excluding transfers/goal-savings — those move
        # money between your own accounts rather than actually spending it.

        return sum(r.get("amount", 0) for r in user_records
                   if r.get("type") == "expense"
                   and r.get("category") not in ("Transfer Out", "Goal Savings")
                   and r.get("date", "").startswith(ym))

    cur_expense  = month_expense(cur_month)
    prev_expense = month_expense(prev_month)

    if prev_expense > 0:
        expense_change = round(((cur_expense - prev_expense) / prev_expense) * 100)
    else:
        # 上个月没有支出记录时，不能拿 0 做分母算百分比变化
        # （会报除以零的错误），所以直接当作"没有变化"处理。
        # Can't divide by zero if last month had no spending, so treat
        # that case as "0% change" instead of raising an error.
        expense_change = 0

    # Weekly breakdown (W1–W4) for current month
    week_expenses = [0, 0, 0, 0]
    for r in user_records:
        if r.get("type") != "expense": continue
        if r.get("category") in ("Transfer Out", "Goal Savings"): continue
        d = r.get("date", "")
        if not d.startswith(cur_month): continue
        day = int(d.split("-")[2])
        # 把"这个月的第几天"换算成"第几周"（0~3）：每 7 天算一周，
        # 用 min(...,3) 把第 29-31 天也归到第 4 周（下标3），
        # 这样无论这个月有几天，永远只分成 4 组，不会越界。
        # Convert "day of month" into a week bucket (0-3): every 7 days is
        # one week, and min(...,3) folds days 29-31 into the 4th bucket
        # (index 3) too, so months with more days never produce a 5th
        # bucket that the fixed-size week_expenses list can't hold.
        week_idx = min((day - 1) // 7, 3)
        week_expenses[week_idx] += r.get("amount", 0)

    max_week = max(week_expenses) if any(week_expenses) else 1

    # Available balance: net across all spending accounts
    user_accounts = [a for a in accounts if a.get("username") == user]
    # 只挑出"消费用途"的账户名字（排除储蓄账户），因为"可用余额"
    # 应该只看你能随时花的钱，不包含专门存起来的储蓄。
    # Only the names of "spending"-purpose accounts (excluding savings
    # accounts) — "available balance" should reflect money you can freely
    # spend, not money set aside in savings.
    spending_names = {a["name"] for a in user_accounts if a.get("purpose") != "savings"}
    available_balance = 0
    for r in user_records:
        if r.get("account") not in spending_names:
            continue
        if r.get("type") in ("income", "saving"):
            available_balance += r.get("amount", 0)
        elif r.get("type") == "expense":
            available_balance -= r.get("amount", 0)

    # Savings progress across all active goals
    user_goals = [g for g in goals_all if g.get("username") == user
                  and g.get("status") not in ("Completed", "Cancelled")]
    total_saved  = 0
    total_target = 0
    for g in user_goals:
        saved = sum(r.get("amount", 0) for r in user_records
                    if r.get("category") == "Goal Savings"
                    and r.get("goal_id") == g.get("id"))
        # 用 min(saved, target) 把"已存"的钱封顶在目标金额，
        # 这样万一存超过了目标，总进度也不会超过 100%。
        # Cap the saved amount at the goal's target with min(...) so
        # over-saving past the goal can't push the overall progress
        # bar above 100%.
        total_saved  += min(saved, g.get("target", 0))
        total_target += g.get("target", 0)
    savings_pct = round((total_saved / total_target) * 100) if total_target else 0

    # Calendar data for dashboard card
    f_tasks_dash = os.path.join(BASE_DIR, "Calendar_Pages", "tasks.json")
    all_tasks_dash = load_data(f_tasks_dash, [])
    today_str_cal = now.strftime("%Y-%m-%d")
    dash_today_tasks_count = len([
        t for t in all_tasks_dash
        if t.get("username") == user
        and t.get("status") != "trash"
        and t.get("date") == today_str_cal
    ])
    # 用花括号 {} 写的集合推导式（set comprehension）会自动去重 ——
    # 就算某天有好几个任务，这一天也只会出现一次，正好符合
    # "日历上哪几天有任务点"这个需求（不需要知道具体有几个任务）。
    # A set comprehension ({...}) automatically de-duplicates — even if a
    # day has several tasks, that day number only appears once, which is
    # exactly what's needed for "which days have a dot on the calendar"
    # (the exact task count per day doesn't matter here).
    cal_task_days = list({
        int(t["date"].split("-")[2])
        for t in all_tasks_dash
        if t.get("username") == user
        and t.get("status") != "trash"
        and t.get("date", "").startswith(cur_month)
        and len(t.get("date", "")) >= 10
    })
    # Python 的 calendar.weekday() 是"周一=0"。日历格子要的是"周日=0"，
    # 所以 +1 再对 7 取余数（mod 7），把星期几往后挪一位，
    # 让周日重新变成 0（星期六原本是 5，+1=6，对 7 取余还是 6，没问题；
    # 周一原本 0，+1=1；……周日原本 6，+1=7，对 7 取余变回 0）。
    # Python's calendar.weekday() treats Monday as 0. The calendar grid
    # here wants Sunday as 0, so +1 then mod 7 shifts every value one
    # slot forward, wrapping Sunday (originally 6, +1=7) back around to 0.
    cal_first_weekday = (_cal.weekday(now.year, now.month, 1) + 1) % 7
    cal_days_in_month = _cal.monthrange(now.year, now.month)[1]
    cal_month_label   = now.strftime("%B %Y")
    cal_today_day     = now.day

    return render_template(
        "dashboard.html",
        user                  = current_user,
        logged_in             = bool(user),
        wallpaper             = get_user_wallpaper(),
        fin_expense           = cur_expense,
        fin_change            = expense_change,
        fin_weeks             = week_expenses,
        fin_max_week          = max_week,
        fin_balance           = available_balance,
        fin_saved             = total_saved,
        fin_target            = total_target,
        fin_savings_pct       = savings_pct,
        cal_month_label       = cal_month_label,
        cal_first_weekday     = cal_first_weekday,
        cal_days_in_month     = cal_days_in_month,
        cal_today_day         = cal_today_day,
        cal_task_days         = cal_task_days,
        dash_today_tasks_count= dash_today_tasks_count,
    )

# ================= SHARED STATIC (global page-transition effect) =================
# ================= 共享静态文件（全局页面切换动画） =================

@app.route('/shared_static/<path:filename>')
def shared_static(filename):
    return send_from_directory(
        os.path.join(BASE_DIR, 'shared_static'),
        filename
    )

# ================= CALENDAR STATIC =================
# ================= 日历模块静态文件 =================

@app.route('/calendar_static/<path:filename>')
def calendar_static(filename):
    return send_from_directory(
        os.path.join('Calendar_Pages', 'static'),
        filename
    )

# ================= CALENDAR =================
# ================= 日历页面 =================

@app.route("/calendar")
def calendar():
    current_user = get_current_user()
    return render_template("mypage.html", user=current_user, logged_in="user" in session)

# ================= USER THEME API =================
# ================= 用户主题接口 =================

@app.route('/api/user-theme')
def api_user_theme():
    u = get_current_user()
    return jsonify({"theme": u.get("theme", "mocha") if u else "mocha"})

# ================= DIARY STATIC =================
# ================= 日记模块静态文件 =================

@app.route('/diary_static/<path:filename>')
def diary_static(filename):
    return send_from_directory(
        os.path.join('Diary_Pages', 'static'),
        filename
    )

@app.route('/profile_static/<path:filename>')
def profile_static(filename):
    return send_from_directory(
        os.path.join('Profile_Pages', 'static'),
        filename
    )

@app.route('/diary_home_static/<path:filename>')
def diary_home_static(filename):
    return send_from_directory(
        os.path.join('DiaryHomepage'),
        filename
    )

# Backward-compat: old widget decorations/layouts saved in localStorage
# before the Journal->Diary rename still point at this old path.
# 兼容旧版本：改名前（Journal -> Diary）保存在浏览器 localStorage 里的
# 旧数据，路径还是指向 "journal_home_static"，所以保留这个路由，
# 让旧数据依然能正常加载图片/资源，而不是突然全部失效。

@app.route('/journal_home_static/<path:filename>')
def journal_home_static_legacy(filename):
    return send_from_directory(
        os.path.join('DiaryHomepage'),
        filename
    )

# ================= CURRENT USER (for client-side localStorage namespacing) =================
# ================= 当前用户接口（供前端 localStorage 按用户区分数据使用） =================

@app.route('/api/whoami', methods=['GET'])
def whoami():
    return jsonify({"username": session.get("user", "")})

# ================= HOME LAYOUT (per-user, stored in users.json) =================
# ================= 首页布局接口（按用户保存，存在 users.json 里） =================

@app.route('/api/home-layout', methods=['GET'])
def get_home_layout():
    if "user" not in session:
        return jsonify({}), 401
    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return jsonify(u.get("home_layout", {}))
    return jsonify({})

@app.route('/api/home-layout', methods=['POST'])
def save_home_layout():
    if "user" not in session:
        return jsonify({"error": "not logged in"}), 401
    data = request.get_json() or {}
    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            u["home_layout"] = data
            break
    save_data(f_users, users)
    return jsonify({"ok": True})

# ================= TODAY PAGE =================
# ================= 今日页面 =================

@app.route("/today")
def today_page():
    user = session.get("user")
    current_user = get_current_user()

    f_expense  = os.path.join(BASE_DIR, "Finance", "expenses.json")
    f_budget   = os.path.join(BASE_DIR, "Finance", "budget.json")
    f_goals    = os.path.join(BASE_DIR, "goals.json")
    f_accounts = os.path.join(BASE_DIR, "Finance", "accounts.json")
    f_tasks    = os.path.join(BASE_DIR, "Calendar_Pages", "tasks.json")

    records     = load_data(f_expense, [])
    budgets     = load_data(f_budget, [])
    goals_list  = load_data(f_goals, [])
    accounts    = load_data(f_accounts, [])
    all_tasks   = load_data(f_tasks, [])

    now            = datetime.now()
    today_str      = now.strftime("%Y-%m-%d")
    yesterday_str  = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    current_month  = now.strftime("%Y-%m")

    user_records = [r for r in records if r.get("username") == user]

    today_txns   = [r for r in user_records
                    if r.get("date") == today_str
                    and r.get("type") == "expense"
                    and r.get("category") not in ("Transfer Out", "Goal Savings")]
    today_spending = sum(r.get("amount", 0) for r in today_txns)

    yest_spending  = sum(r.get("amount", 0) for r in user_records
                         if r.get("date") == yesterday_str
                         and r.get("type") == "expense"
                         and r.get("category") not in ("Transfer Out", "Goal Savings"))

    if yest_spending > 0:
        spending_change = round(((today_spending - yest_spending) / yest_spending) * 100)
    else:
        spending_change = 0

    month_expenses = [r for r in user_records
                      if r.get("date", "").startswith(current_month)
                      and r.get("type") == "expense"
                      and r.get("category") not in ("Transfer Out", "Goal Savings")]
    # 按分类把本月支出加总成一个字典，例如 {"Food": 120.5, "Transport": 40}。
    # category_totals.get(cat, 0) 是"如果这个分类还没出现过就当作 0"，
    # 这样第一次遇到某个分类时不会因为 KeyError 而报错。
    # Groups this month's spending into a dict by category, e.g.
    # {"Food": 120.5, "Transport": 40}. category_totals.get(cat, 0) means
    # "treat an unseen category as starting from 0", so the first time a
    # category shows up it doesn't raise a KeyError.
    category_totals = {}
    for r in month_expenses:
        cat = r.get("category", "Other")
        category_totals[cat] = category_totals.get(cat, 0) + r.get("amount", 0)

    user_budgets = [b for b in budgets if b.get("username") == user]
    budget_ok = True
    for b in user_budgets:
        spent = category_totals.get(b.get("category"), 0)
        limit = b.get("amount", 0)
        if limit > 0 and spent >= limit:
            # 只要有任何一个预算超支，整体状态就是"超支"——
            # 一旦发现就立刻 break，不用再检查剩下的预算了。
            # As soon as any single budget is over its limit, the overall
            # status is "over budget" — break immediately instead of
            # checking the rest, since the answer can no longer change.
            budget_ok = False
            break
    budget_status = "On Track" if budget_ok else "Over Budget"

    all_user_goals = [g for g in goals_list if g.get("username") == user]
    active_goals      = []
    goals_in_progress = 0

    for g in all_user_goals:
        saved  = sum(r.get("amount", 0) for r in user_records
                     if r.get("category") == "Goal Savings"
                     and r.get("goal_id") == g.get("id"))
        target = g.get("target", 0)
        pct    = min((saved / target) * 100, 100) if target else 0

        # 存的钱已经达到/超过目标时，就算数据库里状态还没手动改成
        # "Completed"，这里也动态当作已完成处理 —— 避免用户已经存够钱了
        # 却因为忘记手动标记而一直显示"进行中"。
        # If the saved amount already reaches/exceeds the target, treat the
        # goal as completed here even if its stored status hasn't been
        # manually changed to "Completed" yet — so a fully-funded goal
        # doesn't keep showing as "in progress" just because nobody
        # remembered to update its status.
        stored_status  = g.get("status") or "In Progress"
        dynamic_status = "Completed" if pct >= 100 else stored_status

        if dynamic_status not in ("Completed", "Cancelled"):
            goals_in_progress += 1
            if len(active_goals) < 3:
                # 这张卡片最多只展示 3 个进行中的目标（首页空间有限），
                # 但 goals_in_progress 计数器仍然统计全部数量。
                # This card only shows up to 3 in-progress goals (limited
                # space on the dashboard), but goals_in_progress still
                # counts every one of them.
                active_goals.append({
                    "name":    g.get("name"),
                    "saved":   saved,
                    "target":  target,
                    "percent": round(pct),
                })

    # Net savings: balance across all savings-purpose accounts (mirrors Finance page)
    user_accounts    = [a for a in accounts if a.get("username") == user]
    savings_acc_names = [a["name"] for a in user_accounts if a.get("purpose") == "savings"]
    net_savings = 0
    for acc in savings_acc_names:
        for r in user_records:
            if r.get("account") != acc:
                continue
            net_savings += r.get("amount", 0) if r.get("type") in ("income", "saving") else -r.get("amount", 0)

    # Diary entry for today / most recent
    f_journal = os.path.join(BASE_DIR, "journal.json")
    journal_entries = load_data(f_journal, [])
    today_str_diary = now.strftime("%d/%m/%Y")

    today_diary  = None
    recent_diary = None
    recent_dt    = datetime.min

    for _e in journal_entries:
        if _e.get("username") != user:
            continue
        if _e.get("date") == today_str_diary:
            today_diary = _e
        has = bool(_diary_text(_e.get("content", ""))) or bool((_e.get("mood") or "").strip())
        if has:
            dt = _parse_ddate(_e.get("date", ""))
            if dt > recent_dt:
                recent_dt    = dt
                recent_diary = _e

    # 优先展示今天写的日记；如果今天还没写，就退回去展示"最近一次
    # 有内容或心情的日记"，这样卡片不会因为今天还没写日记就一直空着。
    # Prefer today's diary entry; if there isn't one yet, fall back to
    # showing the most recent entry that actually has content or a mood
    # set, so the card isn't just empty on days you haven't written yet.
    _diary_display = today_diary or recent_diary
    _mood_images   = {
        "happy":   "/diary_home_static/assets/emotions/happy.png",
        "sad":     "/diary_home_static/assets/emotions/sad.png",
        "angry":   "/diary_home_static/assets/emotions/angry.png",
        "anxious": "/diary_home_static/assets/emotions/anxious.png",
        "unwell":  "/diary_home_static/assets/emotions/unwell.png",
    }
    diary_text        = _diary_text(_diary_display.get("content","")) if _diary_display else ""
    diary_mood        = (_diary_display.get("mood") or "").strip()    if _diary_display else ""
    diary_mood_emoji  = _mood_images.get(diary_mood.lower(), "")
    diary_topic       = (_diary_display.get("topic") or "").strip()   if _diary_display else ""
    diary_date        = _diary_display.get("date","")                  if _diary_display else ""
    diary_is_today    = today_diary is not None

    # Diary streak: consecutive days (ending today, or yesterday if today has no entry yet)
    diary_dates = set()
    for _e in journal_entries:
        if _e.get("username") != user:
            continue
        if not _diary_text(_e.get("content", "")):
            continue
        _dt = _parse_ddate(_e.get("date", ""))
        if _dt != datetime.min:
            diary_dates.add(_dt.strftime("%Y-%m-%d"))

    # 计算"连续写日记的天数"：从今天开始往前数；如果今天还没写，
    # 就从昨天开始数（不然还没到睡觉时间，连续记录就会被误判成中断了）。
    # 然后每往前一天，只要那天也有日记，计数就 +1，直到遇到没写的那天为止。
    # Calculates the current diary streak: start counting from today; but
    # if today has no entry yet, start from yesterday instead (otherwise
    # the streak would look broken just because the day isn't over yet).
    # Then walk backward one day at a time, incrementing the count as long
    # as each day has an entry, stopping at the first gap.
    _streak_day = now
    if _streak_day.strftime("%Y-%m-%d") not in diary_dates:
        _streak_day -= timedelta(days=1)
    diary_streak = 0
    while _streak_day.strftime("%Y-%m-%d") in diary_dates:
        diary_streak += 1
        _streak_day -= timedelta(days=1)

    # Today's calendar tasks: exact date match, not trashed
    _priority_order = {"red": 0, "orange": 1, "blue": 2, "gray": 3}
    today_tasks = [
        t for t in all_tasks
        if t.get("username") == user
        and t.get("status") != "trash"
        and t.get("date") == today_str
    ]
    # 排序规则是一个"元组"，Python 会按顺序依次比较元组里的每一项：
    # 1) 已完成的任务（1）排在未完成的（0）后面；
    # 2) 同样完成状态下，按优先级顺序（红→橙→蓝→灰，查不到的排最后）；
    # 3) 优先级相同再按开始时间排序（没有时间的当作空字符串，排最前）。
    # The sort key is a tuple — Python compares tuples item by item in
    # order: 1) completed tasks (1) sort after incomplete ones (0);
    # 2) within the same completion state, sort by priority (red > orange >
    # blue > gray, unknown priorities sort last); 3) tasks with equal
    # priority sort by start time (missing times treated as an empty
    # string, so they sort first).
    today_tasks.sort(key=lambda t: (
        1 if t.get("status") == "completed" else 0,
        _priority_order.get(t.get("priority"), 4),
        t.get("startTime") or ""
    ))

    return render_template(
        "today_page.html",
        today_spending   = today_spending,
        spending_change  = spending_change,
        today_txns       = today_txns,
        category_totals  = category_totals,
        budget_status    = budget_status,
        active_goals     = active_goals,
        goals_in_progress= goals_in_progress,
        net_savings      = net_savings,
        today_tasks      = today_tasks,
        user             = current_user,
        diary_text       = diary_text,
        diary_mood       = diary_mood,
        diary_mood_emoji = diary_mood_emoji,
        diary_topic      = diary_topic,
        diary_date       = diary_date,
        diary_is_today   = diary_is_today,
        diary_streak     = diary_streak,
        logged_in        = bool(user),
    )

# ================= RUN =================
# ================= 启动应用 =================

if __name__ == "__main__":
    app.run(debug=True)
