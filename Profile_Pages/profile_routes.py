from flask import app, render_template, session, request, redirect
from password_system.password_hashing import hash_password
from datetime import datetime
import os
from db_store import load_data, save_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
f_users = os.path.join(BASE_DIR, "users.json")

# Files that hold per-user records keyed by "username", cascade-deleted
# alongside the account entry in users.json.
USER_DATA_FILES = [
    os.path.join(BASE_DIR, "journal.json"),
    os.path.join(BASE_DIR, "goals.json"),
    os.path.join(BASE_DIR, "Calendar_Pages", "tasks.json"),
    os.path.join(BASE_DIR, "Finance", "accounts.json"),
    os.path.join(BASE_DIR, "Finance", "budget.json"),
    os.path.join(BASE_DIR, "Finance", "expenses.json"),
]


def register_profile_routes(app):

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

                        filename = profile_picture.filename

                        save_path = os.path.join(
                            "Profile_Pages",
                            "static",
                            "profile_pictures",
                            filename
                        )

                        profile_picture.save(save_path)

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
    
    # =========================
    # CHANGE THEME
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