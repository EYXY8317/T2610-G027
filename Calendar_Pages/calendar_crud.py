# ===============================
# 读 JSON
# 写 JSON
# ===============================
import json
import os

# ===============================
# FILE PATH
# ===============================

BASE_DIR = os.path.dirname(__file__)

TASK_FILE = os.path.join(
    BASE_DIR,
    "tasks.json"
)

# ===============================
# LOAD TASKS
# Read tasks from JSON file
# ===============================

def load_tasks():

    if not os.path.exists(
        TASK_FILE
    ):

        return []

    try:

        with open(
            TASK_FILE,
            "r"
        ) as f:

            return json.load(f)

    except:

        return []

# ===============================
# SAVE TASKS
# Save tasks into JSON file
# ===============================

def save_tasks(tasks):

    with open(
        TASK_FILE,
        "w"
    ) as f:

        json.dump(
            tasks,
            f,
            indent=4
        )

def save_tasks(tasks):

    with open(
        TASK_FILE,
        "w"
    ) as f:

        json.dump(
            tasks,
            f,
            indent=4
        )
