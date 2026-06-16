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
# ADD TASK
# Save new task
# ===============================

def add_task(task_data):

    tasks = load_tasks()

    print("Before:", tasks)

    tasks.append(task_data)

    print("After:", tasks)

    save_tasks(tasks)

    print("Saved to:", task_data)