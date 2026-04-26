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