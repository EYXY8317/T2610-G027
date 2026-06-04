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

            if not any(

                a["name"] == account
                and a["username"] == session["user"]

                for a in accounts
            ):

                accounts.append({

                    "username": session["user"],

                    "name": account,

                    "purpose": purpose

                })

                save_data(f_accounts, accounts)

        if not account:
            return render_template(
                "add.html",
                error="Account required",
                **template_data
            )

        amount_raw = form.get("amount")

        if not amount_raw:
            return render_template(
                "add.html",
                error="Amount is required",
                **template_data
            )

        try:
            amount = float(amount_raw)

            if amount <= 0:
                raise ValueError

        except:
            return render_template(
                "add.html",
                error="Amount must be greater than 0",
                **template_data
            )

        if form.get("type") == "transfer":

            to_account = form.get("to_account")

            if not to_account:
                return render_template(
                    "add.html",
                    error="Transfer account required",
                    **template_data
                )

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

            return redirect(url_for("view_financial"))

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
        user=get_current_user()
    )

# ================= VIEW =================
@app.route("/view")
def view_financial():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    records = load_data(f_expense, [])
    accounts = load_data(f_accounts, [])

    # ===== USER RECORDS =====
    user_records = [

        r for r in records

        if r["username"] == user
    ]

    # ===== FILTER =====
    selected_account = request.args.get("account")

    if selected_account and selected_account != "All Accounts":

        user_records = [

            r for r in user_records

            if r.get("account") == selected_account
        ]

    # ===== SORT =====
    sorted_records = sorted(
        user_records,
        key=lambda x: x["date"],
        reverse=True
    )

    # ===== USER ACCOUNTS =====
    user_accounts = [

        a for a in accounts

        if a["username"] == user
    ]

    return render_template(

        "view.html",

        records=sorted_records,

        accounts=user_accounts,

        selected_account=selected_account,

        wallpaper=get_user_wallpaper(),

        user=get_current_user(),
    )

# ================= DELETE =================
@app.route("/delete/<int:idx>")
def delete_financial(idx):

    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session["user"]

    user_records = [

        r for r in records

        if r["username"] == user

    ]

    if idx < 0 or idx >= len(user_records):
        return redirect(url_for("view_financial"))

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

        purpose = form.get("purpose", "spending")
        date = form.get("date") or record["date"]
        type_ = form.get("type") or record["type"]
        category = form.get("category") or record.get("category", "-")
        item = form.get("item") or record.get("item", "-")
        amount_raw = form.get("amount")

        if not amount_raw:
            return render_template(
                "update.html",
                record=record,
                accounts=user_accounts,
                error="Amount is required"
            )

        try:
            amount = float(amount_raw)

            if amount <= 0:
                raise ValueError

        except:
            return render_template(
                "update.html",
                record=record,
                accounts=user_accounts,
                error="Amount must be greater than 0"
            )

        account = form.get("account")
        new_account = form.get("new_account")

        # handle new account
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
        user=get_current_user(),
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
        user=get_current_user(),
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
        r["amount"]
        for r in month_records
        if r["type"] == "income"
        and r.get("category") != "Transfer In"
    )

    expense = sum(
        r["amount"]
        for r in month_records
        if r["type"] == "expense"
        and r.get("category") != "Transfer Out"
    )

    balance = income - expense

    # ================= CATEGORY TOTALS =================
    category_totals = {}

    for r in month_records:

        if (
            r.get("type") == "expense"
            and r.get("category") != "Transfer Out"
        ):

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
        if (
            r.get("type") == "income"
            and r.get("category") != "Transfer In"
        )
    )

    yearly_expense = sum(
        r.get("amount", 0)
        for r in year_records
        if (
            r.get("type") == "expense"
            and r.get("category") != "Transfer Out"
        )
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
                and r.get("category") != "Transfer In"
                and r.get("date", "").startswith(key)
            )

        )

        monthly_expense = sum(

            r.get("amount", 0)

            for r in year_records

            if (
                r.get("type") == "expense"
                and r.get("category") != "Transfer Out"
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

    accounts = load_data(f_accounts, [])

    user_goals = [

        g for g in goals_data

        if g.get("username") == user

    ]

    # ================= SAVINGS ACCOUNTS =================

    saving = 0

    user_accounts = [

        a for a in accounts

        if a.get("username") == user

    ]

    savings_accounts = [

        a["name"]

        for a in user_accounts

        if a.get("purpose") == "savings"

    ]

    for acc in savings_accounts:

        balance_acc = 0

        for r in records:

            if (
                r.get("username") != user
                or r.get("account") != acc
            ):
                continue

            if r.get("type") == "income":

                balance_acc += r.get("amount", 0)

            elif r.get("type") == "expense":

                balance_acc -= r.get("amount", 0)

        saving += balance_acc
    
    short_goals = []
    long_goals = []

    records = load_data(f_expense, [])

    for g in user_goals:

        saved = 0

        for r in records:

            if (
                r.get("username") == user
                and r.get("category") == "Goal Savings"
                and r.get("goal_id") == g["id"]
            ):

                saved += r.get("amount", 0)

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

            "status": status,

            "goal_type": g.get("type")

        }

        if g.get("type") == "short":

            short_goals.append(goal_data)

        else:

            long_goals.append(goal_data)

    all_goals = short_goals + long_goals

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

        all_goals=all_goals,
        
        wallpaper=get_user_wallpaper(),

        user=get_current_user(),

    )

# ================= GOALS =================
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

                "target": target
            })

            save_data(f_goals, goals)

            return redirect(url_for("goals"))

        # ===== SAVE MONEY INTO GOAL =====
        elif action == "save":

            goal_id = int(request.form.get("goal_id"))
            goal_name = request.form.get("goal_name")
            amount = request.form.get("amount")
            account = request.form.get("account")
            new_account = request.form.get("new_account")

            try:
                amount = float(amount)

            except:
                return redirect(url_for("goals"))

            accounts = load_data(f_accounts, [])

            if account == "__new__" and new_account:

                account = new_account

                if not any(
                    a["name"] == account
                    and a["username"] == user
                    for a in accounts
                ):

                    accounts.append({

                        "username": user,

                        "name": account

                    })

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

        records = load_data(f_expense, [])

        saved = sum(

            r.get("amount", 0)

            for r in records

            if (
                r.get("username") == user
                and r.get("category") == "Goal Savings"
                and r.get("goal_id") == g.get("id")
            )

        )
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

    accounts = load_data(f_accounts, [])

    user_accounts = [

    a for a in accounts

    if a.get("username") == user

    ]
    # ================= RENDER =================
    return render_template(

        "goals.html",

        accounts=user_accounts,

        short_goals=short_goals,

        long_goals=long_goals,

        wallpaper=get_user_wallpaper(),

        user=get_current_user(),
    )

# =========== DELETE GOALS ==================
@app.route("/delete_goal/<int:goal_id>")
def delete_goal(goal_id):

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    goals = load_data(f_goals, [])

    # remove only THIS user's goal
    goals = [

        g for g in goals

        if not (
            g.get("id") == goal_id
            and g.get("username") == user
        )

    ]

    save_data(f_goals, goals)

    return redirect(url_for("goals"))


# ================ EDIT GOALS ====================
@app.route("/edit_goal/<int:goal_id>", methods=["GET", "POST"])
def edit_goal(goal_id):

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    goals = load_data(f_goals, [])

    # find correct goal
    goal = next(

        (

            g for g in goals

            if (
                g.get("id") == goal_id
                and g.get("username") == user
            )

        ),

        None

    )

    # goal not found
    if not goal:
        return redirect(url_for("goals"))

    # ================= UPDATE =================
    if request.method == "POST":

        name = request.form.get("name")
        target = request.form.get("target")

        if not name or not target:

            return render_template(
                "edit_goal.html",
                goal=goal,
                error="All fields required",
                wallpaper=get_user_wallpaper(),
                user=get_current_user()
            )

        try:
            target = float(target)

        except:

            return render_template(
                "edit_goal.html",
                goal=goal,
                error="Invalid target amount",
                wallpaper=get_user_wallpaper(),
                user=get_current_user()
            )

        # update data
        goal["name"] = name
        goal["target"] = target

        save_data(f_goals, goals)

        return redirect(url_for("goals"))

    # ================= RENDER =================
    return render_template(

        "edit_goal.html",

        goal=goal,

        wallpaper=get_user_wallpaper(),

        user=get_current_user()

    )

# ================= DASHBOARD =================
@app.route("/dashboard")
def dashboard():

    if "user" not in session:
        return redirect(url_for("login"))

    users = load_data(f_users, [])

    current_user = None

    for u in users:

        if u["username"] == session["user"]:

            current_user = u
            break

    return render_template(

        "dashboard.html",

        user=current_user,

        wallpaper=get_user_wallpaper(),

    )

# ================= FINANCE HOME =================
@app.route("/finance")
def finance_home():

    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]

    current_user = get_current_user()

    records = load_data(f_expense, [])

    budgets = load_data(f_budget, [])

    goals = load_data(f_goals, [])

    accounts = load_data(f_accounts, [])

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
        and r.get("category") != "Transfer In"

    )

    expense = sum(

        r.get("amount", 0)

        for r in month_records

        if r.get("type") == "expense"
        and r.get("category") != "Transfer Out"

    )

    saving = 0

    user_accounts = [

        a for a in accounts

        if a.get("username") == user

    ]

    savings_accounts = [

        a["name"]

        for a in user_accounts

        if a.get("purpose") == "savings"

    ]

    for acc in savings_accounts:

        balance_acc = 0

        for r in user_records:

            if r.get("account") != acc:
                continue

            if r.get("type") == "income":

                balance_acc += r.get("amount", 0)

            elif r.get("type") == "expense":

                balance_acc -= r.get("amount", 0)

        saving += balance_acc

    spending_accounts = [

        a["name"]

        for a in user_accounts

        if a.get("purpose") == "spending"
    ]

    balance = 0

    for r in user_records:

        if r.get("account") not in spending_accounts:
            continue

        if r.get("type") == "income":

            balance += r.get("amount", 0)

        elif r.get("type") == "expense":

            balance -= r.get("amount", 0)

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

        if (
            r.get("type") == "expense"
            and r.get("category") != "Transfer Out"
        ):

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

        saved = 0

        for r in user_records:

            if (
                r.get("category") == "Goal Savings"
                and r.get("goal_id") == g["id"]
            ):

                saved += r.get("amount", 0)

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

    # ===============================
    # SAVINGS RATE
    # ===============================

    savings_rate = 0

    if saving > 0 and income > 0:

        savings_rate = round(
            (saving / income) * 100
        )

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

        savings_rate=savings_rate,

        theme=(current_user or {}).get("theme", "adaptive"),

        ui_style=(current_user or {}).get("ui_style", "premium"),
    )

# ================= CALENDAR STATIC =================
@app.route('/calendar_static/<path:filename>')
def calendar_static(filename):
    return send_from_directory(
        os.path.join('Calendar_Pages', 'static'),
        filename
    )

# ================= CALENDAR =================
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