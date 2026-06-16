from flask import (
    Blueprint,
    session,
    jsonify
)

from .calendar_logic import (
    get_user_tasks
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