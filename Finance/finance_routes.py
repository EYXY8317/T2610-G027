from flask import Blueprint, render_template, request, redirect, url_for, session
import json
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from .finance_helpers import (
    load_data, save_data, get_user_wallpaper, get_current_user,
    CATEGORY_MAP, BASE_DIR
)

finance_bp = Blueprint('finance', __name__, url_prefix='')

# ================= FILE PATHS =================
f_expense = os.path.join(BASE_DIR, "Finance", "expenses.json")
f_budget = os.path.join(BASE_DIR, "Finance", "budget.json")
f_accounts = os.path.join(BASE_DIR, "Finance", "accounts.json")
f_users = os.path.join(BASE_DIR, "users.json")
f_goals = os.path.join(BASE_DIR, "goals.json")

RECEIPTS_DIR = os.path.join(BASE_DIR, "Finance", "static", "receipts")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def _save_receipt(file, username):
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    filename = f"{username}_{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(RECEIPTS_DIR, filename))
    return filename

def _delete_receipt(filename):
    if filename:
        path = os.path.join(RECEIPTS_DIR, filename)
        if os.path.exists(path):
            os.remove(path)

# ================= ADD =================
@finance_bp.route("/add", methods=["GET", "POST"])
def add_financial():
    if "user" not in session:
        return redirect(url_for("auth.login"))
    
    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a["username"] == session["user"]]

    if request.method == "POST":
        form = request.form
        template_data = {
            "accounts": user_accounts,
            "categories": CATEGORY_MAP,
            "wallpaper": get_user_wallpaper(),
            "user": get_current_user(),
            "form_data": form
        }
        
        account = form.get("account")
        new_account = form.get("new_account")
        purpose = form.get("purpose", "spending")

        if new_account:
            account = new_account
            if not any(a["name"] == account and a["username"] == session["user"] for a in accounts):
                accounts.append({
                    "username": session["user"],
                    "name": account,
                    "purpose": purpose
                })
                save_data(f_accounts, accounts)

        if not account:
            return render_template("add.html", error="Account required", **template_data)

        amount_raw = form.get("amount")
        if not amount_raw:
            return render_template("add.html", error="Amount is required", **template_data)

        try:
            amount = float(amount_raw)
            if amount <= 0:
                raise ValueError
        except:
            return render_template("add.html", error="Amount must be greater than 0", **template_data)

        if form.get("type") == "transfer":
            to_account = form.get("to_account")
            if not to_account:
                return render_template("add.html", error="Transfer account required", **template_data)

            records = load_data(f_expense, [])
            records.append({
                "username": session["user"],
                "date": form.get("date"),
                "type": "expense",
                "category": "Transfer Out",
                "account": account,
                "item": f"Transfer to {to_account}",
                "amount": amount
            })
            records.append({
                "username": session["user"],
                "date": form.get("date"),
                "type": "income",
                "category": "Transfer In",
                "account": to_account,
                "item": f"Transfer from {account}",
                "amount": amount
            })
            save_data(f_expense, records)
            return redirect(url_for("finance.view_financial"))

        receipt_file = request.files.get("receipt")
        receipt_filename = None
        if receipt_file and receipt_file.filename and _allowed_file(receipt_file.filename):
            receipt_filename = _save_receipt(receipt_file, session["user"])

        record = {
            "username": session["user"],
            "date": form.get("date"),
            "type": form.get("type"),
            "category": form.get("category"),
            "account": account,
            "item": form.get("item"),
            "amount": amount,
            "receipt": receipt_filename
        }

        records = load_data(f_expense, [])
        records.append(record)
        save_data(f_expense, records)
        return redirect(url_for("finance.view_financial"))

    return render_template(
        "add.html",
        accounts=user_accounts,
        categories=CATEGORY_MAP,
        wallpaper=get_user_wallpaper(),
        user=get_current_user()
    )

# ================= VIEW =================
@finance_bp.route("/view")
def view_financial():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    records = load_data(f_expense, [])
    accounts = load_data(f_accounts, [])

    user_records = [r for r in records if r["username"] == user]
    selected_account = request.args.get("account")

    if selected_account and selected_account != "All Accounts":
        user_records = [r for r in user_records if r.get("account") == selected_account]

    start = request.args.get("start")
    end = request.args.get("end")

    if start and end:

        user_records = [

            r for r in user_records

            if start <= r["date"] <= end

        ]

    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)
    user_accounts = [a for a in accounts if a["username"] == user]

    return render_template(
        "view.html",
        records=sorted_records,
        accounts=user_accounts,
        selected_account=selected_account,
        wallpaper=get_user_wallpaper(),
        user=get_current_user(),
    )

# ================= DELETE =================
@finance_bp.route("/delete/<int:idx>")
def delete_financial(idx):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    records = load_data(f_expense, [])
    user = session["user"]
    user_records = [r for r in records if r["username"] == user]

    if idx < 0 or idx >= len(user_records):
        return redirect(url_for("finance.view_financial"))

    target = user_records[idx]
    _delete_receipt(target.get("receipt"))
    records.remove(target)
    save_data(f_expense, records)
    return redirect(url_for("finance.view_financial"))

# ================= UPDATE =================
@finance_bp.route("/update/<int:idx>", methods=["GET", "POST"])
def update_financial(idx):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    records = load_data(f_expense, [])
    user = session["user"]
    user_records = [r for r in records if r["username"] == user]
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    if idx < 0 or idx >= len(sorted_records):
        return redirect(url_for("finance.view_financial"))

    selected = sorted_records[idx]
    real_index = records.index(selected)
    record = records[real_index]

    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a["username"] == user]

    if request.method == "POST":
        form = request.form
        purpose = form.get("purpose", "spending")
        date = form.get("date") or record["date"]
        type_ = form.get("type") or record["type"]
        category = form.get("category") or record.get("category", "-")
        item = form.get("item") or record.get("item", "-")
        amount_raw = form.get("amount")

        if not amount_raw:
            return render_template("update.html", record=record, accounts=user_accounts, error="Amount is required")

        try:
            amount = float(amount_raw)
            if amount <= 0:
                raise ValueError
        except:
            return render_template("update.html", record=record, accounts=user_accounts, error="Amount must be greater than 0")

        account = form.get("account")
        new_account = form.get("new_account")

        if new_account:
            account = new_account
            if not any(a["name"] == account and a["username"] == user for a in accounts):
                accounts.append({
                    "username": user,
                    "name": account,
                    "purpose": "spending"
                })
                save_data(f_accounts, accounts)

        if not account:
            account = record.get("account", "Default")

        receipt_file = request.files.get("receipt")
        if receipt_file and receipt_file.filename and _allowed_file(receipt_file.filename):
            _delete_receipt(record.get("receipt"))
            record["receipt"] = _save_receipt(receipt_file, user)

        record["date"] = date
        record["type"] = type_
        record["category"] = category
        record["item"] = item
        record["account"] = account
        record["amount"] = amount

        save_data(f_expense, records)
        return redirect(url_for("finance.view_financial"))

    return render_template(
        "update.html",
        record=record,
        accounts=user_accounts,
        wallpaper=get_user_wallpaper(),
        user=get_current_user(),
    )

# ================= BUDGET =================
@finance_bp.route("/budget", methods=["GET", "POST"])
def budget():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    budgets = load_data(f_budget, [])
    user = session["user"]

    if request.method == "POST":
        category = request.form.get("category")
        amount = request.form.get("amount")

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

        found = False
        for b in budgets:
            if b["username"] == user and b["category"] == category:
                b["amount"] = amount
                found = True
                break

        if not found:
            budgets.append({
                "username": user,
                "category": category,
                "amount": amount
            })

        save_data(f_budget, budgets)
        return redirect(url_for("finance.budget"))

    user_budgets = [b for b in budgets if b["username"] == user]
    return render_template(
        "budget.html",
        budgets=user_budgets,
        categories=CATEGORY_MAP["expense"],
        wallpaper=get_user_wallpaper(),
        user=get_current_user(),
    )

# ================= EDIT BUDGET =================
@finance_bp.route("/edit_budget/<category>", methods=["GET", "POST"])
def edit_budget(category):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    budgets = load_data(f_budget, [])
    budget = next((b for b in budgets if b["username"] == session["user"] and b["category"] == category), None)

    if not budget:
        return redirect(url_for("finance.budget"))

    if request.method == "POST":
        budget["amount"] = float(request.form.get("amount"))
        save_data(f_budget, budgets)
        return redirect(url_for("finance.budget"))

    return render_template(
        "edit_budget.html",
        budget=budget,
        wallpaper=get_user_wallpaper(),
        user=get_current_user()
    )

# ================= DELETE BUDGET =================
@finance_bp.route("/delete_budget/<category>")
def delete_budget(category):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    budgets = load_data(f_budget, [])
    user = session["user"]
    budgets = [b for b in budgets if not (b["username"] == user and b["category"] == category)]
    save_data(f_budget, budgets)
    return redirect(url_for("finance.budget"))

# ================= SUMMARY =================
@finance_bp.route("/summary")
def summary():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    records = load_data(f_expense, [])
    now = datetime.now()

    selected_month = request.args.get("month", now.strftime("%m"))
    selected_year = request.args.get("year", now.strftime("%Y"))
    current_month = f"{selected_year}-{selected_month}"

    month_records = [r for r in records if r.get("username") == user and r.get("date", "").startswith(current_month)]
    year_records = [r for r in records if r.get("username") == user and r.get("date", "").startswith(selected_year)]

    income = sum(r["amount"] for r in month_records if r["type"] == "income" and r.get("category") != "Transfer In")
    expense = sum(r["amount"] for r in month_records if r["type"] == "expense" and r.get("category") != "Transfer Out")
    balance = income - expense

    category_totals = {}
    for r in month_records:
        if r.get("type") == "expense" and r.get("category") != "Transfer Out":
            category = r.get("category", "Other")
            category_totals[category] = category_totals.get(category, 0) + r.get("amount", 0)

    total_expense = sum(category_totals.values())
    top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]
    top_categories_with_percent = [(c, a, (a / total_expense * 100) if total_expense else 0) for c, a in top_categories]

    insight = "Your spending looks stable this month."
    if top_categories:
        top_cat, top_amt = top_categories[0]
        insight = f"Most spending comes from {top_cat} (RM {top_amt:.2f})."
    if expense == 0:
        insight = "No expenses recorded this month."
    if balance < 0:
        insight += " You are spending more than you earn."

    comparison = "No income recorded yet."
    if income > 0:
        expense_ratio = (expense / income) * 100
        comparison = f"Expenses are {expense_ratio:.0f}% of income this month."

    budgets = load_data(f_budget, [])
    user_budgets = [b for b in budgets if b.get("username") == user]
    budget_usage = []

    for b in user_budgets:
        spent = category_totals.get(b.get("category"), 0)
        limit = b.get("amount", 0)
        percent = (spent / limit) * 100 if limit else 0
        remaining = limit - spent
        status = "safe" if percent < 80 else ("warning" if percent < 100 else "over")
        budget_usage.append({
            "category": b.get("category"),
            "spent": spent,
            "limit": limit,
            "remaining": remaining,
            "percent": percent,
            "display_percent": min(percent, 100),
            "status": status
        })

    yearly_income = sum(r.get("amount", 0) for r in year_records if r.get("type") == "income" and r.get("category") != "Transfer In")
    yearly_expense = sum(r.get("amount", 0) for r in year_records if r.get("type") == "expense" and r.get("category") != "Transfer Out")
    yearly_balance = yearly_income - yearly_expense

    monthly_data = {}
    for month in range(1, 13):
        key = f"{selected_year}-{month:02d}"
        monthly_income = sum(r.get("amount", 0) for r in year_records if r.get("type") == "income" and r.get("category") != "Transfer In" and r.get("date", "").startswith(key))
        monthly_expense = sum(r.get("amount", 0) for r in year_records if r.get("type") == "expense" and r.get("category") != "Transfer Out" and r.get("date", "").startswith(key))
        monthly_data[key] = {
            "income": monthly_income,
            "expense": monthly_expense,
            "balance": monthly_income - monthly_expense
        }

    goals_data = load_data(f_goals, [])
    user_goals = [g for g in goals_data if g.get("username") == user]
    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a.get("username") == user]

    saving = 0
    savings_accounts = [a["name"] for a in user_accounts if a.get("purpose") == "savings"]
    for acc in savings_accounts:
        balance_acc = 0
        for r in records:
            if r.get("username") != user or r.get("account") != acc:
                continue
            if r.get("type") == "income":
                balance_acc += r.get("amount", 0)
            elif r.get("type") == "expense":
                balance_acc -= r.get("amount", 0)
        saving += balance_acc

    short_goals, long_goals = [], []
    for g in user_goals:
        saved = sum(r.get("amount", 0) for r in records if r.get("username") == user and r.get("category") == "Goal Savings" and r.get("goal_id") == g["id"])
        target = g.get("target", 0)
        percent = (saved / target) * 100 if target else 0
        remaining_goal = target - saved
        status = "Completed" if percent >= 100 else "In Progress"
        goal_data = {
            "id": g.get("id"),
            "name": g.get("name"),
            "target": target,
            "saved": saved,
            "remaining": remaining_goal,
            "percent": percent,
            "display_percent": min(percent, 100),
            "status": status,
            "goal_type": g.get("type")
        }
        (short_goals if g.get("type") == "short" else long_goals).append(goal_data)

    all_goals = short_goals + long_goals

    return render_template(
        "summary.html",
        income=income,
        expense=expense,
        saving=saving,
        balance=balance,
        daily_avg=round(expense / max(now.day, 1), 2),
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
        all_goals=all_goals,
        wallpaper=get_user_wallpaper(),
        user=get_current_user(),
    )

# ================= GOALS =================
@finance_bp.route("/goals", methods=["GET", "POST"])
def goals():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    goals_list = load_data(f_goals, [])

    if request.method == "POST":
        action = request.form.get("action")

        if action == "create":
            name = request.form.get("name")
            target = request.form.get("target")
            goal_type = request.form.get("type")

            if not name or not target or not goal_type:
                return render_template("goals.html", short_goals=[], long_goals=[], error="All fields required", wallpaper=get_user_wallpaper())

            try:
                target = float(target)
            except:
                return render_template("goals.html", short_goals=[], long_goals=[], error="Invalid target amount", wallpaper=get_user_wallpaper())

            new_id = 1
            if goals_list:
                new_id = max([g.get("id", 0) for g in goals_list], default=0) + 1

            goals_list.append({
                "id": new_id,
                "username": user,
                "name": name,
                "type": goal_type,
                "target": target
            })
            save_data(f_goals, goals_list)
            return redirect(url_for("finance.goals"))

        elif action == "save":
            goal_id = int(request.form.get("goal_id"))
            goal_name = request.form.get("goal_name")
            amount = request.form.get("amount")
            account = request.form.get("account")
            new_account = request.form.get("new_account")

            try:
                amount = float(amount)
            except:
                return redirect(url_for("finance.goals"))

            accounts = load_data(f_accounts, [])

            if account == "__new__" and new_account:
                account = new_account
                if not any(a["name"] == account and a["username"] == user for a in accounts):
                    accounts.append({"username": user, "name": account})
                    save_data(f_accounts, accounts)

            records = load_data(f_expense, [])
            records.append({
                "username": user,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "type": "expense",
                "category": "Goal Savings",
                "goal_id": goal_id,
                "account": account,
                "item": f"Goal: {goal_name}",
                "amount": amount
            })
            save_data(f_expense, records)
            return redirect(url_for("finance.goals"))

    user_goals = [g for g in goals_list if g.get("username") == user]
    short_goals, long_goals = [], []

    records = load_data(f_expense, [])
    for g in user_goals:
        saved = sum(r.get("amount", 0) for r in records if r.get("username") == user and r.get("category") == "Goal Savings" and r.get("goal_id") == g.get("id"))
        target = g.get("target", 0)
        percent = (saved / target) * 100 if target else 0
        remaining = target - saved
        status = "Completed" if percent >= 100 else "In Progress"
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
        (short_goals if g.get("type") == "short" else long_goals).append(goal_data)

    accounts = load_data(f_accounts, [])
    user_accounts = [a for a in accounts if a.get("username") == user]

    return render_template(
        "goals.html",
        accounts=user_accounts,
        short_goals=short_goals,
        long_goals=long_goals,
        wallpaper=get_user_wallpaper(),
        user=get_current_user(),
    )

# ================= DELETE GOALS =================
@finance_bp.route("/delete_goal/<int:goal_id>")
def delete_goal(goal_id):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    goals_list = load_data(f_goals, [])
    goals_list = [g for g in goals_list if not (g.get("id") == goal_id and g.get("username") == user)]
    save_data(f_goals, goals_list)
    return redirect(url_for("finance.goals"))

# ================= EDIT GOALS =================
@finance_bp.route("/edit_goal/<int:goal_id>", methods=["GET", "POST"])
def edit_goal(goal_id):
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    goals_list = load_data(f_goals, [])
    goal = next((g for g in goals_list if g.get("id") == goal_id and g.get("username") == user), None)

    if not goal:
        return redirect(url_for("finance.goals"))

    if request.method == "POST":
        name = request.form.get("name")
        target = request.form.get("target")

        if not name or not target:
            return render_template("edit_goal.html", goal=goal, error="All fields required", wallpaper=get_user_wallpaper(), user=get_current_user())

        try:
            target = float(target)
        except:
            return render_template("edit_goal.html", goal=goal, error="Invalid target amount", wallpaper=get_user_wallpaper(), user=get_current_user())

        goal["name"] = name
        goal["target"] = target
        save_data(f_goals, goals_list)
        return redirect(url_for("finance.goals"))

    return render_template(
        "edit_goal.html",
        goal=goal,
        wallpaper=get_user_wallpaper(),
        user=get_current_user()
    )

# ================= FINANCE HOME =================
@finance_bp.route("/finance")
def finance_home():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    user = session["user"]
    current_user = get_current_user()
    records = load_data(f_expense, [])
    budgets = load_data(f_budget, [])
    goals_list = load_data(f_goals, [])
    accounts = load_data(f_accounts, [])
    now = datetime.now()
    current_month = now.strftime("%Y-%m")

    user_records = [r for r in records if r.get("username") == user]
    month_records = [r for r in user_records if r.get("date", "").startswith(current_month)]

    income = sum(r.get("amount", 0) for r in month_records if r.get("type") == "income" and r.get("category") != "Transfer In")
    expense = sum(r.get("amount", 0) for r in month_records if r.get("type") == "expense" and r.get("category") != "Transfer Out")

    user_accounts = [a for a in accounts if a.get("username") == user]
    savings_accounts = [a["name"] for a in user_accounts if a.get("purpose") == "savings"]

    saving = 0
    for acc in savings_accounts:
        balance_acc = 0
        for r in user_records:
            if r.get("account") != acc:
                continue
            balance_acc += r.get("amount", 0) if r.get("type") == "income" else -r.get("amount", 0)
        saving += balance_acc

    spending_accounts = [a["name"] for a in user_accounts if a.get("purpose") == "spending"]
    balance = 0
    for r in user_records:
        if r.get("account") not in spending_accounts:
            continue
        balance += r.get("amount", 0) if r.get("type") == "income" else -r.get("amount", 0)

    recent_records = sorted(user_records, key=lambda x: x.get("date", ""), reverse=True)[:5]

    category_totals = {}
    for r in month_records:
        if r.get("type") == "expense" and r.get("category") != "Transfer Out":
            cat = r.get("category", "Other")
            category_totals[cat] = category_totals.get(cat, 0) + r.get("amount", 0)

    top_category = max(category_totals, key=category_totals.get) if category_totals else None

    user_budgets = [b for b in budgets if b.get("username") == user]
    warning_budgets = []
    for b in user_budgets:
        spent = category_totals.get(b.get("category"), 0)
        limit = b.get("amount", 0)
        percent = (spent / limit) * 100 if limit else 0
        if percent >= 80:
            warning_budgets.append({"category": b.get("category"), "percent": percent})

    user_goals = [g for g in goals_list if g.get("username") == user]
    active_goals = []
    for g in user_goals:
        saved = sum(r.get("amount", 0) for r in user_records if r.get("category") == "Goal Savings" and r.get("goal_id") == g["id"])
        target = g.get("target", 0)
        percent = (saved / target) * 100 if target else 0
        active_goals.append({"name": g.get("name"), "saved": saved, "target": target, "percent": min(percent, 100)})

    savings_rate = round((saving / income) * 100) if saving > 0 and income > 0 else 0

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
        savings_rate=savings_rate,
        theme=(current_user or {}).get("theme", "adaptive"),
    )
