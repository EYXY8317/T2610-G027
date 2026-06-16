# ===============================
# 新增任务
# 获取用户任务
# ===============================

from .calendar_crud import (
    load_tasks,
    save_tasks
)

# ===============================
# GET USER TASKS
# Return all tasks
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