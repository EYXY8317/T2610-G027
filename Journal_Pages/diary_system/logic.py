from datetime import datetime
from diary_system.crud import load_entries


def get_today_entry():
    entries = load_entries()
    today = datetime.now().strftime("%d/%m/%Y")

    for e in entries:
        if e["date"] == today:
            return e

    return None

def get_mode():
    entry = get_today_entry()

    if entry:
        return "view"
    else:
        return "add"