import os
from db_store import load_data, save_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILE = os.path.join(BASE_DIR, "journal.json")

#================================ load_entries() ================================
def load_entries():
# Function to load all journal entries from file
# 从文件读取所有日记数据 （文件= journal.json）

    return load_data(FILE, [])

#================================ save_entries(entries) ================================
def save_entries(entries):
# Function to save all entries into file
# 这个函数把所有日记数据存进文件

    save_data(FILE, entries)
        
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

        if (entries[i]["date"] == entry["date"]
                and entries[i].get("username") == entry.get("username")):
        # Check if same date AND same user exists
        # 检查有没有相同的日期而且是同一个用户

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

#================================ delete_entry(date, username) ================================
def delete_entry(date, username):
    entries = load_entries()
    entries = [e for e in entries if not (e["date"] == date and e.get("username") == username)]
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