from flask import Flask, render_template, request
#Render_template = Show HTML page (display page + send data) - output
#Request = Get user input (from form) - input
from crud import load_entries, add_entry

app = Flask(__name__)
# __name__ = Python automatically gives the current file name
# Used by Flask to locate templates and project files

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
        #Request.form = data sent from the form 拿用户在 textarea/input 写的内容
        
        if content:
            add_entry(content)
            # Save user input only if it is not empty
        
    entries = load_entries()

    return render_template("journal.html",entries=entries)
    # Render and display the journal.html page with data
    # return = send response back to the browser
    # render_template(...) = load and display HTML page
app.run(debug=True)


