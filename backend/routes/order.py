from flask import Blueprint, request, jsonify
from models import db, Product, CartItem, Order, OrderItem
from product import token_required

#token_required to verify user is logged in.

order_bp = Blueprint('order', __name__)

# ----------------------------
# Add item to cart
# ----------------------------
@order_bp.route('/cart', methods=['POST'])
@token_required
def add_to_cart(current_user):
    data = request.get_json()
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({"message": "Product not found"}), 404

    cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product.id).first()
    if cart_item:
        cart_item.quantity += data.get('quantity', 1)
    else:
        cart_item = CartItem(user_id=current_user.id, product_id=product.id, quantity=data.get('quantity',1))
        db.session.add(cart_item)

    db.session.commit()
    return jsonify({"message": "Item added to cart"})

# ----------------------------
# View cart
# ----------------------------
@order_bp.route('/cart', methods=['GET'])
@token_required
def view_cart(current_user):
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": item.id,
        "product": item.product.name,
        "price": item.product.price,
        "quantity": item.quantity
    } for item in cart_items])

# ----------------------------
# Place order
# ----------------------------
@order_bp.route('/orders', methods=['POST'])
@token_required
def place_order(current_user):
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400

    total = sum(item.product.price * item.quantity for item in cart_items)
    order = Order(user_id=current_user.id, total_amount=total)
    db.session.add(order)
    db.session.commit()

    # Add order items
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product.id,
            quantity=item.quantity,
            price=item.product.price
        )
        db.session.add(order_item)
        db.session.delete(item)  # remove from cart

    db.session.commit()
    return jsonify({"message": "Order placed successfully", "order_id": order.id})

# ----------------------------
# View orders
# ----------------------------
@order_bp.route('/orders', methods=['GET'])
@token_required
def view_orders(current_user):
    orders = Order.query.filter_by(user_id=current_user.id).all()
    result = []
    for order in orders:
        items = [{
            "product": item.product.name,
            "quantity": item.quantity,
            "price": item.price
        } for item in order.order_items]
        result.append({
            "order_id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "items": items
        })
    return jsonify(result)
