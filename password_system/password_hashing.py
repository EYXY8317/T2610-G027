import hashlib
#Import hashing library

def hash_password(password):
#Creat a  function to hash the password
#Input = Password

    hashed = hashlib.sha256(password.encode())
    #Password.encode() = Convert string → bytes
        #Becaus hash function only works with bytes
    #Hashlib.sha256() = Create a hash object apply with hashing algorithm (sha256)
    #Hashed = Store result

    return hashed.hexdigest()
    #hexdigest() = Convert hash object → hexadecimal string
        #Hex string = Readable format for humans
            #Only 0-9 and a-f characters
            #Use Hexdigest because can store in JSON and easy to copare
    #hexadecimal → 系统（进制）
    #hex string → 表达方式（字符串）
    #hexdigest() → 工具（转换用）

print(hash_password("Abc12345"))