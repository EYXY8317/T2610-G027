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
# Return all tasks belonging to one user
# 返回属于某一个用户的所有任务
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
# 新增任务
# ===============================

def add_task(task_data):

    tasks = load_tasks()

    tasks.append(task_data)

    save_tasks(tasks)


# ===============================
# UPDATE TASK
# Update existing task
# 更新已有任务
# ===============================

def update_task(task_id, username, new_data):

    tasks = load_tasks()

    # 注意：下面这几行 print(...) 都是遗留的调试语句——每次更新任务
    # 都会往终端打印一堆调试信息，不影响功能，但属于可以清理掉的
    # 调试残留（正式环境通常不会保留这些 print）。
    # Note: the print(...) calls below are leftover debug statements —
    # every task update prints a bunch of debug info to the terminal.
    # They don't affect functionality, but are debug residue that would
    # normally be cleaned up before shipping to production.

    print("LOOKING FOR:", task_id)

    for task in tasks:

        print("CHECKING:", task.get("id"))

        if (

            task.get("id") == task_id

            and

            task.get("username") == username

        ):

            print("FOUND TASK")

            # dict.update(new_data)：把 new_data 字典里的每个 key/value
            # 都合并进这个任务原有的字典里，同名的 key 会被覆盖，
            # 但没提到的字段会保留原值——不是整个任务对象被替换掉。
            # dict.update(new_data): merges every key/value from new_data
            # into this task's existing dict — matching keys get
            # overwritten, but any field not mentioned in new_data keeps
            # its original value; the whole task object isn't replaced.

            task.update(new_data)

            break

    save_tasks(tasks)

# ===============================
# DELETE TASK
# Permanently remove task
# from task list
# 从任务列表中永久删除该任务
# ===============================

def delete_task(task_id, username):

    tasks = load_tasks()

    print("DELETE ID:", task_id)

    print("BEFORE:", len(tasks))

    # 列表推导式：只保留"不是(同一个 id 而且同一个用户)"的任务，
    # 也就是把匹配的那一条从新列表里排除掉——达到删除的效果。
    # List comprehension: keeps only the tasks that are NOT (matching id
    # AND matching username) — excluding the one matching task from the
    # new list, which is what achieves deletion.

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
# 永久删除所有在回收站里的任务
# ===============================

def empty_trash(username):

    tasks = load_tasks()

    print("BEFORE:", len(tasks))

    # 保留"不是(属于这个用户 而且 状态是 trash)"的任务——
    # 也就是把这个用户所有标记为"回收站"状态的任务全部清空掉。
    # Keeps only the tasks that are NOT (belonging to this user AND
    # status is "trash") — clearing out every task this user has marked
    # as being in the trash.

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
