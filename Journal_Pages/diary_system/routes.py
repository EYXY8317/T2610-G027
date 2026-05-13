from flask import Blueprint, render_template, request, jsonify
from Journal_Pages.diary_system.crud import add_entry, delete_entry
from Journal_Pages.diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime
from Journal_Pages.diary_system.encouragement_data import (
    happy_list,
    sad_list,
    angry_list
)

import random
import requests


#================================ blueprint ================================

diary_bp = Blueprint("diary", __name__)


#================================ route ================================

@diary_bp.route("/diary")
def diary():

    date = request.args.get("date")

    if not date:

        date = datetime.now().strftime("%d/%m/%Y")

    from Journal_Pages.diary_system.logic import get_entry_by_date

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


#================================ autosave API ================================

@diary_bp.route("/autosave", methods=["POST"])
def autosave():

    content = request.form.get("content")

    mood = request.form.get("mood")

    date = request.form.get("date")

    topic = request.form.get("topic")

    from Journal_Pages.diary_system.logic import (
        get_entry_by_date
    )

    existing = get_entry_by_date(date)

    # ================= MOOD CHANGE =================

    if existing and mood and mood != existing.get("mood"):

        if mood == "Happy":

            message = random.choice(happy_list)

        elif mood == "Sad":

            message = random.choice(sad_list)

        elif mood == "Angry":

            message = random.choice(angry_list)

    # ================= KEEP OLD QUOTE =================

    elif existing and existing.get("quote"):

        message = existing.get("quote")

    else:

        message = ""

    new_data = {

        "date": date,

        "content": content,

        "mood": (
            mood if mood
            else (existing.get("mood") if existing else "")
        ),

        "topic": (
            topic if topic
            else (existing.get("topic") if existing else "")
        ),

        "quote": message

    }

    add_entry(new_data)

    return {"message": message}


#================================ delete API ================================

@diary_bp.route("/delete", methods=["POST"])
def delete():

    date = request.form.get("date")

    delete_entry(date)

    return "deleted"


#================================ search API ================================

@diary_bp.route("/search", methods=["POST"])
def search():

    from Journal_Pages.diary_system.crud import load_entries

    keyword = request.form.get("keyword")

    if not keyword:

        return {"results": []}

    keyword = keyword.lower().replace(" ", "")

    entries = load_entries()

    results = []

    for e in entries:

        content = (
            (e.get("content") or "")
            .lower()
            .replace(" ", "")
        )

        topic = (
            (e.get("topic") or "")
            .lower()
            .replace(" ", "")
        )

        if keyword in content or keyword in topic:

            results.append({

                "date": e["date"],

                "topic": e.get("topic", ""),

                "content": (
                    (e.get("content") or "")[:50]
                )

            })

    return {"results": results}


#================================ get_entry API ================================

@diary_bp.route("/get_entry", methods=["POST"])
def get_entry():

    from Journal_Pages.diary_system.logic import (
        get_entry_by_date
    )

    date = request.form.get("date")

    entry = get_entry_by_date(date)

    return entry or {}


#================================ get_message API ================================

@diary_bp.route("/get_message")
def get_message():

    mood = request.args.get("mood")

    if mood == "Happy":

        return random.choice(happy_list)

    elif mood == "Sad":

        return random.choice(sad_list)

    elif mood == "Angry":

        return random.choice(angry_list)

    else:

        return ""


#================================ weather API ================================

@diary_bp.route("/weather")
def weather():

    city = "Cyberjaya"

    api_key = "825799c844694c8dcff5bf94fa943a5a"

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}"
        f"&appid={api_key}"
        f"&units=metric"
    )

    response = requests.get(url)

    data = response.json()

    return jsonify(data)