# 注意：这是一份独立的、没有被用到的 Flask 应用（跟仓库根目录的
# app.py 是两个完全不同的 Flask 实例，监听的端口也不一样，是 5001）。
# 整个项目实际启动的是根目录的 app.py，它是通过
# Calendar_Pages/calendar_routes.py 的蓝图（Blueprint）来接入日历功能的，
# 不会执行这个文件。这份文件像是日历模块刚开始独立开发、
# 还没接入主项目之前的一个早期版本，现在属于没人调用的遗留代码。
# Note: this is a standalone, unused Flask app (a completely separate
# Flask instance from the one in the repo root's app.py, listening on a
# different port, 5001). The project actually runs the root app.py, which
# wires in the calendar feature via Calendar_Pages/calendar_routes.py's
# Blueprint — this file is never executed. It looks like an early version
# of the calendar module from before it was integrated into the main
# project, and is now unreferenced leftover code.

from flask import Flask, render_template, send_from_directory
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

app = Flask(__name__,
            template_folder=TEMPLATES_DIR,
            static_folder=STATIC_DIR)

@app.route('/')
@app.route('/calendar')
def calendar():
    return render_template('mypage.html')   

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
    