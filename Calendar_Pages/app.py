from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

@app.route("/")
def home():
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/calendar")
def calendar():
    return render_template("calendarhomepage.html")

@app.route("/finance")
def finance():
    return "<h1>Finance Page (placeholder)</h1>"

@app.route("/diary")
def diary():
    return "<h1>Diary Page (placeholder)</h1>"

if __name__ == "__main__":
    app.run(debug=True)