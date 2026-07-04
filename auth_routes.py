from flask import Blueprint, render_template, request, redirect, url_for, session
from password_system.password_hashing import hash_password
from password_system.password_validation import is_valid_password
from datetime import datetime
import os
from db_store import load_data, save_data

auth_bp = Blueprint('auth', __name__, url_prefix='')

BASE_DIR = os.path.dirname(__file__)
f_users  = os.path.join(BASE_DIR, "users.json")


# ================= LOGIN =================
# ================= 登录 =================

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        users    = load_data(f_users, [])
        username = request.form["username"]
        # 密码永远不会明文存储/比较 —— hash_password 把它变成一段
        # 不可逆的哈希值，再拿这个哈希值去跟存好的哈希值比较是否相等。
        # 这样就算 users.json 泄露，也看不到用户的真实密码。
        # Passwords are never stored or compared in plain text —
        # hash_password turns it into a one-way hash, and that hash is
        # compared against the stored hash for equality. This way, even if
        # users.json leaked, the real passwords still wouldn't be exposed.
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
# ================= 注册 =================

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        users    = load_data(f_users, [])
        username = request.form["username"]
        password = request.form["password"]
        question = request.form["question"]
        answer   = request.form["answer"]

        # any(...) 只要找到一个用户名一样的就立刻返回 True，
        # 不用把整个列表都跑一遍，用来检查"这个用户名是不是已经被占用了"。
        # any(...) short-circuits to True as soon as one matching username
        # is found, without scanning the rest of the list — used here to
        # check "is this username already taken".
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
            # 密保答案也要哈希存储，原因跟密码一样——防止泄露后
            # 别人能直接看到答案（比如"你的宠物叫什么"这种敏感信息）。
            # The security answer is hashed too, for the same reason as
            # the password — so a leak wouldn't expose the raw answer
            # (which can be sensitive, e.g. "what's your pet's name").
            "security_answer":   hash_password(answer),
            "theme": "cozy",
        })
        save_data(f_users, users)
        return redirect(url_for("auth.login", success="Account created successfully"))

    return redirect(url_for("auth.login"))


# ================= LOGOUT =================
# ================= 登出 =================

@auth_bp.route("/logout")
def logout():
    # session.pop(..., None) 删除登录状态；第二个参数 None 表示
    # 就算这个 key 本来就不存在，也不要报错，直接当作"什么都没做"。
    # session.pop(..., None) clears the logged-in state; the second
    # argument (None) is the fallback if the key isn't present, so this
    # never raises an error even if the user was already logged out.
    session.pop("user", None)
    return redirect(url_for("dashboard"))


# ================= FORGOT USERNAME =================
# ================= 找回用户名 =================

@auth_bp.route("/forgot_username", methods=["GET", "POST"])
def forgot_username():
    if request.method == "POST":
        question = request.form["question"]
        answer   = request.form["answer"]
        users    = load_data(f_users, [])
        hashed_answer = hash_password(answer)
        for u in users:
            # 密保问题要选得一样，并且答案的哈希值也要对得上，
            # 两个条件都满足才能确认是本人，缺一不可。
            # Both the security question must match AND the hashed answer
            # must match — both conditions are required to confirm this is
            # really the account owner.
            if (u.get("security_question") == question and
                    u.get("security_answer") == hashed_answer):
                return redirect(url_for("auth.login", panel="forgot_username",
                                        result=u["username"]))
        return redirect(url_for("auth.login", panel="forgot_username",
                                error="No matching account found"))
    return redirect(url_for("auth.login", panel="forgot_username"))


# ================= FORGOT PASSWORD =================
# ================= 忘记密码 =================

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
                    # 验证通过后，把"允许重设密码的用户名"临时存进 session，
                    # 下一步的 /reset 页面就靠这个 session 值来确认
                    # "这个人刚刚已经答对了密保问题"，不用再重新验证一次。
                    # Once verified, temporarily stash the username allowed
                    # to reset their password in the session. The /reset
                    # page below relies on this session value to confirm
                    # "this person just answered their security question
                    # correctly" without re-checking it again.
                    session["reset_user"] = username
                    return redirect(url_for("auth.reset_password"))
                return redirect(url_for("auth.login", panel="forgot",
                                        error="Wrong question or answer"))
        return redirect(url_for("auth.login", panel="forgot", error="User not found"))
    return redirect(url_for("auth.login", panel="forgot"))


# ================= RESET PASSWORD =================
# ================= 重设密码 =================

@auth_bp.route("/reset", methods=["GET", "POST"])
def reset_password():
    if "reset_user" not in session:
        # 没有经过上面 /forgot 那一步验证的人，不能直接访问这个页面，
        # 直接踢回去重新走"忘记密码"的验证流程。
        # Anyone who hasn't gone through the /forgot verification step
        # above can't access this page directly — send them back to
        # restart the "forgot password" flow.
        return redirect(url_for("auth.forgot_password"))
    username = session["reset_user"]
    if request.method == "POST":
        new_password = request.form.get("password")
        users = load_data(f_users, [])
        for u in users:
            if u["username"] == username:
                u["password"] = hash_password(new_password)
        save_data(f_users, users)
        # 密码改完之后立刻清掉这个临时的 session 标记，
        # 防止别人用同一个浏览器再次访问 /reset 时还能改密码。
        # Clear this temporary session flag right after the password is
        # changed, so nobody sharing the same browser session could revisit
        # /reset afterward and change the password again.
        session.pop("reset_user", None)
        return redirect(url_for("auth.login", success="Password reset successful"))
    return render_template("reset.html", username=username)
