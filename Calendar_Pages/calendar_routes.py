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
    update_task

)

# ===============================
# BLUEPRINT
# ===============================

calendar_bp = Blueprint(
    "calendar",
    __name__
)

# ===============================
# GET TASKS
# Return all tasks
# of current user
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

    print("UPDATE DATA:", data)

    update_task(

        data["id"],

        session["user"],

        data

    )

    return jsonify({

        "success": True

    })