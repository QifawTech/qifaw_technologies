from functools import wraps
from flask import session, request, jsonify
from db import query_one


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        admin_id = session.get("admin_id")
        if not admin_id:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        admin = query_one(
            "SELECT id, name, email, is_active FROM admins WHERE id=%s",
            (admin_id,),
        )
        if not admin or not admin["is_active"]:
            session.clear()
            return jsonify({"success": False, "message": "Session invalid"}), 401

        request.admin = admin
        return fn(*args, **kwargs)
    return wrapper


def csrf_protect(fn):
    """Double-submit token check for unsafe methods."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return fn(*args, **kwargs)
        sent = request.headers.get("X-CSRF-Token")
        stored = session.get("csrf_token")
        if not stored or not sent or sent != stored:
            return jsonify({"success": False, "message": "CSRF token invalid"}), 403
        return fn(*args, **kwargs)
    return wrapper