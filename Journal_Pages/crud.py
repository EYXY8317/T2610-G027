import json
import os
#Os = Sure file exists and handle file operations
from datetime import datetime

def load_entries():
    #load_entries = Load existing journal entries from the JSON file
    if not os.path.exists("journal.json"):
        with open("journal.json", "w") as file:
            json.dump([], file)
            #Empty list if file doesn't exist
             
    with open("journal.json", "r") as file:
        return json.load(file)
        #JSON data to Python list

def save_entries(entries):
#Save the list of journal entries back to the JSON file
    with open("journal.json", "w") as file:
        json.dump(entries, file)

def add_entry(content):
#Add a new journal entry with the current timestamp
    entries = load_entries()

    new_id = len(entries)+1
    #Len(entries) = Number of existing entries, +1 for new entry ID

    entries.append({
    #Add new entry to the list with content and timestamp
        "id": new_id,
        "content":content,
        #Key = "content", value = content (user input)
        "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
       
    save_entries(entries)
    return entries

def delete_entry(entry_id):
    entries = load_entries()

    entries = [e for e in entries if str(e["id"]) != str(entry_id)]
    #E = each entry in entries, keep if index of entry as string is not equal to enter_id
    save_entries(entries)