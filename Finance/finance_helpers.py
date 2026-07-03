import json
import os
from flask import session

# ================= BASE =================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ================= CATEGORY MAP =================
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

# ================= FILE PATHS =================
f_users = os.path.join(BASE_DIR, "users.json")

# ================= HELPERS =================
def load_data(file, default):
    """Load data from JSON file with fallback to default"""
    if not os.path.exists(file):
        return default
    try:
        with open(file, "r") as f:
            return json.load(f)
    except:
        return default

def save_data(file, data):
    """Save data to JSON file"""
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

def get_current_user():
    """Get current user object from session"""
    if "user" not in session:
        return None

    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return u
    return None
