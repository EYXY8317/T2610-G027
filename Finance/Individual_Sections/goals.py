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

@app.route("/goals", methods=["GET", "POST"])
def goals():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    goals = load_data(f_goals, [])

    # ================= CREATE / SAVE =================
    if request.method == "POST":

        action = request.form.get("action")

        # ===== CREATE GOAL =====
        if action == "create":

            name = request.form.get("name")
            target = request.form.get("target")
            goal_type = request.form.get("type")

            if not name or not target or not goal_type:

                return render_template(
                    "goals.html",
                    short_goals=[],
                    long_goals=[],
                    error="All fields required",
                    wallpaper=get_user_wallpaper(),
                )

            try:
                target = float(target)

            except:

                return render_template(
                    "goals.html",
                    short_goals=[],
                    long_goals=[],
                    error="Invalid target amount",
                    wallpaper=get_user_wallpaper(),
                )

            # ===== CREATE ID =====
            new_id = 1

            if goals:
                new_id = max(
                    [g.get("id", 0) for g in goals],
                    default=0
                ) + 1

            # ===== SAVE GOAL =====
            goals.append({

                "id": new_id,

                "username": user,

                "name": name,

                "type": goal_type,

                "target": target,

                "saved": 0
            })

            save_data(f_goals, goals)

            return redirect(url_for("goals"))

        # ===== SAVE MONEY INTO GOAL =====
        elif action == "save":

            goal_name = request.form.get("goal_name")
            amount = request.form.get("amount")

            try:
                amount = float(amount)

            except:
                return redirect(url_for("goals"))

            for g in goals:

                if (
                    g.get("username") == user
                    and g.get("name") == goal_name
                ):

                    g["saved"] = g.get("saved", 0) + amount
                    break

            save_data(f_goals, goals)

            return redirect(url_for("goals"))

    # ================= FILTER USER GOALS =================
    user_goals = [

        g for g in goals

        if g.get("username") == user

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

            "id": g.get("id"),

            "name": g.get("name"),

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