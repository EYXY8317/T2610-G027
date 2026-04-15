from flask import Flask, render_template, request
from datetime import datetime
#Import tools
#Flask = Create the website
#Render_template = Show HTML page
#Request = Get user input
#Datetime = Get current time

app = Flask(__name__)
#Create a Flask application

entries = []
#Create a list to store journal entries

@app.route("/", methods=["GET", "POST"])
#app.route = Define the URL for the home page
# / = Home page
#Methods = Allow both GET and POST requests
#GET = Open the page
#POST = Submit form data

def home():
#Define the function to handle the home page
    if request.method == "POST":
    #Check user submitted form
        content = request.form["content"]
        #Get text from form
    
        entries.append({
        #Add new entry to the list
            "content": content,
            #Store the journal entry content
        })

    current_date = datetime.now().strftime("%Y-%m-%d")
    #Get current date and format it as a string
    return render_template("journal.html", entries=entries, current_date=current_date)
    #Render the journal.html template and pass entries and

if __name__ == "__main__":
#Check if the script is run directly (not imported as a module)
    app.run(debug=True)
    #Start the Flask development server with debug mode enabled