import os
from flask import session
from db_store import load_data, save_data

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
        "Bills",
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
def get_current_user():
    """Get current user object from session"""
    if "user" not in session:
        return None

    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return u
    return None
