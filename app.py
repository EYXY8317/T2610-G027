from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory
from Journal_Pages.diary_system.routes import diary_bp
from password_system.password_hashing import hash_password
from password_system.password_validation import is_valid_password

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

# ================= BLUEPRINT =================
app.register_blueprint(diary_bp)

# ================= FILE PATHS =================
f_expense = os.path.join(BASE_DIR, "Finance", "expenses.json")
f_budget = os.path.join(BASE_DIR, "Finance", "budget.json")
f_accounts = os.path.join(BASE_DIR, "Finance", "accounts.json")
f_users = os.path.join(BASE_DIR, "users.json")
f_goals = os.path.join(BASE_DIR, "goals.json")
# ================= HELPERS =================
def load_data(file, default):
    if not os.path.exists(file):
        return default
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        return default

def save_data(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

def get_user_wallpaper():

    if "user" not in session:
        return None

    users = load_data(f_users, [])

    for u in users:

        if u["username"] == session["user"]:

            return u.get("wallpaper")

    return None
# =============== ARRAYS ==================
CATEGORY_MAP = {
    "income": ["Salary", "Freelance", "Business", "Gift", "Bonus"],
    "expense": ["Food", "Transport", "Entertainment", "Rent", "Education", "Travel"],
    "saving": ["Savings", "Investment", "Emergency Fund"]
}

# ================= AUTH =================
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        users = load_data(f_users, [])

        username = request.form["username"]
        password = request.form["password"]

        if any(u["username"] == username for u in users):
            return render_template("register.html", error="Username exists")

        if not is_valid_password(password):
            return render_template("register.html", error="Weak password")

        users.append({
            "username": username,
            "password": hash_password(password),
            "email": request.form["email"],
            "security_question": request.form["question"],
            "security_answer": hash_password(request.form["answer"])
        })

        save_data(f_users, users)
        return redirect(url_for("login", success="Account created successfully"))

    return render_template("register.html")


@app.route("/", methods=["GET", "POST"])
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        users = load_data(f_users, [])

        username = request.form["username"]
        password = hash_password(request.form["password"])

        for u in users:
            if u["username"] == username and u["password"] == password:
                session["user"] = username
                return redirect(url_for("dashboard"))

        return render_template("login.html", error="Invalid login")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))


# ================= FORGOT =================
@app.route("/forgot_username", methods=["GET", "POST"])
def forgot_username():
    if request.method == "POST":
        email = request.form["email"]
        users = load_data(f_users, [])

        for u in users:
            if u["email"] == email:
                return render_template("forgot_username.html", result=u["username"])

        return render_template("forgot_username.html", error="Email not found")

    return render_template("forgot_username.html")


@app.route("/forgot", methods=["GET", "POST"])
def forgot_password():

    if request.method == "POST":
        username = request.form.get("username")
        question = request.form.get("question")
        answer = request.form.get("answer")

        users = load_data(f_users, [])

        for u in users:
            if u["username"] == username:

                if (
                    u.get("security_question") == question and
                    u.get("security_answer") == hash_password(answer)
                ):
                    session["reset_user"] = username
                    return redirect(url_for("reset_password"))

                else:
                    return render_template("forgot.html", error="Wrong question or answer")

        return render_template("forgot.html", error="User not found")

    return render_template("forgot.html")


@app.route("/reset", methods=["GET", "POST"])
def reset_password():

    if "reset_user" not in session:
        return redirect(url_for("forgot_password"))

    username = session["reset_user"]

    if request.method == "POST":
        new_password = request.form.get("password")

        users = load_data(f_users, [])

        for u in users:
            if u["username"] == username:
                u["password"] = hash_password(new_password)

        save_data(f_users, users)

        session.pop("reset_user", None)

        return redirect(url_for("login", success="Password reset successful"))

    return render_template("reset.html", username=username)


# ================= ADD =================
@app.route("/add", methods=["GET", "POST"])
def add_financial():
    if "user" not in session:
        return redirect(url_for("login"))

    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a["username"] == session["user"]]

    if request.method == "POST":
        form = request.form

        account = form.get("account")
        new_account = form.get("new_account")

        if new_account:
            account = new_account
            if not any(a["name"] == account for a in accounts):
                accounts.append({"username": session["user"], "name": account})
                save_data(f_accounts, accounts)

        if not account:
            return render_template("add.html", error="Account required", accounts=user_accounts)

        try:
            amount = float(form.get("amount"))
        except:
            return render_template("add.html", error="Invalid amount", accounts=user_accounts)

        record = {
            "username": session["user"],
            "date": form.get("date"),
            "type": form.get("type"),
            "category": form.get("category"),
            "account": account,
            "item": form.get("item"),
            "amount": amount
        }

        records = load_data(f_expense, [])
        records.append(record)
        save_data(f_expense, records)

        return redirect(url_for("view_financial"))

    return render_template(
    "add.html",
    accounts=user_accounts,
    categories=CATEGORY_MAP,
    wallpaper=get_user_wallpaper(),
    )

# ================= VIEW =================
@app.route("/view")
def view_financial():
    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session["user"]

    user_records = [r for r in records if r["username"] == user]
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    return render_template(
        "view.html",
        records=sorted_records,
        wallpaper=get_user_wallpaper(),
        )


# ================= DELETE =================
@app.route("/delete/<int:idx>")
def delete_financial(idx):
    records = load_data(f_expense, [])
    user = session["user"]

    user_records = [r for r in records if r["username"] == user]
    target = user_records[idx]

    records.remove(target)
    save_data(f_expense, records)

    return redirect(url_for("view_financial"))

# ================= UPDATE =================
@app.route("/update/<int:idx>", methods=["GET", "POST"])
def update_financial(idx):

    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session["user"]

    # filter user records
    user_records = [r for r in records if r["username"] == user]

    # sort (same as view)
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    if idx < 0 or idx >= len(sorted_records):
        return redirect(url_for("view_financial"))

    selected = sorted_records[idx]
    real_index = records.index(selected)
    record = records[real_index]

    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a["username"] == user]

    if request.method == "POST":

        form = request.form

        date = form.get("date") or record["date"]
        type_ = form.get("type") or record["type"]
        category = form.get("category") or record.get("category", "-")
        item = form.get("item") or record.get("item", "-")
        amount = form.get("amount") or record["amount"]

        account = form.get("account")
        new_account = form.get("new_account")

        # handle new account
        if new_account:
            account = new_account
            if not any(a["name"] == account and a["username"] == user for a in accounts):
                accounts.append({
                    "username": user,
                    "name": account
                })
                save_data(f_accounts, accounts)

        if not account:
            account = record.get("account", "Default")

        # validation
        try:
            amount = float(amount)
        except:
            return render_template(
                "update.html",
                record=record,
                accounts=user_accounts,
                error="Invalid amount"
            )

        # update record
        record["date"] = date
        record["type"] = type_
        record["category"] = category
        record["item"] = item
        record["account"] = account
        record["amount"] = amount

        save_data(f_expense, records)

        return redirect(url_for("view_financial"))

    return render_template(
        "update.html",
        record=record,
        accounts=user_accounts,
        wallpaper=get_user_wallpaper(),
    )

# ================= BUDGET =================
@app.route("/budget", methods=["GET", "POST"])
def budget():

    if "user" not in session:
        return redirect(url_for("login"))

    budgets = load_data(f_budget, [])
    user = session["user"]

    # ================= POST =================
    if request.method == "POST":

        category = request.form.get("category")
        amount = request.form.get("amount")

        # validation
        if not category or not amount:
            return render_template(
                "budget.html",
                budgets=[b for b in budgets if b["username"] == user],
                categories=CATEGORY_MAP["expense"],
                error="Category and amount required"
            )

        try:
            amount = float(amount)
        except:
            return render_template(
                "budget.html",
                budgets=[b for b in budgets if b["username"] == user],
                categories=CATEGORY_MAP["expense"],
                error="Invalid amount"
            )

        # update existing budget
        found = False

        for b in budgets:
            if b["username"] == user and b["category"] == category:
                b["amount"] = amount
                found = True
                break

        # create new budget
        if not found:
            budgets.append({
                "username": user,
                "category": category,
                "amount": amount
            })

        save_data(f_budget, budgets)

        return redirect(url_for("budget"))

    # ================= GET =================
    user_budgets = [b for b in budgets if b["username"] == user]

    return render_template(
        "budget.html",
        budgets=user_budgets,
        categories=CATEGORY_MAP["expense"],
        wallpaper=get_user_wallpaper(),
    )

# ===============DELETE BUDGET ==============

@app.route("/delete_budget/<category>")
def delete_budget(category):

    if "user" not in session:
        return redirect(url_for("login"))

    budgets = load_data(f_budget, [])
    user = session["user"]

    budgets = [
        b for b in budgets
        if not (
            b["username"] == user and
            b["category"] == category
        )
    ]

    save_data(f_budget, budgets)

    return redirect(url_for("budget"))

# ================= SUMMARY =================
@app.route("/summary")
def summary():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    records = load_data(f_expense, [])

    now = datetime.now()

    # ================= FILTERS =================
    selected_month = request.args.get(
        "month",
        now.strftime("%m")
    )

    selected_year = request.args.get(
        "year",
        now.strftime("%Y")
    )

    current_month = f"{selected_year}-{selected_month}"

    # ================= MONTH RECORDS =================
    month_records = [

        r for r in records

        if (
            r["username"] == user
            and r["date"].startswith(current_month)
        )

    ]

    # ================= YEAR RECORDS =================
    year_records = [

        r for r in records

        if (
            r["username"] == user
            and r["date"].startswith(selected_year)
        )

    ]

    # ================= MONTH TOTALS =================
    income = sum(
        r["amount"]
        for r in month_records
        if r["type"] == "income"
    )

    expense = sum(
        r["amount"]
        for r in month_records
        if r["type"] == "expense"
    )

    saving = sum(
        r["amount"]
        for r in month_records
        if r["type"] == "saving"
    )

    balance = income - expense

    # ================= CATEGORY TOTALS =================
    category_totals = {}

    for r in month_records:

        if r["type"] == "expense":
            category = r.get(
                "category",
                "Other"
            )

            category_totals[category] = (
                category_totals.get(category, 0)
                + r["amount"]
            )

    total_expense = sum(category_totals.values())

    # ================= TOP CATEGORIES =================
    top_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1],
        reverse=True

    )[:3]

    top_categories_with_percent = [
        (
            c,
            a,
            (a / total_expense * 100)
            if total_expense else 0
        )

        for c, a in top_categories
    ]

    # ================= SMART INSIGHT =================
    insight = "Your spending looks stable this month."

    if top_categories:

        top_cat = top_categories[0][0]
        top_amt = top_categories[0][1]

        insight = (
            f"Most spending comes from "
            f"{top_cat} "
            f"(RM {top_amt:.2f})."
        )

    if expense == 0:
        insight = "No expenses recorded this month."

    if balance < 0:
        insight += " You are spending more than you earn."

    # ================= COMPARISON =================
    comparison = "No income recorded yet."

    if income > 0:
        expense_ratio = (
            expense / income
        ) * 100

        comparison = (
            f"Expenses are "
            f"{expense_ratio:.0f}% "
            f"of income this month."
        )

    # ================= BUDGET TRACKING =================
    budgets = load_data(f_budget, [])

    user_budgets = [
        b for b in budgets
        if b["username"] == user
    ]

    budget_usage = []
    for b in user_budgets:
        spent = category_totals.get(
            b["category"],
            0
        )

        limit = b["amount"]
        percent = (
            (spent / limit) * 100
            if limit else 0
        )

        remaining = limit - spent
        status = "safe"
        if percent >= 100:
            status = "over"
        elif percent >= 80:
            status = "warning"

        budget_usage.append({
            "category": b["category"],
            "spent": spent,
            "limit": limit,
            "remaining": remaining,
            "percent": percent,
            "display_percent": min(percent, 100),
            "status": status
        })

    # ================= YEARLY TOTALS =================
    yearly_income = sum(
        r["amount"]
        for r in year_records
        if r["type"] == "income"
    )
    yearly_expense = sum(
        r["amount"]
        for r in year_records
        if r["type"] == "expense"
    )
    yearly_balance = yearly_income - yearly_expense

    # ================= MONTHLY BREAKDOWN =================
    monthly_data = {}
    for month in range(1, 13):
        key = f"{selected_year}-{month:02d}"
        monthly_income = sum(
            r["amount"]
            for r in year_records
            if (
                r["type"] == "income"
                and r["date"].startswith(key)
            )
        )
        monthly_expense = sum(
            r["amount"]
            for r in year_records
            if (
                r["type"] == "expense"
                and r["date"].startswith(key)
            )
        )
        monthly_data[key] = {
            "income": monthly_income,
            "expense": monthly_expense,
            "balance": monthly_income - monthly_expense
        }

    # ================= GOALS =================
    goals = load_data(f_goals, [])

    user_goals = [
        g for g in goals
        if g["username"] == user
    ]

    short_goals = []
    long_goals = []

    for g in user_goals:
        saved = saving

        percent = (
            (saved / g["target"]) * 100
            if g["target"] else 0
        )

        remaining_goal = g["target"] - saved

        status = "In Progress"

        if percent >= 100:
            status = "Completed"

        goal_data = {
            "name": g["name"],
            "target": g["target"],
            "saved": saved,
            "remaining": remaining_goal,
            "percent": percent,
            "display_percent": min(percent, 100),
            "status": status
        }

        if g["type"] == "short":
            short_goals.append(goal_data)

        else:
            long_goals.append(goal_data)

        year_income = sum(
        r["amount"]
        for r in year_records
        if r["type"] == "income"
    )

    year_expense = sum(
        r["amount"]
        for r in year_records
        if r["type"] == "expense"
    )

    year_balance = year_income - year_expense

    # ================= RENDER =================
    return render_template(
        "summary.html",
        income=income,
        expense=expense,
        saving=saving,
        balance=balance,
        year_income=year_income,
        year_expense=year_expense,
        year_balance=year_balance,
        daily_avg=round(
            expense / max(now.day, 1),
            2
        ),
        top_categories=top_categories_with_percent,
        insight=insight,
        comparison=comparison,
        budget_usage=budget_usage,
        yearly_income=yearly_income,
        yearly_expense=yearly_expense,
        yearly_balance=yearly_balance,
        monthly_data=monthly_data,
        selected_month=selected_month,
        selected_year=selected_year,
        short_goals=short_goals,
        long_goals=long_goals,
        wallpaper=get_user_wallpaper(),
    )

#================= GOALS ==================
@app.route("/goals", methods=["GET", "POST"])
def goals():

    # ================= LOGIN CHECK =================
    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    goals = load_data(f_goals, [])

    # ================= CREATE GOAL =================
    if request.method == "POST":

        action = request.form.get("action")

        # ================= CREATE NEW GOAL =================
        if action == "create":

            name = request.form.get("name")
            target = request.form.get("target")
            goal_type = request.form.get("type")

            if not name or not target or not goal_type:

                return render_template(
                    "goals.html",
                    goals=[
                        g for g in goals
                        if g["username"] == user
                    ],
                    error="All fields required"
                )

            try:
                target = float(target)

            except:

                return render_template(
                    "goals.html",
                    goals=[
                        g for g in goals
                        if g["username"] == user
                    ],
                    error="Invalid target amount"
                )

            goals.append({
                "username": user,
                "name": name,
                "target": target,
                "saved": 0,
                "type": goal_type
            })

            save_data(f_goals, goals)

            return redirect(url_for("goals"))

        # ================= ADD SAVINGS =================
        elif action == "save":

            goal_name = request.form.get("goal_name")
            amount = request.form.get("amount")

            try:
                amount = float(amount)

            except:
                return redirect(url_for("goals"))

            for g in goals:

                if (
                    g["username"] == user
                    and g["name"] == goal_name
                ):
                    g["saved"] += amount
                    break

            save_data(f_goals, goals)

            return redirect(url_for("goals"))

    # ================= USER GOALS =================
    user_goals = [
        g for g in goals
        if g["username"] == user
    ]

    # ================= PROCESS GOALS =================
    short_goals = []
    long_goals = []

    for g in user_goals:

        saved = g.get("saved", 0)
        target = g.get("target", 0)
        percent = (
            (saved / target) * 100
            if target else 0
        )

        remaining = target - saved
        status = "In Progress"

        if percent >= 100:
            status = "Completed"

        goal_data = {
            "name": g["name"],
            "target": target,
            "saved": saved,
            "remaining": remaining,
            "percent": percent,
            "display_percent": min(percent, 100),
            "status": status
        }

        if g.get("type") == "short":
            short_goals.append(goal_data)

        else:
            long_goals.append(goal_data)

    # ================= RENDER =================
    return render_template(

        "goals.html",
        short_goals=short_goals,
        long_goals=long_goals,
        wallpaper=get_user_wallpaper(),

    )

# ================= DASHBOARD =================
@app.route("/dashboard")
def dashboard():

    if "user" not in session:
        return redirect(url_for("login"))

    return render_template("dashboard.html")

# ================= CALENDAR =================
@app.route('/calendar_static/<path:filename>')
def calendar_static(filename):
    return send_from_directory(
        os.path.join('Calendar_Pages', 'static'),
        filename
    )

@app.route("/calendar")
def calendar():
    return render_template("mypage.html")

# ================= DIARY ===================
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

@app.route("/diary")
def diary():
    return render_template("diary.html")

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)