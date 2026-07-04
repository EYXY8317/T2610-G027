"""
Shared data store used by every part of the app instead of raw JSON file I/O.

Local dev (no DATABASE_URL set): reads/writes the JSON file at `path`, same
as before - no Postgres needed to run the app on your machine.

Production (DATABASE_URL set, e.g. on Render): stores each dataset as a JSONB
blob in a single Postgres table, keyed by the file's basename (e.g.
"expenses.json" -> "expenses"). This survives restarts/redeploys, unlike the
web service's local disk.
"""
import json
import os

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    import psycopg2

    def _get_conn():
        return psycopg2.connect(DATABASE_URL)

    def _ensure_table(cur):
        cur.execute(
            "CREATE TABLE IF NOT EXISTS json_store ("
            "key TEXT PRIMARY KEY, data JSONB NOT NULL)"
        )

    def _key_for(path):
        return os.path.splitext(os.path.basename(path))[0]

    def load_data(path, default):
        key = _key_for(path)
        with _get_conn() as conn, conn.cursor() as cur:
            _ensure_table(cur)
            cur.execute("SELECT data FROM json_store WHERE key = %s", (key,))
            row = cur.fetchone()
            conn.commit()
            return row[0] if row else default

    def save_data(path, data):
        key = _key_for(path)
        with _get_conn() as conn, conn.cursor() as cur:
            _ensure_table(cur)
            cur.execute(
                "INSERT INTO json_store (key, data) VALUES (%s, %s) "
                "ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data",
                (key, json.dumps(data)),
            )
            conn.commit()

else:
    def load_data(path, default):
        if not os.path.exists(path):
            return default
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return default

    def save_data(path, data):
        with open(path, "w") as f:
            json.dump(data, f, indent=4)
