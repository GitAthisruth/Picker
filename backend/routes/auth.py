from flask import Blueprint, request, jsonify
from models import db, User
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)#blueprint is a flask module for organizing routes as a mini sub-application

SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")

# ----------------------------
# Register
# ----------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 400

    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

# ----------------------------
# Login
# ----------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()#match for user email
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401

    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)#generating jwt token valid for 5 hours
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token})
