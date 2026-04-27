from flask import Flask
from diary_system.routes import diary_bp
app = Flask(__name__)

app.register_blueprint(diary_bp)

if __name__ == "__main__":
    app.run(debug=True)