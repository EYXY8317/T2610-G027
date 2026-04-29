from flask import Flask
from diary_system.routes import diary_bp
from diary_system.encouragement_data import happy_list, sad_list, angry_list
#================================ Create Flask App ================================
app = Flask(__name__)

#================================ Register Blueprints ================================
app.register_blueprint(diary_bp)

#================================ Run Server ================================
if __name__ == "__main__":
    app.run(debug=True)