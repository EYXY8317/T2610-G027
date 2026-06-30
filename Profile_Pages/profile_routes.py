from flask import app, render_template, session, request, redirect
from password_system.password_hashing import hash_password
import json
import os

def register_profile_routes(app):

    @app.route("/profile")
    def profile():

        with open("users.json", "r") as f:
            users = json.load(f)

        current_user = None

        for user in users:
            if user["username"] == session["user"]:
                current_user = user
                break

        return render_template(
            "profile.html",
            user=current_user
        )

    @app.route("/verify_profile", methods=["GET", "POST"])
    def verify_profile():

        if request.method == "POST":

            password = hash_password(request.form.get("password", ""))

            with open("users.json", "r") as f:
                users = json.load(f)

            for user in users:

                if (
                    user["username"] == session["user"]
                    and user["password"] == password
                ):

                    return redirect("/edit_profile")

        error = request.method == "POST"
        return render_template("verify_profile.html", error=error)

    @app.route("/upload_profile_picture", methods=["POST"])
    def upload_profile_picture():

        profile_picture = request.files["profile_picture"]

        with open("users.json", "r") as f:
            users = json.load(f)

        for user in users:

            if user["username"] == session["user"]:

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

                break

        with open("users.json", "w") as f:
            json.dump(users, f, indent=4)

        return redirect("/profile")

    @app.route("/edit_profile", methods=["GET", "POST"])
    def edit_profile():

        with open("users.json", "r") as f:
            users = json.load(f)

        if request.method == "POST":

            new_username = request.form["username"]
            new_email = request.form["email"]
            profile_picture = request.files["profile_picture"]

            for user in users:

                if user["username"] == session["user"]:

                    user["username"] = new_username
                    user["email"] = new_email

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
                    break

            with open("users.json", "w") as f:
                json.dump(users, f, indent=4)

        current_user = None

        for user in users:
            if user["username"] == session["user"]:
                current_user = user
                break

        return render_template(
            "edit_profile.html",
            user=current_user
        )
    
    @app.route("/upload_wallpaper", methods=["POST"])
    def upload_wallpaper():

        wallpaper = request.files["wallpaper"]

        with open("users.json", "r") as f:
            users = json.load(f)

        for user in users:

            if user["username"] == session["user"]:

                if wallpaper.filename != "":

                    filename = wallpaper.filename

                    folder = os.path.join(
                        "Profile_Pages",
                        "static",
                        "wallpapers"
                    )

                    os.makedirs(folder, exist_ok=True)

                    save_path = os.path.join(
                        folder,
                        filename
                    )

                    wallpaper.save(save_path)

                    user["wallpaper"] = filename

                break

        with open("users.json", "w") as f:
            json.dump(users, f, indent=4)

        return redirect("/profile")
    
    # =========================
    # CHANGE THEME
    # =========================

    @app.route("/change_theme", methods=["POST"])
    def change_theme():

        if "user" not in session:

            return redirect("/login")

        current_user = session["user"]

        selected_theme = request.form.get("theme")

        if not selected_theme:

            return redirect("/profile")

        with open("users.json", "r") as file:

            users = json.load(file)

        for user in users:

            if user["username"] == current_user:

                user["theme"] = selected_theme

                break

        with open("users.json", "w") as file:

            json.dump(users, file, indent=4)

        return redirect("/profile")
    
    @app.route("/remove_wallpaper",methods=["POST"])
    def remove_wallpaper():

        with open("users.json", "r") as f:
            users = json.load(f)

        for user in users:

            if user["username"] == session["user"]:

                user["wallpaper"] = None

                break

        with open("users.json", "w") as f:
            json.dump(users, f, indent=4)

        return redirect("/profile")