from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from Journal_Pages.diary_system.crud import add_entry, delete_entry
from Journal_Pages.diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime
from Journal_Pages.diary_system.encouragement_data import (
    happy_list,
    sad_list,
    angry_list,
    anxious_list,
    unwell_list,
    TOPIC_KEYWORDS,
    TOPIC_QUOTES
)
import os
import re
import json
import time
import random
from werkzeug.utils import secure_filename


#================================ quote helpers ================================

def extract_diary_text(content):
    """Pulls the plain text the user actually typed out of the canvas'
    ||ITEM||-joined JSON chunks (ignores images/meta), for keyword matching."""
    if not content:
        return ""
    texts = []
    for chunk in content.split("||ITEM||"):
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            item = json.loads(chunk)
        except ValueError:
            continue
        if item.get("type") == "text":
            texts.append(re.sub(r"<[^>]+>", " ", item.get("html", "")))
    return " ".join(texts)


def pick_quote(mood, diary_text):
    """Picks an encouragement quote for the given mood. If the diary text
    mentions keywords tied to a known topic (school/work, relationship,
    health), prefers a quote written for that topic; otherwise falls back
    to a random quote from the mood's general list."""
    base_lists = {
        "happy":   happy_list,
        "sad":     sad_list,
        "angry":   angry_list,
        "anxious": anxious_list,
        "unwell":  unwell_list,
    }
    mood_key = (mood or "").lower()
    base = base_lists.get(mood_key)
    if not base:
        return ""

    text_lower = (diary_text or "").lower()
    topic_quotes = TOPIC_QUOTES.get(mood_key, {})
    for topic, keywords in TOPIC_KEYWORDS.items():
        if topic in topic_quotes and any(kw in text_lower for kw in keywords):
            return random.choice(topic_quotes[topic])

    return random.choice(base)


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
    if "user" not in session:
        return jsonify({"entries": []})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
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

    if "user" not in session:
        return redirect(url_for("login"))

    date = request.args.get("date")

    if not date:
        date = datetime.now().strftime("%d/%m/%Y")

    from Journal_Pages.diary_system.logic import get_entry_by_date

    entry = get_entry_by_date(date, session["user"])

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

    if "user" not in session:
        return {"message": ""}, 401

    content = request.form.get("content")
    mood = request.form.get("mood")
    date = request.form.get("date")
    topic = request.form.get("topic")

    from Journal_Pages.diary_system.logic import get_entry_by_date

    existing = get_entry_by_date(date, session["user"])

    # ================= MOOD CHANGE (or missing quote) =================
    # Picks a quote for the (new) mood, preferring one tailored to whatever
    # topic the diary text itself mentions (school/work, relationship, health).
    # Also backfills entries saved before quote generation existed/worked.

    if mood and (not existing or mood != existing.get("mood") or not existing.get("quote")):
        diary_text = extract_diary_text(content)
        message = pick_quote(mood, diary_text)

    # ================= KEEP OLD QUOTE =================

    elif existing and existing.get("quote"):
        message = existing.get("quote")

    else:
        message = ""

    new_data = {
        "date": date,
        "username": session["user"],
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
    if "user" not in session:
        return jsonify({"dates": []})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
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

    if "user" not in session:
        return "unauthorized", 401

    date = request.form.get("date")
    delete_entry(date, session["user"])
    return "deleted"


#================================ search API ================================

@diary_bp.route("/search", methods=["POST"])
def search():

    if "user" not in session:
        return {"results": []}

    from Journal_Pages.diary_system.crud import load_entries

    keyword = request.form.get("keyword")

    if not keyword:
        return {"results": []}

    keyword = keyword.lower().replace(" ", "")
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
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
                "date":    e["date"],
                "topic":   e.get("topic", ""),
                "mood":    e.get("mood", ""),
                "content": e.get("content") or ""
            })

    return {"results": results}


#================================ get_entry API ================================

@diary_bp.route("/get_entry", methods=["POST"])
def get_entry():

    if "user" not in session:
        return {}

    from Journal_Pages.diary_system.logic import get_entry_by_date

    date = request.form.get("date")
    entry = get_entry_by_date(date, session["user"])
    return entry or {}


#================================ diary_moods API ================================

@diary_bp.route("/diary_moods", methods=["GET"])
def diary_moods():
    if "user" not in session:
        return jsonify({})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
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
    if "user" not in session:
        return jsonify({})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
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
