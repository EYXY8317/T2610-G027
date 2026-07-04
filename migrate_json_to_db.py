"""
One-time script: seed the Postgres database with the data currently sitting
in the repo's JSON files, so switching over to db_store doesn't start empty.

Run once, with DATABASE_URL pointed at the target Postgres instance:
    DATABASE_URL=postgres://... python migrate_json_to_db.py
"""
import json
import os
import sys

if not os.environ.get("DATABASE_URL"):
    sys.exit("DATABASE_URL is not set - point it at the target Postgres instance first.")

import db_store  # imported after checking DATABASE_URL so it picks Postgres mode

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

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
        print(f"skip (not found): {path}")
        continue
    with open(path, "r") as f:
        data = json.load(f)
    db_store.save_data(path, data)
    print(f"seeded {len(data)} record(s) from {path}")

print("Done.")
