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