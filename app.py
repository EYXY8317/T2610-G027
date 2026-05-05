from flask import Flask, render_template, request, redirect, url_for, session
from Journal_Pages.diary_system.routes import diary_bp
from password_system.password_hashing import hash_password
from password_system.password_validation import is_valid_password

import json
import os
from datetime import datetime, timedelta
from jinja2 import ChoiceLoader, FileSystemLoader

# ================= BASE =================
BASE_DIR = os.path.dirname(__file__)

app = Flask(__name__)
app.secret_key = "your_secret_key"

# ================= TEMPLATE LOADER =================
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(BASE_DIR, "Finance", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Calendar_Pages", "templates")),
    FileSystemLoader(os.path.join(BASE_DIR, "Journal_Pages", "templates")),
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
        return redirect(url_for("login"))

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
                return redirect(url_for("add_financial"))

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


@app.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        username = request.form["username"]
        users = load_data(f_users, [])

        for u in users:
            if u["username"] == username:
                return render_template("reset_password.html", username=username)

        return render_template("forgot_password.html", error="User not found")

    return render_template("forgot_password.html")


@app.route("/reset_password/<username>", methods=["GET", "POST"])
def reset_password(username):
    if request.method == "POST":
        users = load_data(f_users, [])
        new_pass = request.form["password"]

        for u in users:
            if u["username"] == username:
                u["password"] = hash_password(new_pass)

        save_data(f_users, users)
        return redirect(url_for("login"))

    return render_template("reset_password.html", username=username)


# ================= ADD =================
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

    return render_template("add.html", accounts=user_accounts)


# ================= VIEW =================
@app.route("/view")
def view_financial():
    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session["user"]

    user_records = [r for r in records if r["username"] == user]
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    return render_template("view.html", records=sorted_records)


# ================= DELETE =================
@app.route("/delete/<int:idx>")
def delete_financial(idx):
    records = load_data(f_expense, [])
    user = session["user"]

    user_records = [r for r in records if r["username"] == user]
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

        date = form.get("date") or record["date"]
        type_ = form.get("type") or record["type"]
        category = form.get("category") or record.get("category", "-")
        item = form.get("item") or record.get("item", "-")
        amount = form.get("amount") or record["amount"]

        account = form.get("account")
        new_account = form.get("new_account")

        # handle new account
        if new_account:
            account = new_account
            if not any(a["name"] == account and a["username"] == user for a in accounts):
                accounts.append({
                    "username": user,
                    "name": account
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
        accounts=user_accounts
    )

# ================= BUDGET =================
@app.route("/budget", methods=["GET", "POST"])
def budget():
    if "user" not in session:
        return redirect(url_for("login"))

    budgets = load_data(f_budget, [])
    user = session["user"]

    if request.method == "POST":
        category = request.form.get("category")
        amount = float(request.form.get("amount"))

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
        return redirect(url_for("budget"))

    user_budgets = [b for b in budgets if b["username"] == user]

    return render_template("budget.html", budgets=user_budgets)


# ================= SUMMARY =================
@app.route("/summary")
def summary():
    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]
    records = load_data(f_expense, [])

    now = datetime.now()
    current_month = now.strftime("%Y-%m")

    month_records = [r for r in records if r["username"] == user and r["date"].startswith(current_month)]

    income = sum(r["amount"] for r in month_records if r["type"] == "income")
    expense = sum(r["amount"] for r in month_records if r["type"] == "expense")
    balance = income - expense

    category_totals = {}
    for r in month_records:
        if r["type"] == "expense":
            category_totals[r["category"]] = category_totals.get(r["category"], 0) + r["amount"]

    total_expense = sum(category_totals.values())

    top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]

    top_categories_with_percent = [
        (c, a, (a / total_expense * 100) if total_expense else 0)
        for c, a in top_categories
    ]

    budgets = load_data(f_budget, [])
    user_budgets = [b for b in budgets if b["username"] == user]

    budget_usage = []

    for b in user_budgets:
        spent = category_totals.get(b["category"], 0)
        percent = (spent / b["amount"] * 100) if b["amount"] else 0

        status = "safe"
        if percent >= 100:
            status = "over"
        elif percent >= 80:
            status = "warning"

        budget_usage.append({
            "category": b["category"],
            "spent": spent,
            "limit": b["amount"],
            "percent": percent,
            "status": status
        })

    return render_template(
        "summary.html",
        income=income,
        expense=expense,
        balance=balance,
        daily_avg=round(expense / max(now.day, 1), 2),
        top_categories=top_categories_with_percent,
        insight="Spending analysis ready",
        comparison="Comparison ready",
        budget_usage=budget_usage
    )


# ================= CALENDAR =================
@app.route("/calendar")
def calendar():
    return render_template("calendarhomepage.html")


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)