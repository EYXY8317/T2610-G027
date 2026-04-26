# IMPORT ===========================================================================
from flask import Flask, render_template, request
#render_template = Show HTML page (display page + send data) - output
#request = Get user input (from form) - input
from crud import load_entries, add_entry, delete_entry, update_entry
from datetime import datetime

# CREATE APP ===========================================================================
app = Flask(__name__)
# __name__ = Python automatically gives the current file name
# Used by Flask to locate templates and project files

# HOME PAGE ===========================================================================
@app.route("/", methods=["GET", "POST"])
#This defines the URL router for the home page
#"/" mean the home page
# methods=["GET", "POST"]:
# GET = used to open and view the page
# POST = used to submit data from a form
# This allows the page to both display content and receive user input

def home():

# HANDLE FORM ----------------------------------------------------------------
    if request.method == "POST":
    #Check if the user submitted the form
    #If true, the program will process the user input
        
# Get data ----------------------------
        content = request.form.get("content")
        moods = request.form.getlist("mood")
        delete_id = request.form.get("delete_id")
        edit_id = request.form.get("edit_id")
        new_content = request.form.get("new_content")

# Delete ----------------------------
        if delete_id:
            delete_entry(delete_id)

# Update ----------------------------
        elif edit_id and new_content:
            update_entry(edit_id, new_content)

# Create ----------------------------
        elif content:     
                add_entry(content, moods)
                #save user input only if it is not empty
    
# LOAD DATA ----------------------------------------------------------------
    entries = load_entries()

# Get latest entry ----------------------------
    if entries:
         latest = entries[0]["content"]
    else:
         latest = ""

# Get current date ----------------------------
    current_date = datetime.now().strftime("%d-%m-%Y")

# RENDER PAGE ----------------------------------------------------------------
    return render_template(
        "diary.html", 
        entries=entries, 
        current_date=current_date,
        latest=latest
    )

# AUTOSAVE  ===========================================================================
@app.route("/autosave",methods=["POST"])
def autosave():

# DEBUG: check if route is working ---------------------------- 
    print("ROUTE HIT")

# GET DATA ----------------------------------------------------------------
    data = request.get_json()
    print("DATA:", data)

# Get content -----------------------------
    content = data["content"]
    print("AUTOSAVE:", content)

# LOAD EXISTING DATA ----------------------------------------------------------------
    entries = load_entries()
    #get existing(已有) data

# UPDATE OR CREATE ----------------------------------------------------------------
    if entries:
# Update latest entry -----------------------------
        update_entry(entries[0]["id"], content)
        #update entry with id using new content
        #entries[0] = get the first item

    else:
# Create new entry ---------------------------- 
        add_entry(content,[]) 

# RESPONSE ----------------------------------------------------------------
    return "OK"

# RUN APP  ===========================================================================
app.run(debug=True)
