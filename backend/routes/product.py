from flask import Blueprint, request, jsonify
from models import db, Product
from functools import wraps
import jwt
from models import User
import os

product_bp = Blueprint('product', __name__)
SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")

# ----------------------------
# Helper: Auth Decorator
# ----------------------------
def token_required(f):
    @wraps(f)#decorator
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({"message": "Invalid Token"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# ----------------------------
# Get all products
# ----------------------------
@product_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "stock": p.stock
    } for p in products])

# ----------------------------
# Add product (Admin only)
# ----------------------------
@product_bp.route('/products', methods=['POST'])
@token_required
def add_product(current_user):
    if not current_user.is_admin:
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()
    new_product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        stock=data.get('stock', 0)
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product added successfully"}), 201
