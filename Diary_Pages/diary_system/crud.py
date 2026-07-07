import os
import json
from db_store import load_data, save_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILE = os.path.join(BASE_DIR, "journal.json")

ITEM_SEP = "||ITEM||"

# ================================ deep_unwrap_chunk(raw) ================================
def deep_unwrap_chunk(raw):
    # Diary content is a "||ITEM||"-joined list of chunks, each meant to be
    # JSON-stringified *exactly once*. If a chunk was ever re-stringified
    # (e.g. a broken save path wrapped an already-serialized chunk again),
    # a single json.loads leaves a *string* instead of a dict rather than
    # the real element. This keeps unwrapping while the result is still a
    # string, so the real element dict is recovered no matter how many
    # extra layers of escaping piled up. Returns (obj_or_None, layers) —
    # layers == 1 means the chunk was already in the correct, single-
    # encoded shape; anything else means it needed (or still needs) repair.
    # 日记内容是用 "||ITEM||" 连接起来的一串区块，每个区块本该只被
    # JSON.stringify 一次。如果某个区块被重复序列化过（比如某条坏掉的
    # 保存路径把已经序列化过的区块又包了一层），单次 json.loads 得到的会是
    # 一个字符串而不是本来该有的字典。这个函数会持续解包，只要结果还是
    # 字符串就继续解，不管叠了多少层转义都能把真正的元素字典还原出来。
    # 返回 (还原出的对象或 None, 解包层数) —— layers == 1 代表这个区块
    # 本来就是正确的单层编码；其他情况都代表它需要（或仍然需要）修复。

    value = raw
    layers = 0
    while isinstance(value, str) and layers < 20:
        try:
            value = json.loads(value)
        except (ValueError, TypeError):
            return None, layers
        layers += 1
    return (value if isinstance(value, dict) else None), layers

# ================================ normalize_content(content) ================================
def normalize_content(content):
    # Rebuilds a "||ITEM||"-joined content string with every chunk
    # unwrapped down to its real element dict and re-serialized exactly
    # once, no matter how many layers of double-encoding it originally had.
    # Returns (clean_content, was_corrupted) — was_corrupted is True if any
    # chunk needed anything other than exactly one layer of decoding, so
    # the caller knows whether this record needs to be re-saved to heal it.
    # 把 "||ITEM||" 连接的内容字符串重新组装一遍：每个区块都先解包还原成
    # 真正的元素字典，再重新序列化恰好一次——不管它原本被多重编码了多少层。
    # 返回 (清理后的内容, 是否发现了损坏)。was_corrupted 为 True 代表至少有
    # 一个区块需要的解包层数不是恰好一层，调用方就知道这条记录需要重新
    # 保存一次来自愈。

    if not content:
        return content, False

    was_corrupted = False
    cleaned_chunks = []
    for chunk in content.split(ITEM_SEP):
        stripped = chunk.strip()
        if not stripped:
            continue
        obj, layers = deep_unwrap_chunk(stripped)
        if obj is not None:
            if layers != 1:
                was_corrupted = True
            cleaned_chunks.append(json.dumps(obj, separators=(",", ":")))
        else:
            # Unrecoverable at any unwrap depth — keep the original chunk
            # untouched rather than discarding whatever data it holds.
            cleaned_chunks.append(stripped)

    return ITEM_SEP.join(cleaned_chunks), was_corrupted

# ================================ load_entries() ================================
def load_entries():
    # Function to load all journal entries from file (journal.json).
    # 从文件读取所有日记数据（文件 = journal.json）。
    #
    # Every entry's content is normalized on the way out, so any legacy or
    # accidentally re-serialized (multi-layer-escaped) chunk is repaired in
    # memory before anything else in the app sees it. If repairing changed
    # anything, the corrected data is written straight back so the record
    # heals itself permanently instead of needing to be fixed on every load.
    # 每一条记录的 content 在读出来之前都会先做一次规范化处理，这样任何
    # 旧数据或者被意外多层序列化过的区块，在应用里其他任何地方看到它之前
    # 就已经被修复好了。如果修复过程真的改动了什么，就立刻把修好的数据
    # 写回去，让这条记录彻底自愈，而不是每次读取都要重新修一次。

    entries = load_data(FILE, [])
    any_changed = False
    for entry in entries:
        clean, changed = normalize_content(entry.get("content", ""))
        if changed:
            entry["content"] = clean
            any_changed = True
    if any_changed:
        save_entries(entries)
    return entries

# ================================ save_entries(entries) ================================
def save_entries(entries):
    # Function to save all entries into file.
    # 这个函数把所有日记数据存进文件。

    save_data(FILE, entries)

# ================================ add_entry(entry) ================================
def add_entry(entry):
    # Function to add or update an entry (日记).
    # Entry is a dictionary that contains the data for a single journal entry.

    # Safeguard on save: normalize the incoming content the same way
    # load_entries() does, so a chunk that's already a serialized JSON
    # string never gets wrapped in another layer here, no matter which
    # save path (autosave, a future editor, etc.) produced this entry.
    # 保存时的安全防线：用跟 load_entries() 一样的方式规范化传进来的
    # content —— 这样不管是哪个保存路径（自动保存、以后新增的编辑器等）
    # 生成的这条记录，只要某个区块已经是序列化过的 JSON 字符串，
    # 这里就绝不会再给它多包一层。

    entry["content"], _ = normalize_content(entry.get("content", ""))

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
