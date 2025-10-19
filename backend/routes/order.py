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
    logger.info(f"[order.py] User {current_user.id} attempting to add item to cart")

    try:
        data = request.get_json()
        if not data or 'product_id' not in data:
            logger.warning("[order.py] Missing product_id in add_to_cart request")
            return jsonify({"error": "Missing product_id"}), 400

        product = Product.query.get(data['product_id'])
        if not product:
            logger.warning(f"[order.py] Product not found: {data['product_id']}")
            return jsonify({"message": "Product not found"}), 404

        # ✅ Check stock before adding to cart
        quantity_to_add = data.get('quantity', 1)
        if product.stock <= 0:
            logger.warning(f"[order.py] Product {product.id} out of stock")
            return jsonify({"message": "Stock Out"}), 400

        # ✅ Check if adding exceeds stock
        cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product.id).first()
        if cart_item:
            if cart_item.quantity + quantity_to_add > product.stock:
                logger.warning(f"[order.py] Insufficient stock for product {product.id}")
                return jsonify({"message": "Stock Out"}), 400
            cart_item.quantity += quantity_to_add
        else:
            if quantity_to_add > product.stock:
                return jsonify({"message": "Stock Out"}), 400
            cart_item = CartItem(user_id=current_user.id, product_id=product.id, quantity=quantity_to_add)
            db.session.add(cart_item)

        db.session.commit()
        logger.info(f"[order.py] Product {product.id} added to cart for user {current_user.id}")
        return jsonify({"message": "Item added to cart"}), 200

    except IntegrityError as e:
        db.session.rollback()
        logger.warning(f"[order.py] Integrity error while adding to cart: {str(e.orig)}")
        return jsonify({"error": f"Integrity error: {str(e.orig)}"}), 400

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[order.py] SQLAlchemy error while adding to cart:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500

    except Exception:
        db.session.rollback()
        logger.error(f"[order.py] Unexpected error while adding to cart:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------
# View cart
# ----------------------------
@order_bp.route('/cart', methods=['GET'])
@token_required
def view_cart(current_user):
    logger.info(f"[order.py] User {current_user.id} viewing cart")
    try:
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        return jsonify([
            {
                "id": item.id,
                "product": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity,
                "available_stock": item.product.stock
            } for item in cart_items
        ])
    except Exception:
        logger.error(f"[order.py] Error while fetching cart for user {current_user.id}:\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch cart"}), 500


# ----------------------------
# Place order
# ----------------------------
@order_bp.route('/orders', methods=['POST'])
@token_required
def place_order(current_user):
    logger.info(f"[order.py] User {current_user.id} placing order")

    try:
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        if not cart_items:
            logger.warning(f"[order.py] Empty cart for user {current_user.id}")
            return jsonify({"message": "Cart is empty"}), 400

        # ✅ Verify stock before creating order
        for item in cart_items:
            if item.quantity > item.product.stock:
                logger.warning(f"[order.py] Not enough stock for {item.product.name}")
                return jsonify({"message": f"Stock Out for {item.product.name}"}), 400

        total = sum(item.product.price * item.quantity for item in cart_items)
        order = Order(user_id=current_user.id, total_amount=total)
        db.session.add(order)
        db.session.commit()

        # ✅ Create order items and reduce stock
        for item in cart_items:
            item.product.stock -= item.quantity  # reduce stock
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product.id,
                quantity=item.quantity,
                price=item.product.price
            )
            db.session.add(order_item)
            db.session.delete(item)  # remove from cart

        db.session.commit()
        logger.info(f"[order.py] Order {order.id} placed successfully by user {current_user.id}")
        return jsonify({"message": "Order placed successfully", "order_id": order.id}), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.warning(f"[order.py] Integrity error while placing order: {str(e.orig)}")
        return jsonify({"error": f"Integrity error: {str(e.orig)}"}), 400

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[order.py] SQLAlchemy error while placing order:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500

    except Exception:
        db.session.rollback()
        logger.error(f"[order.py] Unexpected error while placing order:\n{traceback.format_exc()}")
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
