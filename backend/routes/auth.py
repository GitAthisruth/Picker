from flask import Blueprint, request, jsonify
from models import db, User
import jwt
import datetime
import os
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import traceback
from logger_config import logger
import secrets

auth_bp = Blueprint('auth', __name__)

# Use a persistent SECRET_KEY if available, otherwise generate a random one
# This ensures that when the container restarts, old tokens become invalid automatically
SECRET_KEY = os.environ.get("SECRET_KEY") or secrets.token_hex(32)

# Default admin email
DEFAULT_ADMIN_EMAIL = "RaptorPicker@gmail.com"

# ----------------------------
# Register Route
# ----------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info("[auth.py] Register endpoint called")

    try:
        # Validate required fields
        if not all(k in data for k in ("username", "email", "password")):
            logger.warning("[auth.py] Missing fields in registration data")
            return jsonify({"error": "Missing username, email, or password"}), 400

        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            logger.warning(f"[auth.py] Registration attempt with existing email: {data['email']}")
            return jsonify({"message": "Email already registered"}), 400

        # Determine if admin
        is_admin_flag = (data['email'].lower() == DEFAULT_ADMIN_EMAIL.lower())

        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            is_admin=is_admin_flag
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        logger.info(f"[auth.py] User registered: {data['email']} | Admin: {is_admin_flag}")
        return jsonify({"message": "User registered successfully", "is_admin": is_admin_flag}), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.warning(f"[auth.py] Integrity error: {str(e.orig)}")
        return jsonify({"error": f"Integrity error: {str(e.orig)}"}), 400

    except SQLAlchemyError:
        db.session.rollback()
        logger.error(f"[auth.py] SQLAlchemy error:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500

    except Exception:
        db.session.rollback()
        logger.error(f"[auth.py] Unexpected error:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


# ----------------------------
# Login Route
# ----------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    logger.info("[auth.py] Login endpoint called")

    try:
        if not all(k in data for k in ("email", "password")):
            logger.warning("[auth.py] Missing fields in login data")
            return jsonify({"error": "Missing email or password"}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            logger.warning(f"[auth.py] Invalid login attempt for email: {data.get('email')}")
            return jsonify({"message": "Invalid email or password"}), 401

        # Create a new JWT token with expiration
        exp_time = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        token = jwt.encode({
            "user_id": user.id,
            "exp": exp_time
        }, SECRET_KEY, algorithm="HS256")

        logger.info(f"[auth.py] User logged in: {data['email']} | Token expires at: {exp_time.isoformat()}")

        return jsonify({
            "token": token,
            "is_admin": user.is_admin,
            "expires_in": 3600  # 1 hour in seconds
        }), 200

    except SQLAlchemyError:
        logger.error(f"[auth.py] SQLAlchemy error during login:\n{traceback.format_exc()}")
        return jsonify({"error": "Database error"}), 500

    except Exception:
        logger.error(f"[auth.py] Unexpected error during login:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500
