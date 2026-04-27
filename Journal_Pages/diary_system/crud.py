import json

FILE = "journal.json"

# Read function ==========================================================================
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

# Save function ==========================================================================
def save_entries(entries):
    with open(FILE, "w") as f:
        json.dump(entries, f, indent=4)
        #convert python list (or dictionary) to json
        #indent=4 is for pretty printing, it adds indentation to make the json file more readable

# Add function ==========================================================================
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

# Update function ==========================================================================
def update_entry(new_entry):
    entries = load_entries()

    for i in range(len(entries)):
    #from 0 to the number of entries in the list, we are iterating through the list of entries
    #len() is the number of items in a list, in this case we are getting the number of entries in the list of entries
        if entries[i]["id"] == new_entry["id"]:
        #Find the entry with the same id as the new entry, we are comparing the id of each entry in the list of entries with the id of the new entry
            entries[i] = new_entry

            break

    save_entries(entries)

# Delete function ==========================================================================
def delete_entry(entry_id):
    entries = load_entries()
    entries = [e for e in entries if e["id"] != entry_id]
    #for e in entries = take one entry at a time from the list of entries
    #e = diary entry, we are assigning the current entry to the variable e
    #if e["id"] != entry_id = if the id of the current entry is not equal to the id of the entry we want to delete then we keep it in the list
    save_entries(entries)