from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# ==================== 诊断信息 ====================
print("=== Flask 启动诊断 ===")
print("当前工作目录:", os.getcwd())
print("模板文件夹:", app.template_folder)
print("静态文件夹:", app.static_folder)
print("static 目录是否存在?", os.path.exists('static'))
if os.path.exists('static'):
    print("static 里的文件:", os.listdir('static'))
# ================================================

@app.route('/')
@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

# 手动静态文件路由（非常重要）
@app.route('/static/<path:filename>')
def serve_static(filename):
    print(f"正在请求静态文件: {filename}")   # 打印请求的文件
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)