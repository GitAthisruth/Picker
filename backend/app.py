from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import traceback

from routes.auth import auth_bp
from routes.product import product_bp
from routes.order import order_bp
from models import db, Product
from logger_config import logger


# --- Flask app setup ---
app = Flask(__name__)
CORS(app)

# --- Configuration ---
DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_NAME = "picker"

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --- Create DB if not exists ---
if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
    create_database(app.config["SQLALCHEMY_DATABASE_URI"])
    logger.info(f"Database '{DB_NAME}' created successfully!")

# --- Initialize DB ---
db.init_app(app)

# ----------------------------
# Routes
# ----------------------------

# ----------------------------
# Register Blueprints
# ----------------------------
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(product_bp, url_prefix="/api")
app.register_blueprint(order_bp, url_prefix="/api")


# ----------------------------
# Main Entry
# ----------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        logger.info("Database tables created (if not existing).")

    app.run(host="0.0.0.0", port=5000, debug=True)
