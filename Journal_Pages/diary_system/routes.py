from flask import Blueprint, render_template, request
from diary_system.crud import add_entry, delete_entry
from diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime


#================================ blueprint ================================
diary_bp = Blueprint("diary", __name__)


#================================ route ================================
@diary_bp.route("/diary")
def diary():
    date = request.args.get("date")

    if not date:
        date = datetime.now().strftime("%d/%m/%Y")

    from diary_system.logic import get_entry_by_date

    entry = get_entry_by_date(date)

    if entry and entry["content"].strip() != "":
        mode = "view"
    else:
        mode = "add"

    today = datetime.now().strftime("%d/%m/%Y")

    return render_template(
        "diary.html",
        entry=entry,
        mode=mode,
        today=date
    )


#================================ home route ================================
@diary_bp.route("/")
def home():
    return diary()


#================================ autosave API ================================
@diary_bp.route("/autosave", methods=["POST"])
#url for the diary page, when user goes to /diary this function will be called
def autosave():
    content = request.form.get("content")
    mood = request.form.get("mood")

    date = request.form.get("date")

    new_data = {
        "date": date,
        "content": content,
        "mood": mood
    }

    add_entry(new_data)

    return "saved"

#================================ delete API ================================
@diary_bp.route("/delete", methods=["POST"])
def delete():
    date = request.form.get("date")
    delete_entry(date)
    return "deleted"