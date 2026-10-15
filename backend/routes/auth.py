from datetime import datetime
from flask import Blueprint, request, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
import secrets

from db import query_one, execute
from utils import ok, err, EMAIL_RE
from middleware import login_required
from extensions import limiter

auth_bp = Blueprint("auth", __name__)


def _log(admin_id, action, entity=None, entity_id=None, meta=None):
    """Write to admin_activity_logs."""
    try:
        import json
        execute(
            """INSERT INTO admin_activity_logs (admin_id, action, entity, entity_id, meta)
               VALUES (%s, %s, %s, %s, %s)""",
            (admin_id, action, entity, entity_id, json.dumps(meta) if meta else None),
        )
    except Exception:
        # Never break main flow for a log
        pass


@auth_bp.get("/ping")
def ping():
    return ok(message="auth api up")


# =========================================================
# LOGIN — rate limited
# =========================================================
@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return err("Email and password are required", 400)

    if not EMAIL_RE.match(email):
        return err("Invalid email", 400)

    admin = query_one(
        """SELECT id, name, email, password_hash, is_active
           FROM admins WHERE email=%s""",
        (email,),
    )

    # Same generic error to prevent user enumeration
    if not admin or not check_password_hash(admin["password_hash"], password):
        return err("Invalid credentials", 401)

    if not admin["is_active"]:
        return err("Account is disabled", 403)

    # Create session
    session.clear()
    session.permanent = True
    session["admin_id"] = admin["id"]
    session["csrf_token"] = secrets.token_urlsafe(32)

    # Update last login
    execute(
        "UPDATE admins SET last_login_at=NOW() WHERE id=%s",
        (admin["id"],),
    )

    _log(admin["id"], "login", "admin", admin["id"])

    return ok(
        data={
            "admin": {
                "id": admin["id"],
                "name": admin["name"],
                "email": admin["email"],
            },
            "csrf_token": session["csrf_token"],
        },
        message="Login successful",
    )


# =========================================================
# LOGOUT
# =========================================================
@auth_bp.post("/logout")
@login_required
def logout():
    admin_id = session.get("admin_id")
    if admin_id:
        _log(admin_id, "logout", "admin", admin_id)
    session.clear()
    return ok(message="Logged out")


# =========================================================
# CURRENT ADMIN (bootstrap for frontend)
# =========================================================
@auth_bp.get("/me")
@login_required
def me():
    admin = request.admin  # set by login_required
    csrf = session.get("csrf_token")
    # regenerate if missing (existing session before upgrade)
    if not csrf:
        csrf = secrets.token_urlsafe(32)
        session["csrf_token"] = csrf
    return ok(data={
        "admin": {
            "id": admin["id"],
            "name": admin["name"],
            "email": admin["email"],
        },
        "csrf_token": csrf,
    })


# =========================================================
# CHANGE PASSWORD
# =========================================================
@auth_bp.post("/change-password")
@login_required
def change_password():
    from middleware import csrf_protect
    data = request.get_json(silent=True) or {}
    current = data.get("current_password") or ""
    new = data.get("new_password") or ""
    confirm = data.get("confirm_password") or ""

    if not current or not new or not confirm:
        return err("All fields are required", 400)
    if new != confirm:
        return err("New passwords do not match", 400)
    if len(new) < 8:
        return err("New password must be at least 8 characters", 400)

    admin_id = session["admin_id"]
    row = query_one("SELECT password_hash FROM admins WHERE id=%s", (admin_id,))
    if not row or not check_password_hash(row["password_hash"], current):
        return err("Current password is incorrect", 400)

    new_hash = generate_password_hash(new)
    execute("UPDATE admins SET password_hash=%s WHERE id=%s", (new_hash, admin_id))

    _log(admin_id, "change_password", "admin", admin_id)
    return ok(message="Password updated successfully")


# =========================================================
# REISSUE CSRF (in case of SPA refresh edge cases)
# =========================================================
@auth_bp.get("/csrf")
@login_required
def get_csrf():
    csrf = session.get("csrf_token") or secrets.token_urlsafe(32)
    session["csrf_token"] = csrf
    return ok(data={"csrf_token": csrf})

# =========================================================
# CHANGE EMAIL
# =========================================================
@auth_bp.post("/change-email")
@login_required
def change_email():
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_email = (data.get("new_email") or "").strip().lower()

    if not current_password:
        return err("Current password is required", 400)
    if not new_email or not EMAIL_RE.match(new_email):
        return err("Valid email is required", 400)

    admin_id = session["admin_id"]
    row = query_one(
        "SELECT email, password_hash FROM admins WHERE id=%s",
        (admin_id,),
    )
    if not row:
        return err("Admin not found", 404)

    if not check_password_hash(row["password_hash"], current_password):
        return err("Current password is incorrect", 400)

    if row["email"] == new_email:
        return err("New email is same as current email", 400)

    # Check uniqueness
    existing = query_one(
        "SELECT id FROM admins WHERE email=%s AND id<>%s",
        (new_email, admin_id),
    )
    if existing:
        return err("This email is already in use", 409)

    execute("UPDATE admins SET email=%s WHERE id=%s", (new_email, admin_id))

    _log(admin_id, "change_email", "admin", admin_id, {"new_email": new_email})
    return ok(data={"email": new_email}, message="Email updated successfully")
