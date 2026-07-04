import hashlib
# 导入 hashlib —— Python 自带的哈希加密库。
# Import hashlib — Python's built-in hashing library.

def hash_password(password):
    # 把明文密码转换成一段不可逆的哈希值，用来安全地存储/比较密码，
    # 而不是直接存密码原文。
    # Turns a plain-text password into a one-way hash, so passwords can be
    # stored/compared safely without ever keeping the original text.

    # password.encode()：把字符串转换成字节（bytes）——
    # 哈希函数只能处理字节，不能直接处理文字字符串。
    # hashlib.sha256(...)：用 SHA-256 算法创建一个"哈希对象"。
    # password.encode(): converts the string into bytes — hash functions
    # only operate on bytes, not text strings directly.
    # hashlib.sha256(...): creates a "hash object" using the SHA-256
    # algorithm.

    hashed = hashlib.sha256(password.encode())

    # hexdigest()：把哈希对象转换成十六进制字符串（只包含 0-9 和 a-f），
    # 这种格式方便存进 JSON 文件、也方便和之前存的哈希值直接比较是否相等。
    # hexdigest(): converts the hash object into a hexadecimal string (only
    # 0-9 and a-f characters) — a format that's easy to store in a JSON
    # file and easy to compare directly against a previously stored hash.

    return hashed.hexdigest()

# 注意：下面这行是遗留的调试代码 —— 只要这个文件被 import
# （比如 auth_routes.py 一启动就会 import 它），就会立刻执行，
# 把一个写死的密码哈希打印到终端。这不影响程序运行，
# 但属于可以删掉的调试残留，可以考虑移除。
# Note: the line below is leftover debug code — it runs immediately any
# time this file is imported (e.g. auth_routes.py imports it on startup),
# printing a hardcoded password's hash to the console. It doesn't break
# anything, but it's debug residue that could be removed.

print(hash_password("Abc12345"))
