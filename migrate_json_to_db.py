"""
One-time script: seed the Postgres database with the data currently sitting
in the repo's JSON files, so switching over to db_store doesn't start empty.

Run once, with DATABASE_URL pointed at the target Postgres instance:
    DATABASE_URL=postgres://... python migrate_json_to_db.py

================================================================
一次性脚本 / 把仓库里现有的 JSON 文件数据导入 Postgres 数据库
================================================================
这样切换到用 db_store（数据库存储）之后，数据库里不会是空的。

运行一次即可，运行前先把 DATABASE_URL 指向目标 Postgres 数据库：
    DATABASE_URL=postgres://... python migrate_json_to_db.py
"""
import json
import os
import sys

# 必须先检查 DATABASE_URL 有没有设置，避免脚本悄悄地在本地
# 什么数据库都没连上的情况下"假装"迁移成功。
# Must check DATABASE_URL is set before doing anything else, so the script
# doesn't silently pretend to migrate while not actually connected to any
# database.

if not os.environ.get("DATABASE_URL"):
    sys.exit("DATABASE_URL is not set - point it at the target Postgres instance first.")

import db_store  # imported after checking DATABASE_URL so it picks Postgres mode

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 这些就是整个项目里用到的所有 JSON 数据文件，
# 迁移的时候要把它们全部搬到数据库里。
# These are every JSON data file used across the whole project — all of
# them need to be carried over into the database.

FILES = [
    os.path.join(BASE_DIR, "users.json"),
    os.path.join(BASE_DIR, "journal.json"),
    os.path.join(BASE_DIR, "goals.json"),
    os.path.join(BASE_DIR, "Calendar_Pages", "tasks.json"),
    os.path.join(BASE_DIR, "Finance", "accounts.json"),
    os.path.join(BASE_DIR, "Finance", "budget.json"),
    os.path.join(BASE_DIR, "Finance", "expenses.json"),
]

for path in FILES:
    if not os.path.exists(path):
        # 这份 JSON 文件在这个环境里不存在（比如从来没人用过这个功能），
        # 跳过它而不是报错中断整个迁移过程。
        # This JSON file doesn't exist in this environment (e.g. that
        # feature was never used here) — skip it instead of raising an
        # error and aborting the whole migration.
        print(f"skip (not found): {path}")
        continue
    with open(path, "r") as f:
        data = json.load(f)
    # db_store.save_data 内部已经写好了"存到 Postgres 还是存成本地文件"
    # 的判断逻辑，这里不用关心具体存到哪，只管调用就好。
    # db_store.save_data already contains the logic for deciding whether to
    # write to Postgres or a local file — this script doesn't need to know
    # which one, it just calls the function.
    db_store.save_data(path, data)
    print(f"seeded {len(data)} record(s) from {path}")

print("Done.")
