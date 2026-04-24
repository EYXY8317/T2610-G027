import json
import os
#Os = Sure file exists and handle file operations

def load_entries():
    #load_entries = Load existing journal entries from the JSON file
    if not os.path.exists("journal.json"):
        with open("journal.json", "w") as file:
            json.dump([], file)
            #Empty list if file doesn't exist
             
    with open("journal.json", "r") as file:
        return json.load(file)
        #JSON data to Python list