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

        # BIG IDEA - take input from user
        # the input by user from input field named "username" is stored in variable username
        username = request.form["username"]
        password = request.form["password"]
        question = request.form["question"]
        answer = request.form["answer"]

        # checks if password is strong enough
        # function from ZOEY (in password system folder -- password validation.py)
        # not reverses the result
        if not is_valid_password(password):
            return "Weak password"

        # the data is stored in variable user
        users = load_data("users.json", [])

        # prevent duplicate username
        # user is a temporary variable for checking purposes
        for user in users:

            # user["username"] is getting the username from user.json
            if user["username"] == username:
                return "Username already exists"

        # adds the data in the format and into the list users
        users.append({
            "username": username,
            "password": hash_password(password),
            "security_question": question,
            "security_answer": hash_password(answer)
        })

        # saves updated list (users) to users.json
        save_data("users.json", users)

        # sends the user back to the login page
        return redirect(url_for("login"))

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
                return redirect(url_for("add_financial"))

        return "Invalid username or password"

    return render_template("login.html")

# ------------------
# RESET PASSWORD
# ------------------

"""
Reset password function starts here
"""

# @ tells flask to attach this function to a route
# app.route defines a URL
# /forgot is the page URL
# methods= ["GET","POST"] are requests where "GET" opens the page and "POST" sends the data
@app.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        username = request.form["username"]
        answer = hash_password(request.form["answer"])
        new_password = request.form["new_password"]

        # 👇 LOAD HERE (same as login)
        users = load_data("users.json", [])

        for user in users:
            if user["username"] == username:
                if user["security_answer"] == answer:

                    # 👇 UPDATE PASSWORD
                    user["password"] = hash_password(new_password)

                    # 👇 SAVE HERE (this is the second line)
                    save_data("users.json", users)

                    return redirect(url_for("login"))

        return "Invalid details"

    return render_template("forgot.html")

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

# functions run when /add is opened
def add_financial():

    if "user" not in session:
        return redirect(url_for("login"))
    
    # request is data coming from browser
    # method is the type of request
    # "POST" means the form is submitted
    if request.method == "POST":

        # request.form stores what the user inputs in a dictionary
        # date is the input name in HTML
        # save in variable date
        date = request.form["date"]

        # checks if date is valid
        if not valid_date(date):
            return "Invalid date"

        # request.form is the dictionary of form inputs
        # type is the input name in HTML
        # save in variable t
        t = request.form["type"]

        if not valid_casing(t, TYPES):
            return "Invalid type"

        t = t.lower()

        # request.form is the dictionary of form inputs
        # .get() is to get the key value pair (category) if exists, else return default (-)
        category = request.form.get("category", "-")
        item = request.form.get("item", "-")

        # only runs if t is equal to expense
        if t == "expense":
            if not valid_casing(category, CATEGORIES):
                return "Invalid category"
            category = category.lower()

        else:
            category = "-"

        try:
            amt = float(request.form["amount"])
            if amt <= 0:
                return "Invalid amount"
        except:
            return "Invalid amount"

        records = load_data(f_expense, [])

        records.append({
            "username": session["user"],
            "date": date,
            "type": t,
            "category": category,
            "item": item,
            "amount": amt
        })

        save_data(f_expense, records)

        # url_for("view_financial") if to find route
        # redirect is to send user to a specific page
        return redirect(url_for("view_financial"))

    # show the add.html page to user
    return render_template("add.html")

"""
view finance starts here
"""

@app.route("/view")
def view_financial():

    if "user" not in session:
        return redirect(url_for("login"))
    
    records = load_data(f_expense, [])

    user= session.get("user")

    records= [r for r in records if r["username"] == user]

    sorted_records = sorted(records, key=lambda x:x["date"], reverse=True)

    return render_template("view.html", records=sorted_records)

    # sorted rearranges the list
    # key= tells python what to compare
    # lambda x: x["date"] -> x is each record and x["date"] is to get the date only
    # reverse=true is to arrange the order in descending order (from new to old)
    sorted_records = sorted(records, key=lambda x: x["date"], reverse=True)

    # render_template is a flask function that takes a HTML file and turn it into a real webpage
    # then finds the file "view_html"
    # records=sorted_records sends the data from sorted_records to records for futher use
    return render_template("view.html", records=sorted_records)

"""
update finance starts here
"""

@app.route("/update/<int:idx>", methods=["GET", "POST"])
def update_financial(idx):

    if "user" not in session:
        return redirect(url_for("login"))
    
    records = load_data(f_expense, [])
    
    user= session.get("user")

    user_records= [r for r in records if r["username"] == user]

    sorted_records = sorted(user_records, key=lambda x: x["date"], reverse=True)

    if idx < 0 or idx >= len(sorted_records):
        return "Invalid index"

    selected = sorted_records[idx]

    record = selected

    if request.method == "POST":

        # --- Date ---
        d = request.form.get("date")
        if d and valid_date(d):
            record["date"] = d

        # --- Type ---
        t = request.form.get("type", "").lower()
        if t in TYPES:
            record["type"] = t

        # --- Category ---
        if record["type"] == "expense":
            c = request.form.get("category", "").lower()
            if c:
                record["category"] = c
        else:
            record["category"] = "-"

        # --- Item (always allowed) ---
        record["item"] = request.form.get("item") or record["item"]

        # --- Amount ---
        a = request.form.get("amount")
        if a:
            try:
                amt = float(a)
                if amt > 0:
                    record["amount"] = amt
            except:
                pass

        save_data(f_expense, records)

        return redirect(url_for("view_financial"))

    return render_template("update.html", record=record)

"""
delete finance starts here
"""

@app.route("/delete/<int:idx>")
def delete_financial(idx):

    if "user" not in session:
        return redirect(url_for("login"))
    
    records = load_data(f_expense, [])
    
    sorted_records = sorted(records, key=lambda x: x["date"], reverse=True)

    if idx < 0 or idx >= len(sorted_records):
        return "Invalid index"

    # remove selected record
    records.remove(sorted_records[idx])
    save_data(f_expense, records)

    return redirect(url_for("view_financial"))

# --------
# LOG OUT
# --------

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

# ------------------------
# RUN APP
# ------------------------

if __name__ == "__main__":
    app.run(debug=True)