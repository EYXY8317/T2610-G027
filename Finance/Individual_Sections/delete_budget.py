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

# =============== ARRAYS ==================
CATEGORY_MAP = {
    "income": ["Salary", "Freelance", "Business", "Gift", "Bonus"],
    "expense": ["Food", "Transport", "Entertainment", "Rent", "Education", "Travel"],
    "saving": ["Savings", "Investment", "Emergency Fund"]
}

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