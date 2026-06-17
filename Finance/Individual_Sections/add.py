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
    user=get_current_user(),
    )