from flask import Flask, render_template, request
#Render_template = Show HTML page (display page + send data) - output
#Request = Get user input (from form) - input
from crud import load_entries, add_entry, delete_entry, update_entry
from datetime import datetime

app = Flask(__name__)
# __name__ = Python automatically gives the current file name
# Used by Flask to locate templates and project files

#Home  --------------------------------------
@app.route("/", methods=["GET", "POST"])
#This defines the URL router for the home page
#"/" mean the home page
# methods=["GET", "POST"]:
# GET = used to open and view the page
# POST = used to submit data from a form
# This allows the page to both display content and receive user input

def home():
        
    if request.method == "POST":
    #Check if the user submitted the form
    #If true, the program will process the user input
        
        content = request.form.get("content")
        moods = request.form.getlist("mood")
        delete_id = request.form.get("delete_id")
        edit_id = request.form.get("edit_id")
        new_content = request.form.get("new_content")

        if delete_id:
            delete_entry(delete_id)

        elif edit_id and new_content:
            update_entry(edit_id, new_content)

        elif content:     
                add_entry(content, moods)
                # Save user input only if it is not empty
        
    entries = load_entries()

    if entries:
         latest = entries[0]["content"]
    else:
         latest = ""

    current_date = datetime.now().strftime("%d-%m-%Y")

    return render_template(
        "diary.html", 
        entries=entries, 
        current_date=current_date,
        latest=latest
    )

#Autosave function --------------------------------------
@app.route("/autosave",methods=["POST"])
def autosave():
    print("ROUTE HIT")

    data = request.get_json()
    print("DATA:", data)

    content = data["content"]
    print("AUTOSAVE:", content)

    entries = load_entries()
    #get existing(已有) data

    if entries:
        update_entry(entries[0]["id"], content)
        #update entry with id using new content
        #entries[0] = get the first item

    else:
        add_entry(content,[]) 

    return "OK"
app.run(debug=True)
