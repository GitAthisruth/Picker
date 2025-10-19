from flask import Blueprint, request, jsonify
from models import db, Product, CartItem, Order, OrderItem
from routes.product import token_required
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import traceback
from logger_config import logger

order_bp = Blueprint('order', __name__)

# ----------------------------
# Add item to cart
# ----------------------------
@order_bp.route('/cart', methods=['POST'])
@token_required
def add_to_cart(current_user):
    try:
        data = request.get_json()
        product_id = data.get("product_id")
        quantity = data.get("quantity", 1)

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        if product.stock == 0:
            return jsonify({"error": "Product is out of stock"}), 400

        # Check if item already in cart
        cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)

        db.session.commit()
        logger.info(f"[product.py] User {current_user.id} added product {product_id} to cart")
        return jsonify({"message": "Added to cart successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[product.py] SQLAlchemy error in add_to_cart:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500
    except Exception:
        db.session.rollback()
        logger.error(f"[product.py] Unexpected error in add_to_cart:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------
# View cart
# ----------------------------
@order_bp.route('/cart', methods=['GET'])
@token_required
def view_cart(current_user):
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {
            "id": item.id,
            "product_id": item.product_id,  
            "product": item.product.name,
            "price": item.product.price,
            "quantity": item.quantity,
            "available_stock": item.product.stock
        } for item in cart_items
    ])


# ----------------------------
# Place Order
# ----------------------------
@order_bp.route('/orders', methods=['POST'])
@token_required
def place_order(current_user):
    try:
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        if not cart_items:
            return jsonify({"error": "Cart is empty"}), 400

        # Atomic stock check and update
        for item in cart_items:
            product = Product.query.with_for_update().get(item.product_id)  # locks row
            if product.stock < item.quantity:
                return jsonify({"error": f"{product.name} is out of stock"}), 400
            product.stock -= item.quantity

        # Create order
        order = Order(user_id=current_user.id)
        db.session.add(order)
        db.session.flush()  # get order.id

        for item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.product.price
            )
            db.session.add(order_item)
            db.session.delete(item)  # remove from cart

        db.session.commit()
        logger.info(f"[product.py] User {current_user.id} placed order {order.id}")
        return jsonify({"message": "Order placed successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[product.py] SQLAlchemy error in place_order:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500
    except Exception:
        db.session.rollback()
        logger.error(f"[product.py] Unexpected error in place_order:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------
# View orders
# ----------------------------
@order_bp.route('/orders', methods=['GET'])
@token_required
def view_orders(current_user):
    logger.info(f"[order.py] User {current_user.id} viewing orders")

    try:
        orders = Order.query.filter_by(user_id=current_user.id).all()
        result = []
        for order in orders:
            items = [
                {
                    "product": item.product.name,
                    "quantity": item.quantity,
                    "price": item.price
                } for item in order.order_items
            ]
            result.append({
                "order_id": order.id,
                "total_amount": order.total_amount,
                "status": order.status,
                "items": items
            })

        return jsonify(result), 200

    except Exception:
        logger.error(f"[order.py] Error while fetching orders for user {current_user.id}:\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch orders"}), 500


# ----------------------------
# Update cart item quantity
# ----------------------------
@order_bp.route('/cart/<int:product_id>', methods=['PATCH'])
@token_required
def update_cart_item(current_user, product_id):
    try:
        data = request.get_json()
        new_quantity = data.get("quantity")
        if new_quantity is None or new_quantity < 0:
            return jsonify({"error": "Invalid quantity"}), 400

        cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
        if not cart_item:
            return jsonify({"error": "Cart item not found"}), 404

        if new_quantity == 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = new_quantity

        db.session.commit()
        return jsonify({"message": "Cart updated"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500
