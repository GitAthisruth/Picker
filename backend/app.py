from flask import Flask
from flask_cors import CORS
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.exc import OperationalError
import time
import os

from routes.auth import auth_bp
from routes.product import product_bp
from routes.order import order_bp
from models import db
from logger_config import logger


# --- Flask app setup ---
app = Flask(__name__)
CORS(app)

# --- Configuration (use environment variables for Docker/local flexibility) ---
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "db")  # use 'db' when running in Docker
DB_NAME = os.getenv("DB_NAME", "picker")

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# --- Wait for database to be ready ---
max_retries = 10
for attempt in range(max_retries):
    try:
        if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]):
            create_database(app.config["SQLALCHEMY_DATABASE_URI"])
            logger.info(f"Database '{DB_NAME}' created successfully!")
        break
    except OperationalError:
        logger.warning(f"Database not ready. Retrying... ({attempt+1}/{max_retries})")
        time.sleep(3)
else:
    logger.error("Database connection failed after multiple attempts. Exiting.")
    exit(1)

# --- Initialize DB ---
db.init_app(app)

# --- Register Blueprints ---
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(product_bp, url_prefix="/api")
app.register_blueprint(order_bp, url_prefix="/api")


# --- Main Entry ---
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        logger.info("Database tables created (if not existing).")

    app.run(host="0.0.0.0", port=5000, debug=True)
