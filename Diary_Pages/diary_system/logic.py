from datetime import datetime
from Diary_Pages.diary_system.crud import load_entries
from flask import request

# ================================ get_today_entry(username) ================================
def get_today_entry(username):
    # 找出"这个用户今天写的那篇日记"（如果有的话）。
    # Finds "this user's diary entry for today" (if one exists).

    entries = load_entries()
    today = datetime.now().strftime("%d/%m/%Y")

    for e in entries:
        if e["date"] == today and e.get("username") == username:
            return e

    return None

# ================================ get_mode(username) ================================
def get_mode(username):
    # 决定日记页面该用哪种模式打开：如果今天已经写了内容，就用
    # "view"（查看已有内容）模式；如果今天还没写（或者写了但是空的），
    # 就用 "add"（新增）模式。
    # Decides which mode the diary page should open in: if today's entry
    # already has content, use "view" mode (viewing what's already there);
    # if there's no entry yet today (or it exists but is empty), use "add"
    # mode.

    entry = get_today_entry(username)

    if entry and entry["content"].strip() != "":
        return "view"
    else:
        return "add"

def get_entry_by_date(date, username):
    # 跟 get_today_entry 逻辑一样，只是日期是外部传进来的，
    # 不一定是今天——用来支持"翻到某一天的日记"这个功能。
    # Same logic as get_today_entry, but the date is passed in rather than
    # always being today — this is what supports "jump to a specific
    # day's diary entry".

    entries = load_entries()

    for e in entries:
        if e["date"] == date and e.get("username") == username:
            return e

    return None
