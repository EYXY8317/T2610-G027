def is_valid_password(password):
    # 检查密码是否符合规则：至少 8 个字符，且同时包含数字、
    # 大写字母、小写字母 —— 4 个条件全部满足才算合格。
    # def 是用来定义 (define) function 的关键字。
    # Checks whether a password meets the rules: at least 8 characters,
    # and containing a digit, an uppercase letter, and a lowercase letter
    # — all 4 conditions must pass for the password to count as valid.
    # `def` is the keyword used to define a function.

    if len(password) < 8:
        return False

    # any(char.isdigit() for char in password)：把密码拆成一个个字符，
    # 依次检查每个字符是不是数字，只要有任意一个是数字就返回 True。
    # not any(...)：如果一个数字都没有（any 返回 False），
    # 就说明密码不合格，直接返回 False。
    # any(char.isdigit() for char in password): splits the password into
    # individual characters and checks each one — as soon as any single
    # character is a digit, this returns True.
    # not any(...): if there isn't a single digit anywhere (any() returns
    # False), the password fails this rule, so return False.

    if not any(char.isdigit() for char in password):
        return False

    # isupper()：判断这个字符是不是大写字母。
    # isupper(): checks whether this character is an uppercase letter.

    if not any(char.isupper() for char in password):
        return False

    # islower()：判断这个字符是不是小写字母。
    # islower(): checks whether this character is a lowercase letter.

    if not any(char.islower() for char in password):
        return False

    return True

# 下面 3 行是遗留的调试代码 —— 这个文件只要被 import
# （比如 auth_routes.py 一启动就会 import 它），就会立刻执行，
# 把这几个测试密码的验证结果打印到终端。不影响程序运行，
# 但属于调试残留，可以考虑移除。
# The 3 lines below are leftover debug code — they run immediately any
# time this file is imported (e.g. auth_routes.py imports it on startup),
# printing these test passwords' validation results to the console. This
# doesn't break anything, but it's debug residue that could be removed.

print(is_valid_password("abQc1as2"))
print(is_valid_password("Abc12345"))
print(is_valid_password("Abc1as2345"))
