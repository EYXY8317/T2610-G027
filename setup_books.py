"""
Run this once to pick your 3 book cover images.
They'll be copied to DiaryHomepage/assets/books/ automatically.

================================================================
运行一次这个脚本，选择你的 3 张书本封面图片。
它们会被自动复制到 DiaryHomepage/assets/books/ 文件夹里。
================================================================
"""
import shutil, os, sys
import tkinter as tk
from tkinter import filedialog, messagebox

DEST = os.path.join(os.path.dirname(__file__), "DiaryHomepage", "assets", "books")
os.makedirs(DEST, exist_ok=True)

# 每一项是 (存到本地要用的文件名, 弹窗里显示给用户看的提示文字)。
# Each entry is (the filename it'll be saved as locally, the prompt text
# shown to the user in the file-picker dialog).

BOOKS = [
    ("book1.png", "Select Book 1 — Black Classic"),
    ("book2.png", "Select Book 2 — Pink Strawberry"),
    ("book3.png", "Select Book 3 — Brown Leather"),
]

# tkinter 是 Python 自带的桌面弹窗库；Tk() 会创建一个主窗口，
# withdraw() 把这个主窗口本身隐藏起来，只留下后面用到的
# "选择文件"和"提示消息"这两种小弹窗。
# tkinter is Python's built-in desktop GUI toolkit; Tk() creates a main
# window, and withdraw() hides that main window itself, leaving only the
# small "pick a file" and "message" popups used below visible.

root = tk.Tk()
root.withdraw()

for filename, prompt in BOOKS:
    # 弹出系统自带的"打开文件"选择窗口，只允许选图片文件；
    # 如果用户直接关掉窗口没有选文件，askopenfilename 会返回空字符串。
    # Opens the operating system's native "open file" dialog, restricted to
    # image files; if the user closes the dialog without picking a file,
    # askopenfilename returns an empty string.

    path = filedialog.askopenfilename(
        title=prompt,
        filetypes=[("Image files", "*.jpg *.jpeg *.png *.webp")]
    )
    if not path:
        messagebox.showwarning("Skipped", f"Skipped {filename}")
        continue
    dest_path = os.path.join(DEST, filename)
    # 把用户选的图片复制一份到目标文件夹，并且统一改成固定的
    # 文件名（比如 book1.png），这样代码里引用图片时路径永远不变，
    # 不用管用户原本选的文件叫什么名字。
    # Copies the user's chosen image into the destination folder under a
    # fixed filename (e.g. book1.png), so the code that references these
    # images always uses the same path regardless of what the original
    # file was named.
    shutil.copy(path, dest_path)
    print(f"Saved: {dest_path}")

messagebox.showinfo("Done", "Book images saved!\nRefresh the dashboard to see them.")
root.destroy()
