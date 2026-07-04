import os
from flask import session
from db_store import load_data, save_data

# ================= BASE =================
# ================= 基础配置 =================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ================= CATEGORY MAP =================
# ================= 分类清单 =================

# 每种记录类型（收入/支出/储蓄）各自可以选的分类列表，
# 提供给新增/编辑记录的下拉选单使用。
# The list of selectable categories for each record type
# (income/expense/saving), used to populate the dropdown menus on the
# add/edit record forms.

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
# ================= 文件路径 =================

f_users = os.path.join(BASE_DIR, "users.json")

# ================= HELPERS =================
# ================= 辅助函数 =================

def get_current_user():
    """Get current user object from session"""
    if "user" not in session:
        return None

    users = load_data(f_users, [])
    for u in users:
        if u["username"] == session["user"]:
            return u
    return None
