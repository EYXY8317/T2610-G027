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
    add_task
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

        return jsonify([])

    return jsonify(

        get_user_tasks(
            session["user"]
        )

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

