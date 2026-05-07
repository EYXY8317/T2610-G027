from flask import Flask, render_template

# 指定文件夹路径（相对于这个 app.py）
app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

@app.route('/')
def calendar():
    return render_template('calendar.html')

@app.route('/calendar')
def calendar_page():
    return render_template('calendar.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)   # 用 5001 端口，避免和组的冲突