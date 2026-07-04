"""
Shared data store used by every part of the app instead of raw JSON file I/O.

Local dev (no DATABASE_URL set): reads/writes the JSON file at `path`, same
as before - no Postgres needed to run the app on your machine.

Production (DATABASE_URL set, e.g. on Render): stores each dataset as a JSONB
blob in a single Postgres table, keyed by the file's basename (e.g.
"expenses.json" -> "expenses"). This survives restarts/redeploys, unlike the
web service's local disk.

================================================================
共享数据存储模块 / 供整个应用使用，用来代替直接读写 JSON 文件
================================================================
本地开发（未设置 DATABASE_URL 环境变量）：
    直接读写 `path` 指向的 JSON 文件，跟以前一样，本机运行不需要 Postgres 数据库。

生产环境（已设置 DATABASE_URL，例如部署在 Render 上）：
    把每一份数据当作一个 JSONB（JSON 二进制）对象，存进 Postgres 的
    同一张表里，用文件名（去掉 .json 后缀）当作这一行的 key，
    例如 "expenses.json" -> "expenses"。
    这样重启或重新部署网页服务时，数据不会像存在本地磁盘那样丢失。
"""
import json
import os

# 从系统环境变量读取数据库连接地址；本地开发时通常没有设置这个变量，
# 值会是 None，从而进入下面 else 分支（用普通 JSON 文件存储）。
# Read the Postgres connection string from the environment. Locally this is
# usually unset (None), so the code falls into the `else` branch below and
# just uses plain JSON files instead.

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # 只有在真的需要连接 Postgres 时才导入 psycopg2 —— 这样本地开发环境
    # 不装这个库也不会报错（因为这个 if 分支根本不会执行到这里）。
    # Only import psycopg2 (the Postgres driver) when we actually need it —
    # this way local dev machines don't need it installed at all, since this
    # branch never runs for them.

    import psycopg2

    def _get_conn():
        # 每次调用都开一个新的数据库连接（用 "with" 语法自动处理关闭/事务）。
        # Opens a fresh database connection each call; used with Python's
        # `with` statement below so the connection auto-commits/closes.

        return psycopg2.connect(DATABASE_URL)

    def _ensure_table(cur):
        # SQL: 如果 "json_store" 这张表还不存在，就创建它。
        # 表结构：key（文本，主键，唯一标识每份数据）+ data（JSONB 类型，
        # 也就是数据库原生支持、可以直接查询的 JSON 格式）。
        # "IF NOT EXISTS" 保证这条语句可以每次都安全地重复执行，
        # 不会因为表已经存在而报错。
        # SQL: create the "json_store" table if it doesn't already exist.
        # Columns: key (text, primary key — uniquely identifies each dataset)
        # and data (JSONB — Postgres's native, queryable JSON column type).
        # "IF NOT EXISTS" makes this safe to run on every request without
        # erroring out once the table has already been created.

        cur.execute(
            "CREATE TABLE IF NOT EXISTS json_store ("
            "key TEXT PRIMARY KEY, data JSONB NOT NULL)"
        )

    def _key_for(path):
        # 把文件路径转换成表里用的 key：只取文件名，去掉扩展名。
        # 例如 "data/expenses.json" -> "expenses"。
        # Turns a file path into the table's lookup key: just the filename
        # with its extension stripped, e.g. "data/expenses.json" -> "expenses".

        return os.path.splitext(os.path.basename(path))[0]

    def load_data(path, default):
        key = _key_for(path)

        # "with ... as conn, ... as cur" 会在代码块结束时自动关闭连接和游标，
        # 就算中途出错也会关闭 —— 不需要手动写 conn.close()。
        # The "with" statement auto-closes the connection/cursor when the
        # block ends, even if an error happens partway through — no manual
        # conn.close() needed.

        with _get_conn() as conn, conn.cursor() as cur:
            _ensure_table(cur)

            # SQL: 按 key 查这一行的 data 列。
            # "%s" 是参数占位符，真正的值（key）由第二个参数安全地传入 ——
            # 这样可以防止 SQL 注入攻击（永远不要用字符串拼接来插入用户输入）。
            # SQL: look up the data column for this key.
            # "%s" is a parameter placeholder — the actual value (key) is
            # passed in safely as the second argument, which prevents SQL
            # injection (never build queries by string-concatenating input).

            cur.execute("SELECT data FROM json_store WHERE key = %s", (key,))

            row = cur.fetchone()  # 没找到就返回 None，而不是报错
                                   # returns None if no row matched, not an error
            conn.commit()

            # 如果查到了行就返回它的 data 字段，否则返回调用方传入的默认值。
            # Return the found row's data, or fall back to the caller's default
            # if nothing was stored under this key yet.

            return row[0] if row else default

    def save_data(path, data):
        key = _key_for(path)

        with _get_conn() as conn, conn.cursor() as cur:
            _ensure_table(cur)

            # SQL: "upsert" —— 插入一行新数据；如果这个 key 已经存在
            # （对应主键冲突），就改成更新已有那一行的 data 字段，
            # 而不是报错或插入重复的行。
            # "EXCLUDED.data" 表示 "本来想插入的那一行的 data 值"。
            # SQL: an "upsert" — insert a new row; but if this key already
            # exists (a primary-key conflict), update that existing row's
            # data column instead of erroring out or creating a duplicate.
            # "EXCLUDED.data" means "the data value we tried to insert".

            cur.execute(
                "INSERT INTO json_store (key, data) VALUES (%s, %s) "
                "ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data",
                (key, json.dumps(data)),
            )
            conn.commit()

else:
    # ===== 本地文件存储版本（没有数据库时使用） =====
    # ===== Local file-storage version (used when there's no database) =====

    def load_data(path, default):
        if not os.path.exists(path):
            # 文件还不存在（比如第一次运行）—— 直接返回默认值，而不是报错。
            # File doesn't exist yet (e.g. first run ever) — just return the
            # default instead of raising an error.

            return default
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            # 文件存在但内容损坏/不是合法 JSON —— 同样安全地退回默认值，
            # 而不是让整个网页崩溃。
            # File exists but its contents are corrupted/not valid JSON —
            # fail safely back to the default instead of crashing the page.

            return default

    def save_data(path, data):
        with open(path, "w") as f:
            # indent=4 只是让保存的 JSON 文件排版好看、方便人工查看，
            # 对程序读取数据没有影响。
            # indent=4 just pretty-prints the saved JSON so it's easy for a
            # human to read the file directly — it has no effect on how the
            # data is read back by the program.

            json.dump(data, f, indent=4)
