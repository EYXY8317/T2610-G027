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

def get_current_user():

    if "user" not in session:
        return None

    users = load_data(f_users, [])

    for u in users:

        if u["username"] == session["user"]:

            return u

    return None

# =============== ARRAYS ==================
CATEGORY_MAP = {

    "income": [
        "Salary",
        "Freelance",
        "Business",
        "Gift",
        "Bonus"
    ],

    "expense": [
        "Food",
        "Transport",
        "Travel",
        "Entertainment",
        "Rent",
        "Education"
    ],

    "saving": [
        "Savings",
        "Investment",
        "Emergency Fund"
    ]
}

# ----------
# ROUTES
# ----------

# "@" attaches this function to something
# app.route is a flask function that defines a URL
# "/" is the root URL
# url_for("add_financial") is a flask helper function; helps find the URL of a function
# redirect sends the user to the specific page
@app.route("/")
def home():
    return redirect(url_for("login"))

@app.route("/summary")
def summary():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    records = load_data(f_expense, [])

    now = datetime.now()

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
            r.get("username") == user
            and r.get("date", "").startswith(current_month)
        )

    ]

    # ================= YEAR RECORDS =================
    year_records = [

        r for r in records

        if (
            r.get("username") == user
            and r.get("date", "").startswith(selected_year)
        )

    ]

    # ================= TOTALS =================
    income = sum(
        r.get("amount", 0)
        for r in month_records
        if r.get("type") == "income"
    )

    expense = sum(
        r.get("amount", 0)
        for r in month_records
        if r.get("type") == "expense"
    )

    saving = sum(
        r.get("amount", 0)
        for r in month_records
        if r.get("type") == "saving"
    )

    balance = income - expense

    # ================= CATEGORY TOTALS =================
    category_totals = {}

    for r in month_records:

        if r.get("type") == "expense":

            category = r.get(
                "category",
                "Other"
            )

            category_totals[category] = (
                category_totals.get(category, 0)
                + r.get("amount", 0)
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

    # ================= INSIGHT =================
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

    # ================= BUDGET =================
    budgets = load_data(f_budget, [])

    user_budgets = [

        b for b in budgets

        if b.get("username") == user

    ]

    budget_usage = []

    for b in user_budgets:

        spent = category_totals.get(
            b.get("category"),
            0
        )

        limit = b.get("amount", 0)

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

            "category": b.get("category"),

            "spent": spent,

            "limit": limit,

            "remaining": remaining,

            "percent": percent,

            "display_percent": min(percent, 100),

            "status": status

        })

    # ================= YEAR TOTALS =================
    yearly_income = sum(
        r.get("amount", 0)
        for r in year_records
        if r.get("type") == "income"
    )

    yearly_expense = sum(
        r.get("amount", 0)
        for r in year_records
        if r.get("type") == "expense"
    )

    yearly_balance = yearly_income - yearly_expense

    # ================= MONTHLY DATA =================
    monthly_data = {}

    for month in range(1, 13):

        key = f"{selected_year}-{month:02d}"

        monthly_income = sum(

            r.get("amount", 0)

            for r in year_records

            if (
                r.get("type") == "income"
                and r.get("date", "").startswith(key)
            )

        )

        monthly_expense = sum(

            r.get("amount", 0)

            for r in year_records

            if (
                r.get("type") == "expense"
                and r.get("date", "").startswith(key)
            )

        )

        monthly_data[key] = {

            "income": monthly_income,

            "expense": monthly_expense,

            "balance": monthly_income - monthly_expense

        }

    # ================= GOALS =================
    goals_data = load_data(f_goals, [])

    user_goals = [

        g for g in goals_data

        if g.get("username") == user

    ]

    short_goals = []
    long_goals = []

    for g in user_goals:

        saved = g.get("saved", 0)

        target = g.get("target", 0)

        percent = (
            (saved / target) * 100
            if target else 0
        )

        remaining_goal = target - saved

        status = "In Progress"

        if percent >= 100:
            status = "Completed"

        goal_data = {

            "id": g.get("id"),

            "name": g.get("name"),

            "target": target,

            "saved": saved,

            "remaining": remaining_goal,

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

        "summary.html",

        income=income,

        expense=expense,

        saving=saving,

        balance=balance,

        daily_avg=round(
            expense / max(now.day, 1),
            2
        ),

        top_categories=top_categories_with_percent,

        insight=insight,

        comparison=comparison,

        budget_usage=budget_usage,

        year_income=yearly_income,

        year_expense=yearly_expense,

        year_balance=yearly_balance,

        monthly_data=monthly_data,

        selected_month=selected_month,

        selected_year=selected_year,

        short_goals=short_goals,

        long_goals=long_goals,

        wallpaper=get_user_wallpaper(),

        user=get_current_user(),

    )