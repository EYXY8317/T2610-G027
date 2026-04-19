def is_valid_password(password):
#Create a function that checks if the password is valid
#def 是用来定义(define) function 的关键字

    if len(password) < 8:
        return False
    
    if not any(char.isdigit()for char in password):
    #Char.isdigit() for char in password = loop every character and check if it is a number
    #如果没有任何号码 就false
    #Char is a single character like A 3 b
    #For char in password = Split and check one by one
        return False
    
    if not any(char.isupper()for char in password):
    #Isupper = check if there is an uppercase letter
        return False
    
    if not any(char.islower()for char in password):
    #Islower = check if there is a lowercase letter
        return False
    
    return True

print(is_valid_password("abQc1as2"))
print(is_valid_password("Abc12345"))
print(is_valid_password("Abc1as2345"))