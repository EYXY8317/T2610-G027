import json
import os
#Os = Sure file exists and handle file operations
from datetime import datetime

#Read function --------------------------------------
def load_entries():
    #load_entries = Load existing journal entries from the JSON file
    if not os.path.exists("journal.json"):
        with open("journal.json", "w") as file:
            json.dump([], file)
            #Empty list if file doesn't exist
             
    with open("journal.json", "r") as file:
        return json.load(file)
        #JSON data to Python list

#Add function --------------------------------------
def add_entry(content):
    entries = load_entries()
    #Entries = list (all entries) 多个日记
    #Entry = one dictionary (one record) 一条日记

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
        "content" : content,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    with open("journal.json","w") as file:
        json.dump(entries, file, indent=4)

    return entries

#Delete function --------------------------------------
def delete_entry(entry_id):
    entries = load_entries()

    entries = [e for e in entries if str(e["id"]) != str(entry_id)]
    #Create a new list of entries
    #For e in entries = loop through each entry
    #E["id"] = get the id of each entry
    #Str(e["id"]) != str(entry_id)
    #Keep the entry if its id is NOT equal to the delete id
    #把“符合条件的”全部放进新 list
    
    with open("journal.json","w") as file:
    #Open the file and prepare to overwrite with new data
        json.dump(entries, file, indent=4)

    return entries

#Update function --------------------------------------
def update_entry(entry_id,new_content):
# Define a function to update an existing entry
    entries = load_entries()

    for e in entries:
        if str(e["id"]) == str(entry_id):
            e["content"] = new_content

    with open ("journal.json","w") as file:
        json.dump(entries, file, indent=4)

    return entries