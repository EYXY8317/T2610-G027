import json
from password hashing import hash_password

def load_users():
    with open("users.json", "r") as file:
        return json.load(file)

def reset_password():
    user = load_users()

    username = input("Enter your username: ")

    if username != user["username"]:
         print("Username not found. Please try again.")
         return 

    print(user["security_question"])
      
    answer = input("Enter your answer: ")
    hashed = hash_password(answer)

    if hashed != user["security_answer"]:
        print("Incorrect answer. Please try again.")
        return

    new_password = input ("Enter your new password: ")
    new_hashed = hash_password(new_password)

    user["password"] = new_hashed
    with open("users.json", "w") as file:
        json.dump(user, file, indent=4)

    print("Password reset successfully!")

reset_password()
            
            
    