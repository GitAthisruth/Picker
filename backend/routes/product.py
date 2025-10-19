from flask import Blueprint, request, jsonify
from models import db, Product, User, CartItem, Order, OrderItem
from functools import wraps
import jwt
import os
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import select, update
import traceback
from logger_config import logger

product_bp = Blueprint('product', __name__)
SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")

# ----------------------------
# Auth Decorator
# ----------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            logger.warning("[product.py] Missing token in request headers")
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                logger.warning("[product.py] Token refers to non-existent user")
                return jsonify({"message": "Invalid user"}), 401
        except jwt.ExpiredSignatureError:
            logger.warning("[product.py] Token expired")
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            logger.warning("[product.py] Invalid token")
            return jsonify({"message": "Invalid Token"}), 401
        except Exception:
            logger.error(f"[product.py] Unexpected token error:\n{traceback.format_exc()}")
            return jsonify({"message": "Authentication failed"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ----------------------------
# Get all products
# ----------------------------
@product_bp.route('/products', methods=['GET'])
def get_products():
    logger.info("[product.py] Fetching all products")
    try:
        products = Product.query.all()
        return jsonify([
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "stock": p.stock
            } for p in products
        ]), 200

    except SQLAlchemyError:
        logger.error(f"[product.py] SQLAlchemy error while fetching products:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error while fetching products"}), 500
    except Exception:
        logger.error(f"[product.py] Unexpected error while fetching products:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------
# Add product (Admin only)
# ----------------------------
@product_bp.route('/products', methods=['POST'])
@token_required
def add_product(current_user):
    logger.info(f"[product.py] User {current_user.id} attempting to add product")
    if not current_user.is_admin:
        logger.warning(f"[product.py] Unauthorized access attempt by user {current_user.id}")
        return jsonify({"message": "Admin access required"}), 403

    try:
        data = request.get_json()
        if not all(k in data for k in ("name", "price")):
            logger.warning("[product.py] Missing name or price fields in add_product request")
            return jsonify({"error": "Missing required fields: name, price"}), 400

        new_product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            stock=data.get('stock', 0)
        )

        db.session.add(new_product)
        db.session.commit()
        logger.info(f"[product.py] Product '{new_product.name}' added successfully by admin {current_user.id}")
        return jsonify({"message": "Product added successfully"}), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.warning(f"[product.py] Integrity error while adding product: {str(e.orig)}")
        return jsonify({"error": f"Integrity error: {str(e.orig)}"}), 400

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[product.py] SQLAlchemy error while adding product:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500

    except Exception:
        db.session.rollback()
        logger.error(f"[product.py] Unexpected error while adding product:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500



