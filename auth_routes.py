from flask import Blueprint, render_template, request, redirect, url_for, session
from password_system.password_hashing import hash_password
from password_system.password_validation import is_valid_password
from datetime import datetime
import json, os

auth_bp = Blueprint('auth', __name__, url_prefix='')

BASE_DIR = os.path.dirname(__file__)
f_users  = os.path.join(BASE_DIR, "users.json")


# ================= HELPERS =================
def load_data(file, default):
    if not os.path.exists(file):
        return default
    try:
        with open(file, "r") as f:
            return json.load(f)
    except Exception:
        return default


def save_data(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


# ================= LOGIN =================
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        users    = load_data(f_users, [])
        username = request.form["username"]
        password = hash_password(request.form["password"])
        for u in users:
            if u["username"] == username and u.get("password") == password:
                u["last_login"] = datetime.now().isoformat()
                save_data(f_users, users)
                session["user"] = username
                return redirect(url_for("dashboard"))
        return render_template("login.html", error="Invalid username or password")
    return render_template("login.html")


# ================= REGISTER =================
@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        users    = load_data(f_users, [])
        username = request.form["username"]
        password = request.form["password"]
        question = request.form["question"]
        answer   = request.form["answer"]

        if any(u["username"] == username for u in users):
            return render_template("login.html", reg_error="Username already taken",
                                   show_register=True)
        if not is_valid_password(password):
            return render_template("login.html",
                                   reg_error="Weak password (8+ chars, uppercase, lowercase, number)",
                                   show_register=True)

        users.append({
            "username": username,
            "password": hash_password(password),
            "security_question": question,
            "security_answer":   hash_password(answer),
            "theme": "cozy",
        })
        save_data(f_users, users)
        return redirect(url_for("auth.login", success="Account created successfully"))

    return redirect(url_for("auth.login"))


# ================= LOGOUT =================
@auth_bp.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("dashboard"))


# ================= FORGOT USERNAME =================
@auth_bp.route("/forgot_username", methods=["GET", "POST"])
def forgot_username():
    if request.method == "POST":
        question = request.form["question"]
        answer   = request.form["answer"]
        users    = load_data(f_users, [])
        hashed_answer = hash_password(answer)
        for u in users:
            if (u.get("security_question") == question and
                    u.get("security_answer") == hashed_answer):
                return redirect(url_for("auth.login", panel="forgot_username",
                                        result=u["username"]))
        return redirect(url_for("auth.login", panel="forgot_username",
                                error="No matching account found"))
    return redirect(url_for("auth.login", panel="forgot_username"))


# ================= FORGOT PASSWORD =================
@auth_bp.route("/forgot", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        username = request.form.get("username")
        question = request.form.get("question")
        answer   = request.form.get("answer")
        users    = load_data(f_users, [])
        for u in users:
            if u["username"] == username:
                if (u.get("security_question") == question and
                        u.get("security_answer") == hash_password(answer)):
                    session["reset_user"] = username
                    return redirect(url_for("auth.reset_password"))
                return redirect(url_for("auth.login", panel="forgot",
                                        error="Wrong question or answer"))
        return redirect(url_for("auth.login", panel="forgot", error="User not found"))
    return redirect(url_for("auth.login", panel="forgot"))


# ================= RESET PASSWORD =================
@auth_bp.route("/reset", methods=["GET", "POST"])
def reset_password():
    if "reset_user" not in session:
        return redirect(url_for("auth.forgot_password"))
    username = session["reset_user"]
    if request.method == "POST":
        new_password = request.form.get("password")
        users = load_data(f_users, [])
        for u in users:
            if u["username"] == username:
                u["password"] = hash_password(new_password)
        save_data(f_users, users)
        session.pop("reset_user", None)
        return redirect(url_for("auth.login", success="Password reset successful"))
    return render_template("reset.html", username=username)
