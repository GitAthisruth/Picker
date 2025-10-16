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

@app.route("/api/products", methods=["GET"])
def get_products():
    """Fetch all products."""
    try:
        products = Product.query.all()
        result = [
            {"id": p.id, "name": p.name, "price": p.price, "description": p.description}
            for p in products
        ]
        return jsonify(result), 200

    except SQLAlchemyError:
        logger.error("[app.py] SQLAlchemy error while fetching products:\n" + traceback.format_exc())
        return jsonify({"error": "Database error while fetching products"}), 500

    except Exception:
        logger.error("[app.py] Unexpected error while fetching products:\n" + traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/products", methods=["POST"])
def add_product():
    """Add a new product."""
    data = request.get_json()
    try:
        new_product = Product(
            name=data["name"],
            price=data["price"],
            description=data.get("description", "")
        )
        db.session.add(new_product)
        db.session.commit()

        logger.info(f"[app.py] Product '{data['name']}' added successfully.")
        return jsonify({"message": "Product added!"}), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.warning(f"[app.py] IntegrityError while adding product '{data.get('name')}': {str(e.orig)}")
        return jsonify({"error": f"Integrity error: {str(e.orig)}"}), 400

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[app.py] SQLAlchemyError while adding product '{data.get('name')}':\n" + traceback.format_exc())
        return jsonify({"error": "Database error"}), 500

    except Exception:
        db.session.rollback()
        logger.error(f"[app.py] Unexpected error while adding product '{data.get('name')}':\n" + traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


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
