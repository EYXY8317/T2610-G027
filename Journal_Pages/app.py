from flask import Flask, render_template, request
#Import tools
#Flask = Create the website
#Render_template = Show HTML page
#Request = Get user input
from create_read import load_entries, add_entry

app = Flask(__name__)
#Create a Flask application

@app.route("/", methods=["GET", "POST"])
#app.route = Define the URL for the home page
# / = Home page
#Methods = Allow both GET and POST requests
#GET = Open the page
#POST = Submit form data

def home():
#Define the function to handle the home page
    entries = load_entries()

    if request.method == "POST":
    #User submits a new journal entry
    #Post = Send data to the server
        content = request.form["content"]
         #Get text from form
        entries = add_entry(content)

    return render_template("journal.html", entries = entries)
    
if __name__ == "__main__":
#Check if the script is run directly (not imported as a module)
    app.run(debug=True)
    #Start the Flask development server with debug mode enabled