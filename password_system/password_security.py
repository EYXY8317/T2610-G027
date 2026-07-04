from password_validation import is_valid_password
# 导入密码格式验证函数（检查长度/大小写/数字）。
# Import the password-format validation function (checks length/case/digits).

from password_hashing import hash_password
# 导入密码哈希函数。
# Import the password hashing function.

from user_data import save_user
# 导入"保存用户数据"函数。
# Import the "save user data" function.

from security_question import set_security_question

# 这是一个独立的命令行小脚本（不是网页的一部分），用来在终端里
# 手动注册一个用户 —— 跟网页版的 /register 路由（auth_routes.py）
# 是两套独立的注册流程，彼此不会互相调用。
# This is a standalone command-line script (not part of the web app) for
# manually registering a user from the terminal — it's a separate
# registration flow from the web's /register route (auth_routes.py); the
# two don't call each other.

username = input("Enter username: ")
password = input("Enter password: ")

if not is_valid_password(password):
    print("Invalid password. " \
          "Please try again.  " \
          "Password must be at least 8 characters long, " \
          "contain uppercase and lowercase letters, "
          "and include numbers.")
else:
    hashed = hash_password(password)

    question, hashed_answer = set_security_question()

    # 组装成一个字典，模仿 users.json 里存储每个用户的格式：
    # key（字段名）对应 value（这个用户的实际数据）。
    # Builds a dict matching the same shape each user is stored in inside
    # users.json: each key (field name) maps to this user's actual value.

    user={
        "username": username,
        "password": hashed,
        "security_question": question,
         "security_answer": hashed_answer
        }

    save_user(user)
    # 把这个新用户写入 JSON 文件保存。
    # Writes this new user out to the JSON file.

    print("User registered successfully!")
