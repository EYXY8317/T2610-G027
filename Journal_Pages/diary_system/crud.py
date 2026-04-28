import json

FILE = "journal.json"

#================================ load_entries() ================================
def load_entries():
    try:
        with open(FILE,"r") as f:
            return json.load(f)
            #convert json to python list (or dictionary)
            #[] is list, {} is dict
            #list = a container that holds multiple items like fruits = ["apple", "banana", "orange"]  
    except:
        return[]
        #empty list if file doesn't exist

#================================ save_entries(entries) ================================
def save_entries(entries):
    with open(FILE, "w") as f:
        json.dump(entries, f, indent=4)
        #convert python list (or dictionary) to json
        #indent=4 is for pretty printing, it adds indentation to make the json file more readable

#================================ add_entry(entry) ================================
def add_entry(entry):
    #entry is a dictionary that contains the data for a single journal entry
    entries = load_entries()
    
    found = False
    
    for i in range(len(entries)):
        if entries[i]["date"] == entry["date"]:
            entries[i] = entry
            found = True
            break

    if not found:
        entries.append(entry)

    save_entries(entries)

#================================ delete_entry(date) ================================
def delete_entry(date):
    entries = load_entries()
    entries = [e for e in entries if e["date"] != date]
    #list comprehension (一行代码生成一个 list)
    #e for e in entries = Take each entry e in entries
    #if e["date"] != date = only keep the entries that do not match the date we want to delete

    save_entries(entries)