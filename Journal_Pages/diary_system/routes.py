from flask import Blueprint, render_template
from diary_system.logic import get_today_entry, get_mode

diary_bp = Blueprint("diary", __name__)


@diary_bp.route("/diary")
#url for the diary page, when user goes to /diary this function will be called
def diary():
    entry = get_today_entry()
    mode = get_mode()

    return render_template(
    #data send to HTML file and show the data in the HTML file
        "diary.html",
        entry=entry,
        mode=mode
    )