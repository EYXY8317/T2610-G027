# ===============================
# CRUD
# Handle JSON file operations 
# 处理 JSON 文件操作
# Read and save data 
# 负责读取与保存数据
# ===============================
import os
from db_store import load_data, save_data

# ===============================
# FILE PATH
# 文件路径
# ===============================

BASE_DIR = os.path.dirname(__file__)

TASK_FILE = os.path.join(
    BASE_DIR,
    "tasks.json"
)

# ===============================
# LOAD TASKS
# Read tasks from JSON file
# 读取 JSON 文件中的任务
# ===============================

def load_tasks():
    return load_data(TASK_FILE, [])

# ===============================
# SAVE TASKS
# Save tasks into JSON file
# 将任务保存到 JSON 文件中
# ===============================

def save_tasks(tasks):
    save_data(TASK_FILE, tasks)

