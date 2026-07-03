<<<<<<< HEAD
from flask import Blueprint, render_template, request, jsonify, session
=======
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
from Journal_Pages.diary_system.crud import add_entry, delete_entry
from Journal_Pages.diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime, timedelta
from Journal_Pages.diary_system.encouragement_data import (
    happy_list,
    sad_list,
    angry_list
)
import os
import time
import random
import json
import re
import html as _html
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

    user = session.get("user")

    date = request.args.get("date")

    if not date:
        date = datetime.now().strftime("%d/%m/%Y")

    entry = None
    if user:
        from Journal_Pages.diary_system.logic import get_entry_by_date
        entry = get_entry_by_date(date, user)

    if not user:
        mode = "view"
    elif entry and entry["content"].strip() != "":
        mode = "view"
    else:
        mode = "add"

    return render_template(
        "diary.html",
        entry=entry,
        mode=mode,
        today=date,
        logged_in=bool(user),
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


#================================ diary_analyze helpers ================================

def _extract_diary_text(content_html):
    """Extract plain text from diary content (JSON chunks joined by ||ITEM||)."""
    if not content_html:
        return ""
    chunks = content_html.split("||ITEM||")
    texts = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            d = json.loads(chunk)
            if d.get("type") == "text":
                raw_html = d.get("html", "")
                text = re.sub(r"<[^>]+>", " ", raw_html)
                text = _html.unescape(text)
                text = re.sub(r"\s+", " ", text).strip()
                if text:
                    texts.append(text)
        except Exception:
            text = re.sub(r"<[^>]+>", " ", chunk)
            text = _html.unescape(text)
            text = re.sub(r"\s+", " ", text).strip()
            if text and not text.startswith("{"):
                texts.append(text)
    return " ".join(texts)


def _analyze_diary_with_ai(text, diary_date_iso):
    """Call Claude API to extract todos, events, and purchase keywords from diary text."""
    import requests as _req
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"todos": [], "events": [], "purchase_keywords": []}

    today    = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    year     = datetime.now().year

    prompt = (
        f"You are analyzing a personal diary entry. Extract structured data and return ONLY valid JSON.\n\n"
        f"Diary date: {diary_date_iso}\nToday: {today}\nTomorrow: {tomorrow}\n\n"
        f"Diary text:\n{text}\n\n"
        f"Extract these fields:\n"
        f'1. "todos": Items to buy or tasks to do. Each: {{"item": string, "date": "YYYY-MM-DD", "category": "shopping"|"personal"}}. '
        f"Use {tomorrow} if no date is mentioned.\n"
        f'2. "events": Scheduled events with a specific date. Each: {{"description": string, "date": "YYYY-MM-DD"}}.\n'
        f'3. "purchase_keywords": Specific food items or products mentioned (for matching finance records). Array of strings.\n\n'
        f'Date hints: "1/7" means {year}-07-01, "明天" means {tomorrow}, "后天" means '
        f'{(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")}.\n'
        f'Return ONLY valid JSON. If nothing found return {{"todos":[],"events":[],"purchase_keywords":[]}}.'
    )

    try:
        resp = _req.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 600,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=20,
        )
        if resp.status_code != 200:
            return {"todos": [], "events": [], "purchase_keywords": []}
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rstrip("`").strip()
        return json.loads(raw)
    except Exception:
        return {"todos": [], "events": [], "purchase_keywords": []}


def _find_finance_matches(plain_text, username, diary_date_iso, ai_keywords=None):
    """Find today's finance records whose item names appear in the diary text."""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    f_expense = os.path.join(BASE_DIR, "Finance", "expenses.json")
    try:
        with open(f_expense, "r", encoding="utf-8") as f:
            expenses = json.load(f)
    except Exception:
        return []

    user_expenses = [
        e for e in expenses
        if e.get("username") == username and e.get("date") == diary_date_iso
    ]

    text_lower = plain_text.lower()
    matches = []
    seen = set()

    for exp in user_expenses:
        item = (exp.get("item") or "").strip()
        if not item or item in seen:
            continue
        if item.lower() in text_lower:
            seen.add(item)
            matches.append({
                "word": item,
                "amount": exp.get("amount", 0),
                "category": exp.get("category", ""),
                "type": exp.get("type", ""),
            })

    if ai_keywords:
        for kw in ai_keywords:
            kw = kw.strip()
            if not kw or kw in seen:
                continue
            if kw.lower() not in text_lower:
                continue
            for exp in user_expenses:
                item = (exp.get("item") or "").strip()
                if item.lower() in kw.lower() or kw.lower() in item.lower():
                    seen.add(kw)
                    matches.append({
                        "word": kw,
                        "amount": exp.get("amount", 0),
                        "category": exp.get("category", ""),
                        "type": exp.get("type", ""),
                    })
                    break

    return matches


#================================ diary_analyze API ================================

@diary_bp.route("/diary_analyze", methods=["POST"])
def diary_analyze():
    content_html = request.form.get("content", "")
    diary_date   = request.form.get("date", "")
    username     = session.get("user", "")

    plain_text = _extract_diary_text(content_html)
    if not plain_text or len(plain_text.strip()) < 3:
        return jsonify({"todos": [], "events": [], "finance_matches": []})

    diary_date_iso = ""
    if diary_date:
        try:
            diary_date_iso = datetime.strptime(diary_date, "%d/%m/%Y").strftime("%Y-%m-%d")
        except Exception:
            pass
    if not diary_date_iso:
        diary_date_iso = datetime.now().strftime("%Y-%m-%d")

    ai_result      = _analyze_diary_with_ai(plain_text, diary_date_iso)
    finance_matches = _find_finance_matches(
        plain_text, username, diary_date_iso,
        ai_result.get("purchase_keywords", [])
    )

    return jsonify({
        "todos":           ai_result.get("todos", []),
        "events":          ai_result.get("events", []),
        "finance_matches": finance_matches,
    })


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
<<<<<<< HEAD
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
=======
    if "user" not in session:
        return jsonify({})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
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
<<<<<<< HEAD
    from Journal_Pages.diary_system.crud import load_entries
    entries = load_entries()
=======
    if "user" not in session:
        return jsonify({})
    from Journal_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
>>>>>>> a857ae47f922cc5718ae9f2e06461a517aa4a7d1
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
