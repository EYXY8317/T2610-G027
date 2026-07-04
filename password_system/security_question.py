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

        # return = 结束这个函数，并且把结果传回给调用它的地方；
        # None = "没有值"、空、空指针；
        # 这里一次返回两个 None，表示"问题"和"答案"都拿不到，
        # 调用方看到两个都是 None 就知道用户没选有效的题号。
        # return = stops the function and sends a result back to whatever
        # called it; None = "no value" / empty / null.
        # Returning two Nones here means both "question" and "answer" are
        # unavailable — the caller sees both are None and knows the user
        # didn't pick a valid option.

        return None, None

    answer = input("Please enter your answer: ")
    hashed_answer = hash_password(answer)
    return question, hashed_answer
