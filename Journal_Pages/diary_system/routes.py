from flask import Blueprint, render_template, request, jsonify
from Journal_Pages.diary_system.crud import add_entry, delete_entry
from Journal_Pages.diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime
from Journal_Pages.diary_system.encouragement_data import (
    happy_list,
    sad_list,
    angry_list
)
import os
import time
import random
from werkzeug.utils import secure_filename


#================================ blueprint ================================

diary_bp = Blueprint("diary", __name__, template_folder="../../templates")


#================================ route ================================

@diary_bp.route("/journal")
def journal_index():
    from flask import send_from_directory as _sfd
    base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "Journal_HomePages")
    return _sfd(base, "index.html")


@diary_bp.route("/journal_entries_list")
def journal_entries_list():
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
    result = []
    for e in reversed(entries):
        content = (e.get("content") or "").strip()
        if not content:
            continue
        raw_text = content.replace("||ITEM||", " ")
        try:
            import json as _json
            first_chunk = raw_text.split("||ITEM||")[0].strip() if "||ITEM||" in raw_text else raw_text
            parsed = _json.loads(first_chunk)
            import re
            preview = re.sub(r"<[^>]+>", "", parsed.get("html", ""))[:60]
        except Exception:
            import re
            preview = re.sub(r"<[^>]+>", "", raw_text)[:60]
        result.append({
            "date":    e.get("date", ""),
            "topic":   e.get("topic", ""),
            "mood":    e.get("mood", ""),
            "preview": preview,
        })
    return jsonify({"entries": result[:20]})


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

    from Journal_Pages.diary_system.logic import get_entry_by_date

    existing = get_entry_by_date(date)

    # ================= MOOD CHANGE =================

    if existing and mood and mood != existing.get("mood"):

        if mood == "Happy":
            message = random.choice(happy_list)
        elif mood == "Sad":
            message = random.choice(sad_list)
        elif mood == "Angry":
            message = random.choice(angry_list)
        else:
            message = ""

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


#================================ journal_dates API ================================

@diary_bp.route("/journal_dates", methods=["GET"])
def journal_dates():
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
    dates = []
    for e in entries:
        raw     = e.get("date", "")
        content = (e.get("content") or "").strip()
        if not raw or not content:
            continue
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(raw, fmt)
                dates.append(dt.strftime("%Y-%m-%d"))
                break
            except ValueError:
                continue
    return jsonify({"dates": dates})


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
                "content": (e.get("content") or "")[:50]
            })

    return {"results": results}


#================================ get_entry API ================================

@diary_bp.route("/get_entry", methods=["POST"])
def get_entry():

    from Journal_Pages.diary_system.logic import get_entry_by_date

    date = request.form.get("date")
    entry = get_entry_by_date(date)
    return entry or {}


#================================ diary_moods API ================================

@diary_bp.route("/diary_moods", methods=["GET"])
def diary_moods():
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
    moods = {}
    for e in entries:
        raw = e.get("date", "")
        mood = e.get("mood", "")
        if not mood:
            continue
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(raw, fmt)
                moods[dt.strftime("%Y-%m-%d")] = mood
                break
            except ValueError:
                continue
    return jsonify(moods)


#================================ diary_data API ================================

@diary_bp.route("/diary_data", methods=["GET"])
def diary_data():
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
    result = {}
    for e in entries:
        raw   = e.get("date", "")
        mood  = e.get("mood", "")
        topic = e.get("topic", "")
        if not mood and not topic:
            continue
        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                dt  = datetime.strptime(raw, fmt)
                iso = dt.strftime("%Y-%m-%d")
                result[iso] = {"mood": mood, "topic": topic}
                break
            except ValueError:
                continue
    return jsonify(result)


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

    import requests

    city = "Cyberjaya"
    api_key = "825799c844694c8dcff5bf94fa943a5a"

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}"
        f"&appid={api_key}"
        f"&units=metric"
    )

    response = requests.get(url)
    return jsonify(response.json())


#================================ weather forecast API ================================

@diary_bp.route("/weather_forecast")
def weather_forecast():

    import requests

    city = "Cyberjaya"
    api_key = "825799c844694c8dcff5bf94fa943a5a"

    url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?q={city}"
        f"&appid={api_key}"
        f"&units=metric"
    )

    response = requests.get(url)
    return jsonify(response.json())


#================================ upload image API ================================

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@diary_bp.route("/upload_image", methods=["POST"])
def upload_image():

    file = request.files.get("file")

    if not file:
        return jsonify({"error": "no file"}), 400

    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    filename = f"{name}_{int(time.time())}{ext}"

    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    url = "/diary_static/uploads/" + filename
    return jsonify({"url": url})
