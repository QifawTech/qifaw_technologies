import re
import os
import uuid
from datetime import datetime
from flask import jsonify
from werkzeug.utils import secure_filename
from config import Config

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^[0-9+\-\s()]{7,20}$")


def ok(data=None, message=None, status=200):
    body = {"success": True}
    if message:
        body["message"] = message
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def err(message, status=400, errors=None):
    body = {"success": False, "message": message}
    if errors:
        body["errors"] = errors
    return jsonify(body), status


def validate_required(payload, fields):
    errors = {}
    for f in fields:
        val = payload.get(f)
        if val is None or (isinstance(val, str) and not val.strip()):
            errors[f] = "This field is required"
    return errors


def paginate_args(request):
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = min(100, max(1, int(request.args.get("per_page", 12))))
    except (ValueError, TypeError):
        per_page = 12
    return page, per_page


def slugify(text):
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or "item"


def allowed_file(filename, allowed_ext_set):
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in allowed_ext_set


def save_upload(file_storage, folder, allowed_ext_set):
    if not file_storage or file_storage.filename == "":
        raise ValueError("No file provided")
    if not allowed_file(file_storage.filename, allowed_ext_set):
        raise ValueError("File type not allowed")
    original = secure_filename(file_storage.filename)
    ext = original.rsplit(".", 1)[1].lower() if "." in original else ""
    unique = f"{uuid.uuid4().hex}{('.' + ext) if ext else ''}"
    target_dir = os.path.join(Config.UPLOAD_FOLDER, folder)
    os.makedirs(target_dir, exist_ok=True)
    abs_path = os.path.join(target_dir, unique)
    file_storage.save(abs_path)
    rel_path = f"{folder}/{unique}"
    return rel_path, original


def now_iso():
    return datetime.utcnow().isoformat()
