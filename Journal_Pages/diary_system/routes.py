from flask import Blueprint, render_template, request
from diary_system.crud import add_entry, delete_entry
from diary_system.logic import get_today_entry, get_mode
from datetime import datetime


#================================ blueprint ================================
diary_bp = Blueprint("diary", __name__)


#================================ route ================================
@diary_bp.route("/diary")
def diary():
    entry = get_today_entry()
    mode = get_mode()

    today = datetime.now().strftime("%d/%m/%Y")

    return render_template(
        "diary.html",
        entry=entry,
        mode=mode,
        today=today
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

    today = datetime.now().strftime("%d/%m/%Y")

    entry = get_today_entry()

    new_data = {
        "date": today,
        "content": content,
        "mood": mood
    }

    add_entry(new_data)

    return "saved"

#================================ delete API ================================
@diary_bp.route("/delete", methods=["POST"])
def delete():
    today = datetime.now().strftime("%d/%m/%Y")

    delete_entry(today)

    return "deleted"