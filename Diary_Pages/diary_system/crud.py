import os
from db_store import load_data, save_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILE = os.path.join(BASE_DIR, "journal.json")

# ================================ load_entries() ================================
def load_entries():
    # Function to load all journal entries from file (journal.json).
    # 从文件读取所有日记数据（文件 = journal.json）。

    return load_data(FILE, [])

# ================================ save_entries(entries) ================================
def save_entries(entries):
    # Function to save all entries into file.
    # 这个函数把所有日记数据存进文件。

    save_data(FILE, entries)

# ================================ add_entry(entry) ================================
def add_entry(entry):
    # Function to add or update an entry (日记).
    # Entry is a dictionary that contains the data for a single journal entry.

    entries = load_entries()

    # Flag variable to check if date already exists.
    # 标记变量：用来判断有没有找到同一个日期。
    found = False

    # Loop through the list using an index.
    # 用 index（编号）去遍历整个 list。
    #
    # len(entries) = number of items inside the list
    # 例如：entries = ["A", "B", "C"] -> len(entries) = 3
    #
    # range(len(entries))
    # range(3) -> gives numbers: 0, 1, 2
    # Python 的 index 从 0 开始 (Python index starts from 0)
    #
    # "for i in ..." loops through each number one by one:
    # i=0, i=1, i=2 ...

    for i in range(len(entries)):

        # Check if the same date AND the same user already exists.
        # 检查有没有相同的日期而且是同一个用户。
        #
        # entries[i]    = get one item from the list using the index
        # entries[i]["date"] = get the value of "date" from that dictionary
        # ==            = check if both dates are the same

        if (entries[i]["date"] == entry["date"]
                and entries[i].get("username") == entry.get("username")):

            # Same date found -> replace the old entry with the new one
            # (entries = all old data, entry = the new input).
            # 如果日期一样 -> 用新的 entry 覆盖旧的
            # （entries = 全部旧数据，entry = 新传进来的数据）。

            entries[i] = entry

            # Mark as found.
            # 标记为"已经找到"。
            found = True

            break

    # No matching date was found above -> this is a brand new entry.
    # 上面没找到相同日期 -> 说明这是一条全新的日记。

    if not found:

        entries.append(entry)

    # Save the updated list back to file.
    # 把更新后的列表存回文件。

    save_entries(entries)

# ================================ delete_entry(date, username) ================================
def delete_entry(date, username):
    entries = load_entries()

    # List comprehension: builds a new filtered list in one line.
    # List comprehension（列表推导式）：用一行代码生成新的 list。
    #
    # "e for e in entries" 表示从 entries 里逐个取出每一条记录 e；
    # "if not (...)" 表示只保留"日期或用户名对不上"的那些记录——
    # 也就是说，日期和用户名都匹配的那一条会被排除在新列表之外，
    # 达到"删除"的效果（原始列表本身没有被直接修改，而是生成了
    # 一份不包含目标记录的新列表，再整个存回文件）。
    #
    # "e for e in entries" pulls each record e out of entries one at a
    # time; "if not (...)" keeps only the records where the date OR the
    # username doesn't match — meaning the one record where both match
    # gets left out of the new list, which is what achieves "deletion"
    # (the original list isn't mutated directly; a new list without the
    # target record is built and saved back over the file).
    #
    # Example:
    #   entries = [
    #       {"date": "2026-04-30", "content": "A"},
    #       {"date": "2026-05-01", "content": "B"},
    #       {"date": "2026-05-02", "content": "C"},
    #   ]
    #   date to delete = "2026-05-01"
    #
    #   e = {"date": "2026-04-30", ...} -> "2026-04-30" != "2026-05-01" -> kept
    #   e = {"date": "2026-05-01", ...} -> matches -> removed (not kept)
    #   e = {"date": "2026-05-02", ...} -> "2026-05-02" != "2026-05-01" -> kept

    entries = [e for e in entries if not (e["date"] == date and e.get("username") == username)]

    save_entries(entries)
