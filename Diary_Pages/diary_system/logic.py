from datetime import datetime
from Diary_Pages.diary_system.crud import load_entries
from flask import request

#================================ get_today_entry(username) ================================
def get_today_entry(username):
    entries = load_entries()
    today = datetime.now().strftime("%d/%m/%Y")

    for e in entries:
        if e["date"] == today and e.get("username") == username:
            return e

    return None

#================================ get_mode(username) ================================
def get_mode(username):
    entry = get_today_entry(username)

    if entry and entry["content"].strip() != "":
        return "view"
    else:
        return "add"

def get_entry_by_date(date, username):
    entries = load_entries()

    for e in entries:
        if e["date"] == date and e.get("username") == username:
            return e

    return None