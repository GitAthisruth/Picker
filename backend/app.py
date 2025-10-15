from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy_utils import database_exists, create_database
from routes.auth import auth_bp
from routes.product import product_bp
from routes.order import order_bp
from models import db,Product

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
    print(f"Database '{DB_NAME}' created successfully!")
db.init_app(app)


# Routes
@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([{"id": p.id, "name": p.name, "price": p.price, "description": p.description} for p in products])

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()
    new_product = Product(name=data["name"], price=data["price"], description=data["description"])
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product added!"}), 201

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api')
app.register_blueprint(order_bp, url_prefix='/api')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000,debug = True)
