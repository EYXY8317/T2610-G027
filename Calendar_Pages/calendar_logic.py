# ===============================
# LOGIC
# Handle business logic 
# 处理业务逻辑
# Process and validate data 
# 负责数据处理与验证
# ===============================

from .calendar_crud import (
    load_tasks,
    save_tasks
)

# ===============================
# GET USER TASKS  
# 获取用户任务
# Return all tasks 
# 新增任务
# belonging to one user
# ===============================

def get_user_tasks(username):

    tasks = load_tasks()

    return [

        task

        for task in tasks

        if task.get(
            "username"
        ) == username

    ]

# ===============================
# ADD TASK
# Save new task
# ===============================

def add_task(task_data):

    tasks = load_tasks()

    tasks.append(task_data)

    save_tasks(tasks)


# ===============================
# UPDATE TASK
# Update existing task
# ===============================

def update_task(task_id, username, new_data):

    tasks = load_tasks()

    print("LOOKING FOR:", task_id)

    for task in tasks:

        print("CHECKING:", task.get("id"))

        if (

            task.get("id") == task_id

            and

            task.get("username") == username

        ):

            print("FOUND TASK")

            task.update(new_data)

            break

    save_tasks(tasks)

# ===============================
# DELETE TASK
# Permanently remove task
# from task list
# ===============================

def delete_task(task_id, username):

    tasks = load_tasks()

    print("DELETE ID:", task_id)

    print("BEFORE:", len(tasks))

    tasks = [

        task

        for task in tasks

        if not (

            task.get("id") == task_id

            and

            task.get("username")
            == username

        )

    ]

    print("AFTER:", len(tasks))

    save_tasks(tasks)


# ===============================
# EMPTY TRASH
# Permanently remove all
# trash tasks
# ===============================

def empty_trash(username):

    tasks = load_tasks()

    print("BEFORE:", len(tasks))

    tasks = [

        task

        for task in tasks

        if not (

            task.get("username")
            == username

            and

            task.get("status")
            == "trash"

        )

    ]

    print("AFTER:", len(tasks))

    save_tasks(tasks)