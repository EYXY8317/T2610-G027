import json

FILE = "journal.json"

#================================ load_entries() ================================
def load_entries():
# Function to load all journal entries from file
# 从文件读取所有日记数据 （文件= journal.json）
# If the file doesn't exist, return an empty list
# 如果文件不存在，返回一个空列表

    try:
        with open(FILE,"r") as f:
            return json.load(f)
            # Convert json to python list (or dictionary)
            # [] is list, {} is dict
            # List = a container that holds multiple items like fruits = ["apple", "banana", "orange"]  
    
    except:
    # If any error happens (file not exist / broken json)
    # 如果发生错误（例如文件不存在 / JSON坏掉）
        return[]
        # Empty list if file doesn't exist

#================================ save_entries(entries) ================================
def save_entries(entries):
# Function to save all entries into file
# 这个函数把所有日记数据存进文件

    with open(FILE, "w") as f:
        json.dump(entries, f, indent=4)
        # Convert python list (or dictionary) to json
        # Indent=4 makes it nicely formatted (easy to read)
        
#================================ add_entry(entry) ================================
def add_entry(entry):
# Function to add or update an entry（日记）
# Entry is a dictionary that contains the data for a single journal entry

    entries = load_entries()
    
    found = False
    # Flag variable to check if date already exists
    # 标记变量：用来判断有没有找到同一个日期
    
    for i in range(len(entries)):
    # Loop through list using index
    # 用 index（编号）去遍历整个 list

    #len(entries) = number of items inside the list
    # Example ： entries = ["A", "B", "C"]  ~ len(entries) = 3

    #range(len(entries))
    #range(3) → gives numbers: 0, 1, 2
    #Python index start from 0

    # for i in =Loop through each number one by one
    #Example : i=0
    #          i=1
    #          i=2

        if entries[i]["date"] == entry["date"]:
        # Check if same date exists
        # 检查有没有相同的日期

        # entries[i] = Get one item from the list using index
        # ["date"] = Get the value of "date" from the dictionary
        # == Check if both dates are the same

            entries[i] = entry
            # Replace old entry with new entry
            # 如果日期一样 → 用新的 entry 覆盖旧的

            # Entries = All old data
            # Entry = New input

            found = True
            # Mark as found
            # 标记为“已经找到”

            break

    if not found:
    # If no same date found
    
        entries.append(entry)
        # Add new entry into list

    save_entries(entries)    
    # Save updated list back to file

#================================ delete_entry(date) ================================
def delete_entry(date):
    entries = load_entries()
    entries = [e for e in entries if e["date"] != date]
    # List comprehension (create new filtered list)
    # List comprehension（用一行代码生成新 list）

    # e for e in entries
    # 从 entries 里面一个一个拿出 e
    # Entries = 一个 list（列表），用来存全部日记

    # if e["date"] != date
    # 只保留日期 != 要删除的日期

    # Meaning: remove the entry with matching date
    # 意思：删除匹配这个 date 的日记
        #Example:
        #entries = [                                         e for e in entries（take one entry each time）          if e["date"] != date                                    Only True values will be added into the new list
        #{"date": "2026-04-30", "content": "A"},             第一次 e = {"date": "2026-04-30", "content": "A"}       date = "2026-05-01" 
        #{"date": "2026-05-01", "content": "B"},             第二次 e = {"date": "2026-05-01", "content": "B"}       第一次 True
        #{"date": "2026-05-02", "content": "C"}              第三次 e = {"date": "2026-05-02", "content": "C"}       第二次 False ("2026-05-01" != "2026-05-01") - 被删除
        #]                                                                                                           第一次 Ture

    save_entries(entries)