import json

def save_user(user_data):
    with open("users.json", "w") as file:
        #Create file if not exist

        json.dump(user_data, file, indent=4)    
        #Dump = Save data to JSON file
        #Indent 4 = Format JSON with 4 spaces for readability

user = {
    "username": "ABC",
    "password": "Abc12345"
}
save_user(user)