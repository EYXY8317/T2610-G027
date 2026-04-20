from password_validation import is_valid_password
#Import validation function

from password_hashing import hash_password
#Import hashing function

from user_data import save_user
#Import function to save user data

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

        user={
            "username": username,
            "password": hashed
        }
        #Create user data
        #key = "username"  # field name
        #value = username  # data

        save_user(user)
        #Save to JSON

        print("User registered successfully!")  