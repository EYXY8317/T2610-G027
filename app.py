from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, jsonify
from Journal_Pages.diary_system.routes import diary_bp
from auth_routes import auth_bp
from Finance.finance_routes import finance_bp
from Calendar_Pages.calendar_routes import calendar_bp

import json
import os
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

    users = load_data(f_users, [])
    current_user = None

    for u in users:
        if u["username"] == session["user"]:
            current_user = u
            break

    return render_template(
        "dashboard.html",
        user=current_user,
        wallpaper=get_user_wallpaper(),
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
    return render_template("mypage.html")

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

    # Today's calendar tasks: exact date match OR daily repeat, not trashed
    today_tasks = [
        t for t in all_tasks
        if t.get("username") == user
        and t.get("status") != "trash"
        and (t.get("date") == today_str or t.get("repeat") == "daily")
    ]
    today_tasks.sort(key=lambda t: t.get("startTime") or "")

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
    )

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)
