from flask import Flask
from diary_system.routes import diary_bp

#================================ Create Flask App ================================
app = Flask(__name__)

#================================ Register Blueprints ================================
app.register_blueprint(diary_bp)

#================================ Run Server ================================
if __name__ == "__main__":
    app.run(debug=True)