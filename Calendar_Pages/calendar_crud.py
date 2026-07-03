# ===============================
# CRUD
# Handle JSON file operations 
# 处理 JSON 文件操作
# Read and save data 
# 负责读取与保存数据
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

print(
    "TASK FILE =",
    TASK_FILE
)

# ===============================
# LOAD TASKS
# Read tasks from JSON file 
# 读取 JSON 文件中的任务
# ===============================

def load_tasks():

    if not os.path.exists(
        TASK_FILE
    ):

        return []

    try:

        with open(
            TASK_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except:

        return []

# ===============================
# SAVE TASKS
# Save tasks into JSON file 
# 将任务保存到 JSON 文件中
# ===============================

def save_tasks(tasks):

    print("FILE PATH =", TASK_FILE)

    with open(
        TASK_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            tasks,
            f,
            indent=4,
            ensure_ascii=False
        )

