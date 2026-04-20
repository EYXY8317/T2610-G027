from password_hashing import hash_password

def set_security_question():
    print("Please choose a security question:")
    print("1. What is your nickname?")
    print("2. Where is your birth city?")
    print("3. What is your favourite subject?")
    print("4. What is your mother's name?")
    print("5. What is your best friend's name?")

    choice = input("Enter your choice (1-5): ")

    if choice == "1":
        question = "What is your nickname?"
    elif choice == "2":
         question = "Where is your birth city?"
    elif choice == "3":
        question = "What is your favourite subject?"
    elif choice == "4":
        question = "What is your mother's name?"
    elif choice == "5":
        question = "What is your best friend's name?"
    else:
        print("Invalid choice. Please try again.")
        return None, None
        #Return = Stop function + send result
          #None = No value, empty, null
          #Return two empty values

    answer = input("Please enter your answer: ")
    hashed_answer = hash_password(answer)
    return question, hashed_answer

user = {
    "username": username,
    "password": hashed,
    "security_question": question,
    "security_answer": hashed_answer
}

{
    "username": "ABC",
    "password": "Abc12.",
    "security_question": "What is your nickname?",
    "security_answer": "AB"
}