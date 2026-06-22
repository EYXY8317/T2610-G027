"""
Run this once to pick your 3 book cover images.
They'll be copied to Journal_HomePages/assets/books/ automatically.
"""
import shutil, os, sys
import tkinter as tk
from tkinter import filedialog, messagebox

DEST = os.path.join(os.path.dirname(__file__), "Journal_HomePages", "assets", "books")
os.makedirs(DEST, exist_ok=True)

BOOKS = [
    ("book1.png", "Select Book 1 — Black Classic"),
    ("book2.png", "Select Book 2 — Pink Strawberry"),
    ("book3.png", "Select Book 3 — Brown Leather"),
]

root = tk.Tk()
root.withdraw()

for filename, prompt in BOOKS:
    path = filedialog.askopenfilename(
        title=prompt,
        filetypes=[("Image files", "*.jpg *.jpeg *.png *.webp")]
    )
    if not path:
        messagebox.showwarning("Skipped", f"Skipped {filename}")
        continue
    dest_path = os.path.join(DEST, filename)
    shutil.copy(path, dest_path)
    print(f"Saved: {dest_path}")

messagebox.showinfo("Done", "Book images saved!\nRefresh the dashboard to see them.")
root.destroy()
