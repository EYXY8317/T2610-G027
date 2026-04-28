from datetime import datetime
from diary_system.crud import load_entries


#================================ get_today_entry() ================================
def get_today_entry():
    entries = load_entries()
    today = datetime.now().strftime("%d/%m/%Y")

    for e in entries:
        if e["date"] == today:
            return e

    return None

#================================ get_mode() ================================
def get_mode():
    entry = get_today_entry()

    if entry and entry["content"].strip() != "":
        return "view"
    else:
        return "add"
    
def get_entry_by_date(date):
    entries = load_entries()

    for e in entries:
        if e["date"] == date:
            return e

    return None

