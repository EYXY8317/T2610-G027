from flask import Blueprint, render_template, request, jsonify, session
from Diary_Pages.diary_system.crud import add_entry, delete_entry
from Diary_Pages.diary_system.logic import get_today_entry, get_mode
from datetime import date, datetime
from Diary_Pages.diary_system.encouragement_data import (
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


# ================================ quote helpers ================================
# ================================ 语录相关辅助函数 ================================

def extract_diary_text(content):
    """Pulls the plain text the user actually typed out of the canvas'
    ||ITEM||-joined JSON chunks (ignores images/meta), for keyword matching."""
    # 把日记内容（一串用 ||ITEM|| 分隔的 JSON 小段）里，用户真正打出来的
    # 纯文字部分抽取出来（跳过图片等非文字区块），用来做关键词匹配。

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
            # 这个区块不是合法 JSON，直接跳过它，不中断整个循环。
            # This chunk isn't valid JSON — skip it without breaking the
            # whole loop.
            continue
        if item.get("type") == "text":
            texts.append(re.sub(r"<[^>]+>", " ", item.get("html", "")))
    return " ".join(texts)


def pick_quote(mood, diary_text):
    """Picks an encouragement quote for the given mood. If the diary text
    mentions keywords tied to a known topic (school/work, relationship,
    health), prefers a quote written for that topic; otherwise falls back
    to a random quote from the mood's general list."""
    # 根据心情挑一句鼓励的话。如果日记正文里提到了某个已知主题
    # （学业/工作、感情、健康）相关的关键词，就优先用专门为这个主题写的
    # 语录；否则就从这个心情的通用语录清单里随机挑一句。

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

    # 依次检查每个主题的关键词，只要日记正文里出现了任何一个关键词
    # （any(...)），就用这个主题对应的专属语录，而不是通用语录。
    # Checks each topic's keywords in turn — as soon as any single keyword
    # (any(...)) appears in the diary text, that topic's dedicated quotes
    # are used instead of the general mood list.

    for topic, keywords in TOPIC_KEYWORDS.items():
        if topic in topic_quotes and any(kw in text_lower for kw in keywords):
            return random.choice(topic_quotes[topic])

    return random.choice(base)


# ================================ blueprint ================================
# ================================ 蓝图 ================================

diary_bp = Blueprint("diary", __name__, template_folder="../../templates")


# ================================ route ================================
# ================================ 路由 ================================

@diary_bp.route("/diary_homepage")
def diary_homepage_index():
    # 这个路由不走 Jinja 模板渲染，而是直接把 DiaryHomepage 文件夹里的
    # index.html 原封不动地发送给浏览器——因为那个页面完全由前端 JS
    # 自己组装内容（widget 系统），不需要服务器端先做任何模板替换。
    # This route doesn't render a Jinja template — it sends the
    # DiaryHomepage folder's index.html file straight to the browser
    # as-is, because that page assembles all its content on the frontend
    # (the widget system) and needs no server-side template substitution.

    from flask import send_from_directory as _sfd
    base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "DiaryHomepage")
    return _sfd(base, "index.html")


@diary_bp.route("/journal_entries_list")
def journal_entries_list():
    if "user" not in session:
        return jsonify({"entries": []})
    from Diary_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
    result = []

    # reversed(entries)：日记是按写入顺序存的（旧的在前），倒过来遍历
    # 就能让最近写的日记排在结果列表最前面。
    # reversed(entries): entries are stored in the order they were
    # written (oldest first); iterating in reverse puts the most recently
    # written entries first in the result list.

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

    from Diary_Pages.diary_system.logic import get_entry_by_date

    entry = get_entry_by_date(date, user)

    if entry and entry["content"].strip() != "":
        mode = "view"
    else:
        mode = "add"

    return render_template(
        "diary.html",
        entry=entry,
        mode=mode,
        today=date,
        logged_in=bool(user)
    )


# ================================ autosave API ================================
# ================================ 自动保存接口 ================================

@diary_bp.route("/autosave", methods=["POST"])
def autosave():

    if "user" not in session:
        return {"message": ""}, 401

    content = request.form.get("content")
    mood = request.form.get("mood")
    date = request.form.get("date")
    topic = request.form.get("topic")

    from Diary_Pages.diary_system.logic import get_entry_by_date

    existing = get_entry_by_date(date, session["user"])

    # ================= MOOD CHANGE (or missing quote) =================
    # ================= 心情改变了（或者还没有语录） =================
    # Picks a quote for the (new) mood, preferring one tailored to whatever
    # topic the diary text itself mentions (school/work, relationship, health).
    # Also backfills entries saved before quote generation existed/worked.
    # 只在这三种情况下才重新挑一句新语录：心情有填、这天原本没有记录、
    # 或者心情跟之前存的不一样了、又或者之前那条记录根本没有语录
    # （比如是"语录功能"上线之前存的旧数据，借这次自动保存顺便补上）。
    # A fresh quote is only re-picked in these cases: a mood was provided,
    # AND either there's no existing entry yet, the mood changed from what
    # was previously saved, or the existing entry simply has no quote at
    # all (e.g. old data saved before the quote feature existed —
    # this autosave opportunistically backfills it).

    if mood and (not existing or mood != existing.get("mood") or not existing.get("quote")):
        diary_text = extract_diary_text(content)
        message = pick_quote(mood, diary_text)

    # ================= KEEP OLD QUOTE =================
    # ================= 沿用旧语录 =================
    # 心情没变、而且已经有语录了——继续用原本那句，不要每次自动保存
    # 都随机换一句新的（不然用户打字打到一半，语录却一直在变，很奇怪）。
    # The mood hasn't changed and a quote already exists — keep reusing
    # the same one, rather than re-rolling a new random quote on every
    # single autosave (otherwise the quote would keep changing mid-typing,
    # which would feel strange).

    elif existing and existing.get("quote"):
        message = existing.get("quote")

    else:
        message = ""

    new_data = {
        "date": date,
        "username": session["user"],
        "content": content,
        # mood/topic 如果这次请求里没带（比如自动保存时表单里恰好是空的），
        # 就沿用上一次已经存好的值，而不是把它清空覆盖掉。
        # If mood/topic weren't sent in this request (e.g. the form field
        # happened to be empty this time), fall back to whatever was
        # already saved, instead of overwriting it with a blank value.
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


# ================================ journal_dates API ================================
# ================================ 日记日期列表接口 ================================

@diary_bp.route("/journal_dates", methods=["GET"])
def journal_dates():
    if "user" not in session:
        return jsonify({"dates": []})
    from Diary_Pages.diary_system.crud import load_entries
    entries = [e for e in load_entries() if e.get("username") == session["user"]]
    dates = []
    for e in entries:
        raw     = e.get("date", "")
        content = (e.get("content") or "").strip()
        if not raw or not content:
            continue

        # 日期在数据里可能是两种格式之一（旧数据 "DD/MM/YYYY"，
        # 新数据 "YYYY-MM-DD"）——依次尝试两种格式解析，哪个能解析成功
        # 就用哪个，最后统一转换输出成 "YYYY-MM-DD"，方便前端日历组件
        # 统一处理，不用自己再判断两种格式。
        # The date might be stored in either of two formats (old data as
        # "DD/MM/YYYY", newer data as "YYYY-MM-DD") — each format is tried
        # in turn, whichever one successfully parses is used, and the
        # result is always normalized to "YYYY-MM-DD" output so the
        # frontend calendar widget only ever has to deal with one format.

        for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(raw, fmt)
                dates.append(dt.strftime("%Y-%m-%d"))
                break
            except ValueError:
                continue
    return jsonify({"dates": dates})


# ================================ delete API ================================
# ================================ 删除接口 ================================

@diary_bp.route("/delete", methods=["POST"])
def delete():

    if "user" not in session:
        return "unauthorized", 401

    date = request.form.get("date")
    delete_entry(date, session["user"])
    return "deleted"


# ================================ search API ================================
# ================================ 搜索接口 ================================

@diary_bp.route("/search", methods=["POST"])
def search():

    if "user" not in session:
        return {"results": []}

    from Diary_Pages.diary_system.crud import load_entries

    keyword = request.form.get("keyword")

    if not keyword:
        return {"results": []}

    # 统一转小写、去掉所有空格再比较——这样搜索不区分大小写，
    # 也不会因为用户多打/少打了一个空格就搜不到结果。
    # Lowercasing and stripping all spaces before comparing makes the
    # search case-insensitive, and immune to the user typing an extra or
    # missing space compared to what's stored.

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


# ================================ get_entry API ================================
# ================================ 获取指定日期日记接口 ================================

@diary_bp.route("/get_entry", methods=["POST"])
def get_entry():

    if "user" not in session:
        return {}

    from Diary_Pages.diary_system.logic import get_entry_by_date

    date = request.form.get("date")
    entry = get_entry_by_date(date, session["user"])
    return entry or {}


# ================================ diary_moods API ================================
# ================================ 每日心情映射接口 ================================

@diary_bp.route("/diary_moods", methods=["GET"])
def diary_moods():
    if "user" not in session:
        return jsonify({})
    from Diary_Pages.diary_system.crud import load_entries
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


# ================================ diary_data API ================================
# ================================ 日记数据接口（心情+主题） ================================

@diary_bp.route("/diary_data", methods=["GET"])
def diary_data():
    if "user" not in session:
        return jsonify({})
    from Diary_Pages.diary_system.crud import load_entries
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


# ================================ get_message API ================================
# ================================ 获取随机语录接口 ================================

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


# ================================ weather API ================================
# ================================ 天气接口 ================================
# 注意：下面的 api_key 是直接写死在代码里的（没有放进环境变量），
# 这个仓库要是公开分享出去，这把 key 就跟着一起泄露了。因为是
# OpenWeather 的免费额度 key，泄露的影响有限（顶多被别人拿去消耗掉
# 免费额度），但更规范的做法是把它放进环境变量里读取，而不是写死在
# 源代码文件里。
# Note: the api_key below is hardcoded directly in the source (not read
# from an environment variable). If this repo is ever shared/made public,
# this key would be exposed along with it. Since it's a free-tier
# OpenWeather key, the impact of exposure is limited (at worst someone
# else burns through the free quota), but the more correct practice is to
# read it from an environment variable rather than hardcoding it in a
# source file.

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


# ================================ weather forecast API ================================
# ================================ 天气预报接口 ================================

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


# ================================ upload image API ================================
# ================================ 图片上传接口 ================================

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@diary_bp.route("/upload_image", methods=["POST"])
def upload_image():

    file = request.files.get("file")

    if not file:
        return jsonify({"error": "no file"}), 400

    # secure_filename(...)：Werkzeug 提供的安全处理函数，把文件名里
    # 危险的字符（比如 "../"这种路径穿越攻击写法）清理掉，防止恶意
    # 文件名把文件写到预期之外的目录。
    # 再加上时间戳，避免两个用户上传同名文件时互相覆盖。
    # secure_filename(...): a Werkzeug safety function that strips
    # dangerous characters from a filename (like "../" path-traversal
    # attempts), preventing a malicious filename from writing outside the
    # intended folder. A timestamp is also appended so two users
    # uploading a file with the same name don't overwrite each other.

    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    filename = f"{name}_{int(time.time())}{ext}"

    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    url = "/diary_static/uploads/" + filename
    return jsonify({"url": url})
