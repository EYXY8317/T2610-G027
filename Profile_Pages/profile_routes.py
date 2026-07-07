from flask import app, render_template, session, request, redirect, Response
from password_system.password_hashing import hash_password
from datetime import datetime
import os
import time
import mimetypes
from werkzeug.utils import secure_filename
from db_store import load_data, save_data, save_file, load_file

# 注意：这里从 flask 包里导入的 "app" 其实是 flask 内部的一个模块
# （flask/app.py，里面定义了 Flask 这个类本身），并不是这个项目实际
# 运行的那个 Flask 应用实例——而且这个导入进来的 app 从头到尾都没被
# 用到（下面 register_profile_routes(app) 的参数 app 是另一个独立的
# 局部变量，跟这里导入的同名但完全无关，函数内部用的是参数那个）。
# 保留着不会导致任何错误，纯粹是容易让人误以为这里导入的就是"那个"
# app 实例，属于可以清理掉的写法。
# Note: the "app" imported from the flask package here is actually one of
# Flask's own internal modules (flask/app.py, where the Flask class itself
# is defined) — it is NOT this project's actual running Flask application
# instance, and this imported app is never used anywhere below (the `app`
# parameter of register_profile_routes(app) further down is a separate,
# unrelated local variable that just happens to share the name — the
# function body uses that parameter, not this import). It's harmless as
# written, but purely a confusing bit of style worth cleaning up.

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
f_users = os.path.join(BASE_DIR, "users.json")

PROFILE_PICTURES_DIR = os.path.join(BASE_DIR, "Profile_Pages", "static", "profile_pictures")

# Files that hold per-user records keyed by "username", cascade-deleted
# alongside the account entry in users.json.
# 这些文件里都存着按 username 关联的用户数据，账号被删除时
# （users.json 里那条记录被删掉的同时）也要把这些文件里对应的记录
# 一起级联删除，不然会留下一堆"孤儿数据"，永远关联不到任何账号。
USER_DATA_FILES = [
    os.path.join(BASE_DIR, "journal.json"),
    os.path.join(BASE_DIR, "goals.json"),
    os.path.join(BASE_DIR, "Calendar_Pages", "tasks.json"),
    os.path.join(BASE_DIR, "Finance", "accounts.json"),
    os.path.join(BASE_DIR, "Finance", "budget.json"),
    os.path.join(BASE_DIR, "Finance", "expenses.json"),
]


def register_profile_routes(app):
    # 这个函数不是直接用 @app.route 装饰器（因为这个文件里一开始并没有
    # 现成的 app 实例），而是把真正的 Flask app 实例当作参数传进来，
    # 在函数内部动态注册每一个路由——app.py 里调用
    # register_profile_routes(app) 的时候才会真正把这些路由挂上去。
    # This function doesn't use the @app.route decorator directly (since
    # this file has no ready-made app instance of its own) — instead, the
    # real Flask app instance is passed in as a parameter, and each route
    # is registered dynamically inside this function. These routes only
    # actually get attached when app.py calls register_profile_routes(app).

    @app.route("/profile")
    def profile():

        logged_in_user = session.get("user")
        current_user = None

        if logged_in_user:
            users = load_data(f_users, [])

            for user in users:
                if user["username"] == logged_in_user:
                    current_user = user
                    break

        last_login_display = "First login"

        if current_user and current_user.get("last_login"):
            last_login_display = datetime.fromisoformat(
                current_user["last_login"]
            ).strftime("%b %d, %Y at %I:%M %p")

        return render_template(
            "profile.html",
            user=current_user,
            last_login=last_login_display,
            logged_in=bool(logged_in_user)
        )

    @app.route("/verify_profile", methods=["GET", "POST"])
    def verify_profile():
        # 修改个人资料前要求再次确认密码——这是一道额外的安全检查，
        # 防止有人在用户暂时离开电脑、忘记登出的情况下偷偷改掉资料。
        # Requires re-entering the password before editing the profile —
        # an extra security check to prevent someone from tampering with
        # the profile if the user steps away without logging out.

        if "user" not in session:
            return redirect("/")

        if request.method == "POST":

            password = hash_password(request.form.get("password", ""))

            users = load_data(f_users, [])

            for user in users:

                if (
                    user["username"] == session["user"]
                    and user["password"] == password
                ):

                    return redirect("/edit_profile")

        error = request.method == "POST"
        return render_template("verify_profile.html", error=error)

    @app.route("/delete_account", methods=["GET", "POST"])
    def delete_account():

        if "user" not in session:
            return redirect("/")

        if request.method == "POST":

            password = hash_password(request.form.get("password", ""))

            users = load_data(f_users, [])

            username = session["user"]
            matched = any(
                u["username"] == username and u["password"] == password
                for u in users
            )

            if not matched:
                return render_template("confirm_delete_account.html", error=True)

            users = [u for u in users if u["username"] != username]

            save_data(f_users, users)

            # 删完账号本身之后，再逐一清理 USER_DATA_FILES 列表里
            # 每一份数据文件中属于这个用户的记录——这就是上面注释提到的
            # "级联删除"，确保这个用户名底下不会留下任何残留数据。
            # After deleting the account itself, also clean out this
            # user's records from every file listed in USER_DATA_FILES —
            # this is the "cascade delete" mentioned above, ensuring no
            # data is left behind under this username.

            for data_file in USER_DATA_FILES:
                records = load_data(data_file, [])
                records = [r for r in records if r.get("username") != username]
                save_data(data_file, records)

            session.pop("user", None)

            return redirect("/")

        return render_template("confirm_delete_account.html", error=False)

    @app.route("/edit_profile", methods=["GET", "POST"])
    def edit_profile():

        if "user" not in session:
            return redirect("/")

        users = load_data(f_users, [])

        if request.method == "POST":

            new_username = request.form["username"]
            profile_picture = request.files["profile_picture"]

            for user in users:

                if user["username"] == session["user"]:

                    user["username"] = new_username

                    if profile_picture.filename != "":

                        filename = secure_filename(profile_picture.filename)
                        name, ext = os.path.splitext(filename)
                        filename = f"{name}_{int(time.time())}{ext}"

                        # save_file goes through Postgres in production (via
                        # db_store.py) so profile pictures survive
                        # redeploys/restarts, instead of the web service's
                        # ephemeral local disk.
                        save_file(
                            os.path.join(PROFILE_PICTURES_DIR, filename),
                            profile_picture.read()
                        )

                        user["profile_picture"] = filename

                    session["user"] = new_username
                    break

            save_data(f_users, users)

            return redirect("/profile")

        current_user = None

        for user in users:
            if user["username"] == session["user"]:
                current_user = user
                break

        return render_template(
            "edit_profile.html",
            user=current_user
        )

    @app.route("/profile_static/profile_pictures/<filename>")
    def profile_picture_image(filename):
        data = load_file(os.path.join(PROFILE_PICTURES_DIR, secure_filename(filename)))
        if data is None:
            return "", 404
        mimetype = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        return Response(data, mimetype=mimetype)

    # =========================
    # CHANGE THEME
    # 切换主题
    # =========================

    @app.route("/change_theme", methods=["POST"])
    def change_theme():

        if "user" not in session:

            return redirect("/")

        current_user = session["user"]

        selected_theme = request.form.get("theme")

        if not selected_theme:

            return redirect("/profile")

        users = load_data(f_users, [])

        for user in users:

            if user["username"] == current_user:

                user["theme"] = selected_theme

                break

        save_data(f_users, users)

        return redirect("/profile")
