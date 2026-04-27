# Dictionary uses {}
# Lists uses []
# Tuple uses ()
# os.path finds the place, sys.path tells Python to search there

# ------------------------
# PYTHON LIBRARIES
# ------------------------

# import system lets is to be able to control how python run and behaves
# be able to use functions like sys.path
import sys
import os

#os.path helps python find and work with files
#_file_ is this current file (app.py)
# os.path.dirname (dirname means get folder name which is finance)
# ".." means go back to previous folder
# os.path.join(finance, "..") = combine paths
# os.path.abspath (abspath means convert to full path (starting from c drive))
# sys.path is the lists of folders python searches for modules
# append means add to the list
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# from flask import Flask creates the web app; able to use functions like redirect() and app.route()
# render_template loads HTML files
# request.form ges data from user input
# redirect & url_for sends user to another page after a certain action
from flask import Flask, render_template, request, redirect, url_for
from flask import session, redirect, url_for
from Journal_Pages.diary_system.crud import load_entries, add_entry # import diary sction
from flask import session
import json #To store and read data; be able to use functions like json.load and json.dump
import os #For clear the screen; be able to use functions like os.system and os.path.exists
from datetime import datetime #Handles dates and time; be able to use functions like datetime.strptime and datetime.now

from password_system.password_hashing import hash_password
from password_system.password_validation import is_valid_password

# create a web app using this file
# Flask is the framework, somewhat like the engine
# _name_ is the curent file name
# !without this, nothing runs!
app = Flask(__name__)

app.secret_key = "your_secret_key"
# -----------
# JSON
#------------

f_expense = "expenses.json"

# ---------------
# FUNCTIONS
# ---------------

#purpose is to pause the program
#stop the program temporarily until user press enter
#/n means enter a new line
def pause():
    input("\nPress Enter to continue...")

#purpose is to load data from a file
#file is to see if the file exists or not
#default is a fake but valid data if the file does not exist
def load_data(file, default):

    #os.path.exists checks whether the file exists
    #not means file does not exist
    if not os.path.exists(file):

        #go back to default
        return default
    
    #With function is used to open a file and to make sure it is properly closed after finished
    #If file exists, open the file and read (r)
    #As f is a temporary variable to store the opened file
    with open(file, "r") as f:

        # try is a safe way to open files
        try:

            # reads the json file (f) and converts it to python
            # python data stored in variable data
            data = json.load(f)
        
        # if error occurs
        except:

            # return an empty list ( [ ] )
            return default

        # checks if it is a dictionary
        # isinstance is a built-in python function; checks if something is a specific type
        # data is the variable
        # dictionary (dict) is the type to check
        if isinstance(data, dict):

            # return as {[ data ]}
            return [data]

        # returns data when everything is correct
        return data

#purpose is to save data to a file
#file is the file to be saved
#data is the data to be saved
def save_data(file, data):

    #"w" means write; if the file exists, it will be overwritten; if not, a new file will be created
    with open(file, "w") as f:

        #Dump means put the data into the file (converts python to .json)
        #f is the file to write to
        #Indent=4 means the json file will be 4 spaces indented(空四格)
        json.dump(data, f, indent=4)

#purpose is to check if date is valid
#d is the date that enter by user
def valid_date(d):

    #try is to try to run the code, if error, run except
    try:

        #striptime is check if date in correct format
        #%Y-%m-%d means year-month-day
        datetime.strptime(d, "%Y-%m-%d")

        #Means date is valid
        return True
    except:
        #Means date is invalid
        return False

#purpose is to check if the casing of the value is valid
#value is the value input by the user; allowed is the list of allowed values to be checked
def valid_casing(value, allowed):
    return (
        value == value.lower() #makes value all lower case
        or value == value.upper() #makes value all upper case
        or value == value.capitalize() #makes value first letter capitalized
    ) and value.lower() in allowed #check if value (in lower case) is in the allowed list

# ----------------
# ARRAYS
# ----------------

TYPES = ["expense", "income", "saving"]
CATEGORIES = ["food", "other", "rent","entertainment", "education", "transportation"]

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

# ------------
# REGISTER
# ------------

"""
Register fuction starts here
"""

# @ tells flask to attach this function to a route
# app.route defines a URL
# /register is the page URL
# methods= ["GET","POST"] are requests where "GET" opens the page and "POST" sends the data
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        email = request.form["email"]
        question = request.form["question"]
        answer = request.form["answer"]

        users = load_data("users.json", [])

        for user in users:
            if user["username"] == username:
                return render_template("register.html", error="Username already exists")

        if not is_valid_password(password):
            return render_template("register.html", error="Weak password")

        new_user = {
            "username": username,
            "password": hash_password(password),
            "email": email,
            "security_question": question,
            "security_answer": hash_password(answer)
        }

        users.append(new_user)
        save_data("users.json", users)

        return redirect(url_for("login", success="Account created! Please login"))

    return render_template("register.html")

# ----------
# LOGIN
# ----------

"""
Login function starts here
"""

# @ tells flask to attach this function to a route
# app.route defines a URL
# /login is the page URL
# methods= ["GET","POST"] are requests where "GET" opens the page and "POST" sends the data
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = hash_password(request.form["password"])

        users = load_data("users.json", [])

        for user in users:
            if user["username"] == username and user["password"] == password:
                session["user"] = username
                return redirect(url_for("add_financial", success="Welcome back!"))

        return render_template("login.html", error="Invalid username or password")

    return render_template("login.html")

# ------------------
# FORGOT PASSWORD
# ------------------

"""
Forgot password function starts here
"""

# @ tells flask to attach this function to a route
# app.route defines a URL
# /forgot is the page URL
# methods= ["GET","POST"] are requests where "GET" opens the page and "POST" sends the data
@app.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        username = request.form["username"]
        question = request.form["question"]
        answer = request.form["answer"]

        users = load_data("users.json", [])

        for user in users:
            if user["username"] == username:

                if (
                    user["security_question"] == question
                    and user["security_answer"] == hash_password(answer)
                ):
                    return redirect(url_for("reset_password", username=username))

                else:
                    return render_template("forgot.html", error="Wrong question or answer")

        return render_template("forgot.html", error="User not found")

    return render_template("forgot.html")


# ------------------
# FORGOT USERNAME
# ------------------

"""
Forgot username function starts here
"""

@app.route("/forgot_username", methods=["GET", "POST"])
def forgot_username():

    if request.method == "POST":
        email = request.form.get("email")

        users = load_data("users.json", [])

        for user in users:
            if user.get("email") == email:
                return render_template(
                    "forgot_username.html",
                    success=f"Your username is: {user['username']}"
                )

        return render_template("forgot_username.html", error="Email not found")

    return render_template("forgot_username.html")

# -----------------
# RESET PASSWORD
# -----------------

"""
Reset password function starts here
"""

@app.route("/reset/<username>", methods=["GET", "POST"])
def reset_password(username):
    users = load_data("users.json", [])

    if request.method == "POST":
        new_password = request.form["password"]

        if not is_valid_password(new_password):
            return render_template("reset.html", username=username, error="Weak password")

        for user in users:
            if user["username"] == username:
                user["password"] = hash_password(new_password)
                break

        save_data("users.json", users)

        return redirect(url_for("login", success="Password reset successful!"))

    return render_template("reset.html", username=username)
# ------------
# FINANCE
#-------------

"""
add function starts here
"""

# @ tells flask to attach this function to a route
# app.route defines a URL
# /add is the page URL
# methods= ["GET","POST"] are requests where "GET" opens the page and "POST" sends the data
@app.route("/add", methods=["GET", "POST"])
def add_financial():

    # 🔒 Check login
    if "user" not in session:
        return redirect(url_for("login"))

    # 🔥 ALWAYS load accounts first
    accounts = load_data("accounts.json", [])
    user_accounts = [a for a in accounts if a["username"] == session["user"]]

    if request.method == "POST":

        date = request.form.get("date")
        type_ = request.form.get("type")
        category = request.form.get("category")
        item = request.form.get("item")
        amount = request.form.get("amount")

        # 🔥 GET ACCOUNT INPUTS
        new_account = request.form.get("new_account")
        account = request.form.get("account")

        # 🔥 IF USER TYPES NEW ACCOUNT
        if new_account:
            account = new_account

            if not any(a["name"] == account and a["username"] == session["user"] for a in accounts):
                accounts.append({
                    "username": session["user"],
                    "name": account
                })
                save_data("accounts.json", accounts)

            # 🔥 refresh user_accounts after adding
            user_accounts = [a for a in accounts if a["username"] == session["user"]]

        # 🔥 VALIDATION
        if not account:
            return render_template("add.html", error="Select or create account", accounts=user_accounts)

        if not date or not type_ or not amount:
            return render_template("add.html", error="Date, Type and Amount are required", accounts=user_accounts)

        if type_ == "expense" and (not category or not item):
            return render_template("add.html", error="Category and Item required for expense", accounts=user_accounts)

        try:
            amount = float(amount)
        except:
            return render_template("add.html", error="Invalid amount", accounts=user_accounts)

        # 🔥 CREATE RECORD
        record = {
            "username": session["user"],
            "date": date,
            "type": type_,
            "category": category if category else "-",
            "account": account,
            "item": item if item else "-",
            "amount": amount
        }

        # 💾 SAVE
        records = load_data(f_expense, [])
        records.append(record)
        save_data(f_expense, records)

        return render_template("add.html", success="Record added!", accounts=user_accounts)

    # 🔥 GET request
    return render_template("add.html", accounts=user_accounts)

"""
view finance starts here
"""

@app.route("/view")
def view_financial():

    # 🔒 Check login
    if "user" not in session:
        return redirect(url_for("login"))

    # 📥 Load all records
    records = load_data(f_expense, [])

    # 👤 Get current user
    user = session.get("user")

    # 🔍 Filter only this user's records
    user_records = [r for r in records if r["username"] == user]

    selected_account = request.args.get("account")

    if selected_account:
        user_records = [r for r in user_records if r.get("account") == selected_account]

    # 🔄 Sort by date (newest first)
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    accounts = load_data("accounts.json", [])
    user_accounts = [a for a in accounts if a["username"] == user]

    return render_template(
        "view.html",
        records=sorted_records,
        selected_account=selected_account,
        accounts=user_accounts   # 🔥 THIS LINE FIXES EVERYTHING
    )

"""
update finance starts here
"""

@app.route("/update/<int:idx>", methods=["GET", "POST"])
def update_financial(idx):

    # 🔒 Check login
    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session.get("user")

    # 👤 Filter user records
    user_records = [r for r in records if r["username"] == user]

    # 🔄 Sort
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    # ❌ Invalid index
    if idx < 0 or idx >= len(sorted_records):
        return render_template("view.html", records=sorted_records, error="Invalid record")

    # 🎯 Get selected record
    selected = sorted_records[idx]
    real_index = records.index(selected)
    record = records[real_index]

    # 🔥 HANDLE UPDATE
    if request.method == "POST":

        # KEEP OLD VALUES IF USER DOESN’T CHANGE
        date = request.form.get("date") or record["date"]
        type_ = request.form.get("type") or record["type"]
        category = request.form.get("category") or record.get("category", "-")
        item = request.form.get("item") or record.get("item", "-")
        account = request.form.get("account") or record.get("account", "Default")
        amount = request.form.get("amount") or record["amount"]

        # HANDLE NEW ACCOUNT
        new_account = request.form.get("new_account")
        accounts = load_data("accounts.json", [])

        if new_account:
            account = new_account

            if not any(a["name"] == account and a["username"] == user for a in accounts):
                accounts.append({
                    "username": user,
                    "name": account
                })
                save_data("accounts.json", accounts)

        # 🔥 VALIDATION
        if not date or not type_ or not amount:
            return render_template("update.html", record=record, accounts=accounts, error="Date, Type and Amount are required")

        if type_ == "expense":
            if not category or not item:
                return render_template("update.html", record=record, accounts=accounts, error="Category and Item required for expense")

        try:
            amount = float(amount)
        except:
            return render_template("update.html", record=record, accounts=accounts, error="Invalid amount")

        # 🔥 UPDATE RECORD
        record["date"] = date
        record["type"] = type_
        record["category"] = category
        record["item"] = item
        record["account"] = account
        record["amount"] = amount

        # 💾 SAVE
        save_data(f_expense, records)

        return redirect(url_for("view_financial", success="Updated successfully"))

    # 🔥 GET REQUEST
    accounts = load_data("accounts.json", [])
    user_accounts = [a for a in accounts if a["username"] == user]

    return render_template("update.html", record=record, accounts=user_accounts)

"""
delete finance starts here
"""

@app.route("/delete/<int:idx>")
def delete_financial(idx):

    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session.get("user")

    user_records = [r for r in records if r["username"] == user]

    # 🚨 NEW LINE (IMPORTANT)
    if len(user_records) == 0:
        return render_template("view.html", records=[], error="No records to delete")

    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    if idx < 0 or idx >= len(sorted_records):
        return render_template("view.html", records=sorted_records, error="Invalid record")

    selected = sorted_records[idx]
    real_index = records.index(selected)

    records.pop(real_index)
    save_data(f_expense, records)

    # reload
    user_records = [r for r in records if r["username"] == user]
    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    return redirect(url_for("view_financial", success="Deleted successfully"))

# ---------
# SUMMARY
# ---------

"""
Summary function starts here
"""

@app.route("/summary")
def summary():

    if "user" not in session:
        return redirect(url_for("login"))

    records = load_data(f_expense, [])
    user = session.get("user")

    # 👤 filter user
    user_records = [r for r in records if r["username"] == user]

    # 📅 current month
    from datetime import datetime
    now = datetime.now()
    current_month = now.strftime("%Y-%m")

    # 📊 filter this month
    month_records = [r for r in user_records if r["date"].startswith(current_month)]

    # 🔢 totals
    income = sum(r["amount"] for r in month_records if r["type"] == "income")
    expense = sum(r["amount"] for r in month_records if r["type"] == "expense")
    balance = income - expense

    # 📈 daily average
    days = now.day if now.day != 0 else 1
    daily_avg = expense / days if days else 0

    # 🏆 top category
    category_totals = {}
    for r in month_records:
        if r["type"] == "expense":
            cat = r.get("category", "Other")
            category_totals[cat] = category_totals.get(cat, 0) + r["amount"]

    top_category = max(category_totals, key=category_totals.get) if category_totals else "None"

    # 🔥 TOP 3 CATEGORIES
    top_categories = sorted(
    category_totals.items(),
    key=lambda x: x[1],
    reverse=True
    )[:3]

    total_expense = sum(category_totals.values())

    top_categories_with_percent = [
        (cat, amt, (amt / total_expense * 100) if total_expense > 0 else 0)
        for cat, amt in top_categories
    ]

    total_expense = sum(
    r["amount"] for r in user_records if r["type"] == "expense"
    )

    top_category_amount = category_totals[top_category] if top_category else 0

    top_category_percent = (
        (top_category_amount / total_expense * 100)
        if total_expense > 0 else 0
    )

    # 🧠 smart insight
    insight = "No significant spending pattern yet."
    if category_totals:
        insight = f"You spent most on {top_category} this month."

    return render_template(
    "summary.html",
    income=income,
    expense=expense,
    balance=balance,
    daily_avg=round(daily_avg, 2),
    top_category=top_category,
    insight=insight,
    top_categories=top_categories_with_percent,
)

# ---------------
# ADD ACCOUNTS
# ---------------

"""
add account function starts here
"""

@app.route("/add_account", methods=["GET", "POST"])
def add_account():

    if "user" not in session:
        return redirect(url_for("login"))

    if request.method == "POST":
        name = request.form.get("account")

        accounts = load_data("accounts.json", [])

        accounts.append({
            "username": session["user"],
            "name": name
        })

        save_data("accounts.json", accounts)

        return redirect(url_for("add_financial"))

    return render_template("add_account.html")

# -------------
# DIARY ROUTE
# -------------

@app.route("/diary", methods=["GET", "POST"])
def diary():

    if "user" not in session:
        return redirect(url_for("login"))

    entries = load_entries()

    if request.method == "POST":
        content = request.form["content"]
        entries = add_entry(content)

    return render_template("diary.html", entries=entries)

# --------
# LOG OUT
# --------

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login", success="Logged out successfully"))

# ------------------------
# RUN APP
# ------------------------

if __name__ == "__main__":
    app.run(debug=True)