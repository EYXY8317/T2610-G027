from flask import Flask, render_template, request
from crud import load_entries, add_entry, delete_entry, update_entry
from datetime import datetime

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():

    if request.method == "POST":
        delete_id = request.form.get("delete_id")
        content = request.form.get("content")

        if delete_id:
            delete_entry(delete_id)
        elif content:
            add_entry(content, [])

    entries = load_entries()
    entries = sorted(entries, key=lambda x: x["id"], reverse=True)

    latest = entries[0] if entries else None

    return render_template(
        "diary.html",
        entries=entries,
        latest=latest,
        current_date=datetime.now().strftime("%d-%m-%Y")
    )


@app.route("/autosave", methods=["POST"])
def autosave():

    data = request.get_json()
    if not data:
        return "NO DATA"

    content = data.get("content", "")
    entry_id = data.get("id")

    if entry_id:
        update_entry(entry_id, content)
        return str(entry_id)
    else:
        entries = add_entry(content, [])
        return str(entries[-1]["id"])


app.run(debug=True, use_reloader=False)