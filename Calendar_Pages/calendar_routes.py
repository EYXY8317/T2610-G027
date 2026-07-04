# ===============================
# ROUTES
# Handle requests from frontend 
# 处理前端请求
# Receive data and return response 
# 接收数据并返回结果
# ===============================

from flask import (
    Blueprint,
    session,
    jsonify,
    request
)

from .calendar_logic import (

    get_user_tasks,

    add_task,

    update_task,

    delete_task,

    empty_trash

)


# ===============================
# BLUEPRINT
# 蓝图
# ===============================

calendar_bp = Blueprint(
    "calendar",
    __name__
)

# ===============================
# GET TASKS
# Return all tasks
# of current user
# 返回当前用户的所有任务
# ===============================

@calendar_bp.route(
    "/calendar/tasks"
)
def calendar_tasks():

    if "user" not in session:

        return jsonify({

            "work": [],
            "shopping": [],
            "study": [],
            "personal": [],
            "workout": []

        })

    tasks = get_user_tasks(
        session["user"]
    )

    grouped = {

        "work": [],
        "shopping": [],
        "study": [],
        "personal": [],
        "workout": []

    }

    # 把这个用户的所有任务，按各自的 category（work/shopping/study/
    # personal/workout）分别丢进 grouped 字典对应的桶里——
    # "if category in grouped" 顺便过滤掉了任何不认识的分类值，
    # 避免因为脏数据而报错。
    # Buckets each of this user's tasks into the matching category
    # (work/shopping/study/personal/workout) inside the grouped dict —
    # "if category in grouped" also filters out any unrecognized category
    # value along the way, preventing bad data from causing an error.

    for task in tasks:

        category = task.get(
            "category"
        )

        if category in grouped:

            grouped[
                category
            ].append(task)

    return jsonify(
        grouped
    )

# ===============================
# ADD TASK API
# 新增任务接口
# ===============================

@calendar_bp.route(
    "/calendar/add_task",
    methods=["POST"]
)
def create_task():

    if "user" not in session:

        return jsonify({

            "success": False

        })

    task = request.json

    task["username"] = session["user"]

    add_task(task)

    return jsonify({

        "success": True

    })

# ===============================
# UPDATE TASK API
# 更新任务接口
# ===============================

@calendar_bp.route(
    "/calendar/update_task",
    methods=["POST"]
)
def update_task_api():

    if "user" not in session:

        return jsonify({

            "success": False

        })

    data = request.json

    # 遗留的调试语句，每次更新任务都会打印到终端，不影响功能。
    # Leftover debug statement — prints to the terminal on every task
    # update; doesn't affect functionality.
    print("UPDATE DATA:", data)

    update_task(

        data["id"],

        session["user"],

        data

    )

    return jsonify({

        "success": True

    })

# ===============================
# DELETE TASK API
# Permanently remove task
# from database
# 从数据（文件）中永久删除任务
# ===============================

@calendar_bp.route(
    "/calendar/delete_task",
    methods=["POST"]
)
def delete_task_api():

    if "user" not in session:

        return jsonify({

            "success": False

        })

    data = request.json

    delete_task(

        data["id"],

        session["user"]

    )

    return jsonify({

        "success": True

    })


# ===============================
# EMPTY TRASH API
# Permanently remove all
# trash tasks
# 永久删除所有回收站里的任务
# ===============================

@calendar_bp.route(
    "/calendar/empty_trash",
    methods=["POST"]
)
def empty_trash_api():

    if "user" not in session:

        return jsonify({

            "success": False

        })

    empty_trash(

        session["user"]

    )

    return jsonify({

        "success": True

    })