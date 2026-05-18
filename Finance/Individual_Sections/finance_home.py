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

@app.route("/finance")
def finance_home():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    current_user = get_current_user()

    records = load_data(f_expense, [])

    budgets = load_data(f_budget, [])

    goals = load_data(f_goals, [])

    now = datetime.now()

    current_month = now.strftime("%Y-%m")

    # =================================================
    # USER RECORDS
    # =================================================

    user_records = [

        r for r in records

        if r.get("username") == user

    ]

    month_records = [

        r for r in user_records

        if r.get("date", "").startswith(current_month)

    ]

    # =================================================
    # TOTALS
    # =================================================

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

    # =================================================
    # RECENT RECORDS
    # =================================================

    recent_records = sorted(

        user_records,

        key=lambda x: x.get("date", ""),

        reverse=True

    )[:5]

    # =================================================
    # TOP CATEGORY
    # =================================================

    category_totals = {}

    for r in month_records:

        if r.get("type") == "expense":

            cat = r.get("category", "Other")

            category_totals[cat] = (

                category_totals.get(cat, 0)

                + r.get("amount", 0)

            )

    top_category = None

    if category_totals:

        top_category = max(

            category_totals,

            key=category_totals.get

        )

    # =================================================
    # BUDGET STATUS
    # =================================================

    user_budgets = [

        b for b in budgets

        if b.get("username") == user

    ]

    warning_budgets = []

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

        if percent >= 80:

            warning_budgets.append({

                "category": b.get("category"),

                "percent": percent

            })

    # =================================================
    # GOALS
    # =================================================

    user_goals = [

        g for g in goals

        if g.get("username") == user

    ]

    active_goals = []

    for g in user_goals:

        saved = g.get("saved", 0)

        target = g.get("target", 0)

        percent = (

            (saved / target) * 100

            if target else 0

        )

        active_goals.append({

            "name": g.get("name"),

            "saved": saved,

            "target": target,

            "percent": min(percent, 100)

        })

    # =================================================
    # RENDER
    # =================================================

    return render_template(

        "finance.html",

        income=income,

        expense=expense,

        saving=saving,

        balance=balance,

        top_category=top_category,

        warning_budgets=warning_budgets,

        active_goals=active_goals,

        recent_records=recent_records,

        wallpaper=get_user_wallpaper(),

        user=get_current_user(),

        theme=current_user.get("theme", "adaptive"),

        ui_style=current_user.get("ui_style", "premium"),
    )