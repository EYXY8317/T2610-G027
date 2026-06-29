from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, jsonify
from Journal_Pages.diary_system.routes import diary_bp
from auth_routes import auth_bp
from Finance.finance_routes import finance_bp
from Calendar_Pages.calendar_routes import calendar_bp

import json
import os
import re
from datetime import datetime, timedelta
from jinja2 import ChoiceLoader, FileSystemLoader

from Profile_Pages.profile_routes import register_profile_routes

# ================= BASE =================
BASE_DIR = os.path.dirname(__file__)

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "Finance", "static")
)

app.secret_key = "my_secret_key"

register_profile_routes(app)

# ================= TEMPLATE LOADER =================
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(BASE_DIR, "Finance", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Calendar_Pages", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Journal_Pages", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Profile_Pages", "templates")),
])

# ================= BLUEPRINTS =================
app.register_blueprint(diary_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(finance_bp)
app.register_blueprint(calendar_bp)

# ================= FILE PATHS =================
f_users = os.path.join(BASE_DIR, "users.json")

# ================= HELPERS =================
def load_data(file, default):
    if not os.path.exists(file):
        return default
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        return default

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

# ================= DASHBOARD =================
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]
    users = load_data(f_users, [])
    current_user = next((u for u in users if u["username"] == user), None)

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
        return sum(r.get("amount", 0) for r in user_records
                   if r.get("type") == "expense"
                   and r.get("category") not in ("Transfer Out", "Goal Savings")
                   and r.get("date", "").startswith(ym))

    cur_expense  = month_expense(cur_month)
    prev_expense = month_expense(prev_month)

    if prev_expense > 0:
        expense_change = round(((cur_expense - prev_expense) / prev_expense) * 100)
    else:
        expense_change = 0

    # Weekly breakdown (W1–W4) for current month
    week_expenses = [0, 0, 0, 0]
    for r in user_records:
        if r.get("type") != "expense": continue
        if r.get("category") in ("Transfer Out", "Goal Savings"): continue
        d = r.get("date", "")
        if not d.startswith(cur_month): continue
        day = int(d.split("-")[2])
        week_idx = min((day - 1) // 7, 3)
        week_expenses[week_idx] += r.get("amount", 0)

    max_week = max(week_expenses) if any(week_expenses) else 1

    # Available balance: net across all spending accounts
    user_accounts = [a for a in accounts if a.get("username") == user]
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
        total_saved  += min(saved, g.get("target", 0))
        total_target += g.get("target", 0)
    savings_pct = round((total_saved / total_target) * 100) if total_target else 0

    return render_template(
        "dashboard.html",
        user             = current_user,
        wallpaper        = get_user_wallpaper(),
        fin_expense      = cur_expense,
        fin_change       = expense_change,
        fin_weeks        = week_expenses,
        fin_max_week     = max_week,
        fin_balance      = available_balance,
        fin_saved        = total_saved,
        fin_target       = total_target,
        fin_savings_pct  = savings_pct,
    )

# ================= CALENDAR STATIC =================
@app.route('/calendar_static/<path:filename>')
def calendar_static(filename):
    return send_from_directory(
        os.path.join('Calendar_Pages', 'static'),
        filename
    )

# ================= CALENDAR =================
@app.route("/calendar")
def calendar():
    current_user = get_current_user()
    return render_template("mypage.html", user=current_user)

# ================= USER THEME API =================
@app.route('/api/user-theme')
def api_user_theme():
    u = get_current_user()
    return jsonify({"theme": u.get("theme", "mocha") if u else "mocha"})

# ================= DIARY STATIC =================
@app.route('/diary_static/<path:filename>')
def diary_static(filename):
    return send_from_directory(
        os.path.join('Journal_Pages', 'static'),
        filename
    )

@app.route('/profile_static/<path:filename>')
def profile_static(filename):
    return send_from_directory(
        os.path.join('Profile_Pages', 'static'),
        filename
    )

@app.route('/journal_home_static/<path:filename>')
def journal_home_static(filename):
    return send_from_directory(
        os.path.join('Journal_HomePages'),
        filename
    )

# ================= HOME LAYOUT (per-user, stored in users.json) =================
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
    with open(f_users, "w") as f:
        json.dump(users, f, indent=4)
    return jsonify({"ok": True})

# ================= TODAY PAGE =================
@app.route("/today")
def today_page():
    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]
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

        stored_status  = g.get("status") or "In Progress"
        dynamic_status = "Completed" if pct >= 100 else stored_status

        if dynamic_status not in ("Completed", "Cancelled"):
            goals_in_progress += 1
            if len(active_goals) < 3:
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

    def _diary_text(content):
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
                    text = re.sub(r"<[^>]+>", "", parsed.get("html", "")).strip()
                    if text:
                        texts.append(text)
            except Exception:
                text = re.sub(r"<[^>]+>", "", chunk).strip()
                if text:
                    texts.append(text)
        return " · ".join(texts)[:160]

    def _parse_ddate(ds):
        try:
            return datetime.strptime(ds, "%d/%m/%Y")
        except Exception:
            return datetime.min

    today_diary  = None
    recent_diary = None
    recent_dt    = datetime.min

    for _e in journal_entries:
        if _e.get("date") == today_str_diary:
            today_diary = _e
        has = bool(_diary_text(_e.get("content", ""))) or bool((_e.get("mood") or "").strip())
        if has:
            dt = _parse_ddate(_e.get("date", ""))
            if dt > recent_dt:
                recent_dt    = dt
                recent_diary = _e

    _diary_display = today_diary or recent_diary
    _mood_emojis   = {"Happy":"😊","Sad":"😢","Angry":"😠","Excited":"🤩","Anxious":"😰","Peaceful":"😌","Tired":"😴"}
    diary_text        = _diary_text(_diary_display.get("content","")) if _diary_display else ""
    diary_mood        = (_diary_display.get("mood") or "").strip()    if _diary_display else ""
    diary_mood_emoji  = _mood_emojis.get(diary_mood, "")
    diary_topic       = (_diary_display.get("topic") or "").strip()   if _diary_display else ""
    diary_date        = _diary_display.get("date","")                  if _diary_display else ""
    diary_is_today    = today_diary is not None

    # Today's calendar tasks: exact date match OR daily repeat, not trashed
    _priority_order = {"red": 0, "orange": 1, "blue": 2, "gray": 3}
    today_tasks = [
        t for t in all_tasks
        if t.get("username") == user
        and t.get("status") != "trash"
        and (t.get("date") == today_str or t.get("repeat") == "daily")
    ]
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
    )

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)
