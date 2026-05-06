from datetime import datetime
from Journal_Pages.diary_system.crud import load_entries
from flask import request

#================================ get_today_entry() ================================
def get_today_entry():
# Function to get today's diary entry
# 这个函数用来获取“今天”的日记

    entries = load_entries()
    today = datetime.now().strftime("%d/%m/%Y")
    # Get current date and format it as string
    # 获取当前日期，并转成字符串格式（例如 30/04/2026）

    for e in entries:
    # Loop through each entry in list
    # 一个一个检查每条日记

        if e["date"] == today:
        # Check if entry date equals today
        # 检查这条日记的日期是不是今天

            return e
            # Return this entry if found
            # 如果找到，就直接返回这条日记（停止函数）
            
    return None

#================================ get_mode() ================================
def get_mode():
    entry = get_today_entry()

    if entry and entry["content"].strip() != "":
        return "view"
    else:
        return "add"
    
def get_entry_by_date(date):
    entries = load_entries()

    for e in entries:
        if e["date"] == date:
            return e

    return None