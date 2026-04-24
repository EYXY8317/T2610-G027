from flask import Flask, render_template, request
#Render_template = Show HTML page (display page + send data) - output
#Request = Get user input (from form) - input
from crud import load_entries, add_entry

app = Flask(__name__)

@app.rounte("/", methods=["GET", "POST"])
def home():
    
    if request.method == "POST":
        content = request.form.get("content")

        if content:
            add_entry(content)

        
        entries = load_entries()

        return render_template("journal.html",entries=entries)
    
app.run(debug=True)


