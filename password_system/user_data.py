import json

def save_user(user_data):
    # 警告：这里用的是 "w"（覆写）模式，并且直接把 user_data 整个
    # 存进去 —— 如果真的对着仓库根目录下的 users.json 运行，
    # 会把原本一整个用户列表覆盖成只剩这一个用户！这个函数只被
    # password_security.py（同样是独立的练习脚本）调用，
    # 跟网页正式使用的 auth_routes.py + db_store.py 是两套完全独立的逻辑，
    # 并不会互相影响。
    # Warning: this opens the file in "w" (overwrite) mode and dumps
    # user_data directly — if run against the repo's real users.json, it
    # would replace the entire user list with just this one user! This
    # function is only called by password_security.py (itself a separate
    # practice script) — it's a completely independent code path from the
    # real web app's auth_routes.py + db_store.py, so it doesn't affect
    # the live app.

    with open("users.json", "w") as file:
        # json.dump(...)：把 Python 的数据（字典/列表）保存成 JSON 文件；
        # indent=4：让保存的 JSON 文件用 4 个空格缩进排版，方便人工阅读。
        # json.dump(...): saves Python data (a dict/list) out as a JSON
        # file; indent=4: pretty-prints the saved JSON with 4-space
        # indentation so it's easy for a human to read.

        json.dump(user_data, file, indent=4)

user = {
    "username": "ABC",
    "password": "Abc12345"
}
save_user(user)
