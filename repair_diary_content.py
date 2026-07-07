"""
One-time repair script: scans every diary entry (every user, not just one
account) for content that was JSON-stringified more than once — the bug
that made text/image chunks render as raw escaped JSON on the canvas — and
rewrites each affected record with cleanly single-encoded content.

Works against whichever store db_store is configured for: set DATABASE_URL
to point this at the production Postgres database, or leave it unset to
repair the local journal.json used in dev.

    python repair_diary_content.py            # repairs local journal.json
    DATABASE_URL=postgres://... python repair_diary_content.py   # repairs prod

================================================================
一次性修复脚本 / 扫描所有用户的日记记录
================================================================
扫描每一条日记记录（所有用户的，不只是某一个账号），找出被反复
JSON.stringify 多次的 content —— 也就是导致文字/图片区块在画布上显示成
未解析的转义 JSON 字符串的那个 bug —— 并把每一条受影响的记录重写成
干净的单层编码格式。

运行时用的是 db_store 当前配置指向的存储：设置 DATABASE_URL 就是修复生产
环境的 Postgres 数据库；不设置就是修复本地开发用的 journal.json。
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from Diary_Pages.diary_system.crud import FILE, normalize_content  # noqa: E402
import db_store  # noqa: E402

entries = db_store.load_data(FILE, [])

repaired = []
for entry in entries:
    clean, was_corrupted = normalize_content(entry.get("content", ""))
    if was_corrupted:
        entry["content"] = clean
        repaired.append(entry)

if repaired:
    db_store.save_data(FILE, entries)

affected_users = sorted({e.get("username", "") for e in repaired})

print(f"Scanned {len(entries)} diary entries.")
print(f"Repaired {len(repaired)} corrupted entr{'y' if len(repaired) == 1 else 'ies'}.")
if affected_users:
    print(f"Affected user(s) ({len(affected_users)}): {', '.join(affected_users)}")
    print()
    print("Repaired records:")
    for e in repaired:
        print(f"  - user={e.get('username')!r} date={e.get('date')!r}")
else:
    print("No corrupted records found - nothing to repair.")
