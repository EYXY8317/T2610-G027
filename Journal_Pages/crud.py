import json
import os
#Os = Sure file exists and handle file operations
from datetime import datetime

#Read function
def load_entries():
    #load_entries = Load existing journal entries from the JSON file
    if not os.path.exists("journal.json"):
        with open("journal.json", "w") as file:
            json.dump([], file)
            #Empty list if file doesn't exist
             
    with open("journal.json", "r") as file:
        return json.load(file)
        #JSON data to Python list

#Add function
def add_entry(content):
    entries = load_entries()

    new_id = 1
    if entries:
        new_id = max(e["id"] for e in entries) + 1
        #Find largest id in existing entries and add 1 for new entry 找最大编号，再加1
        # For e in entries = Loop through existing entries
        #E["id"] = Get id of each entry
        #(E["id"] for e in entries) = Become a id list
        #Max() = Get highest id
        #New_id = Highest id + 1 = Unique id for new entry
        
    entries.append({
        "id": new_id,
        "content" : "content",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    with open("json.json","w") as file:
        json.dump(entries, file, indent=4)

    return entries