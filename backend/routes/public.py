import os
from flask import Blueprint, request, send_from_directory
from db import query_all, query_one, execute
from utils import ok, err, paginate_args, save_upload, EMAIL_RE, PHONE_RE
from config import Config

public_bp = Blueprint("public", __name__)


@public_bp.get("/ping")
def ping():
    return ok(message="public api up")


@public_bp.get("/settings")
def get_settings():
    row = query_one("SELECT * FROM site_settings WHERE id = 1")
    return ok(data=row or {})


@public_bp.get("/page-content/<page_key>")
def get_page_content(page_key):
    rows = query_all(
        "SELECT section_key, content FROM page_contents WHERE page_key=%s",
        (page_key,),
    )
    result = {}
    for r in rows:
        c = r["content"]
        if isinstance(c, str):
            try:
                import json
                c = json.loads(c)
            except Exception:
                pass
        result[r["section_key"]] = c
    return ok(data=result)


@public_bp.get("/products")
def list_products():
    page, per_page = paginate_args(request)
    category = request.args.get("category")
    search = request.args.get("search")
    where = ["status='published'"]
    params = []
    if category:
        where.append("category=%s")
        params.append(category)
    if search:
        where.append("(name LIKE %s OR short_description LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like])
    where_sql = " AND ".join(where)
    total_row = query_one(f"SELECT COUNT(*) AS c FROM products WHERE {where_sql}", tuple(params))
    total = total_row["c"] if total_row else 0
    offset = (page - 1) * per_page
    rows = query_all(
        f"""SELECT id, name, slug, short_description, description, features,
                   category, image_path, demo_url, created_at
            FROM products WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )
    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@public_bp.get("/products/<slug>")
def product_detail(slug):
    row = query_one(
        """SELECT id, name, slug, short_description, description, features,
                  category, image_path, demo_url, created_at, updated_at
           FROM products WHERE slug=%s AND status='published'""",
        (slug,),
    )
    if not row:
        return err("Product not found", 404)
    related = query_all(
        """SELECT id, name, slug, short_description, image_path, category
           FROM products WHERE status='published' AND category=%s AND id<>%s
           ORDER BY created_at DESC LIMIT 3""",
        (row["category"], row["id"]),
    )
    row["related"] = related
    return ok(data=row)


@public_bp.get("/product-categories")
def product_categories():
    rows = query_all(
        """SELECT DISTINCT category FROM products
           WHERE status='published' AND category IS NOT NULL AND category<>''
           ORDER BY category"""
    )
    return ok(data=[r["category"] for r in rows])


@public_bp.get("/services")
def list_services():
    rows = query_all(
        """SELECT id, name, slug, short_description, description,
                  image_path, cta_text, cta_link, created_at
           FROM services WHERE status='published'
           ORDER BY created_at DESC"""
    )
    return ok(data=rows)


@public_bp.get("/services/<slug>")
def service_detail(slug):
    row = query_one(
        """SELECT id, name, slug, short_description, description,
                  image_path, cta_text, cta_link
           FROM services WHERE slug=%s AND status='published'""",
        (slug,),
    )
    if not row:
        return err("Service not found", 404)
    return ok(data=row)


@public_bp.get("/jobs")
def list_jobs():
    page, per_page = paginate_args(request)
    department = request.args.get("department")
    employment_type = request.args.get("employment_type")
    where = ["status='published'"]
    params = []
    if department:
        where.append("department=%s")
        params.append(department)
    if employment_type:
        where.append("employment_type=%s")
        params.append(employment_type)
    where_sql = " AND ".join(where)
    total_row = query_one(f"SELECT COUNT(*) AS c FROM jobs WHERE {where_sql}", tuple(params))
    total = total_row["c"] if total_row else 0
    offset = (page - 1) * per_page
    rows = query_all(
        f"""SELECT id, title, slug, department, location, employment_type,
                   work_mode, eligibility, skills, deadline, created_at
            FROM jobs WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )
    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@public_bp.get("/jobs/<slug>")
def job_detail(slug):
    row = query_one(
        """SELECT id, title, slug, department, location, employment_type,
                  work_mode, eligibility, description, skills, deadline, status
           FROM jobs WHERE slug=%s AND status='published'""",
        (slug,),
    )
    if not row:
        return err("Job not found", 404)
    return ok(data=row)


@public_bp.post("/jobs/<int:job_id>/apply")
def apply_job(job_id):
    job = query_one("SELECT id, status FROM jobs WHERE id=%s", (job_id,))
    if not job:
        return err("Job not found", 404)
    if job["status"] != "published":
        return err("This job is not accepting applications", 400)
    name = (request.form.get("name") or "").strip()
    email = (request.form.get("email") or "").strip().lower()
    phone = (request.form.get("phone") or "").strip()
    errors = {}
    if not name:
        errors["name"] = "Name is required"
    if not email or not EMAIL_RE.match(email):
        errors["email"] = "Valid email is required"
    if not phone or not PHONE_RE.match(phone):
        errors["phone"] = "Valid phone is required"
    if "resume" not in request.files:
        errors["resume"] = "Resume is required"
    if errors:
        return err("Validation failed", 400, errors=errors)
    try:
        rel_path, original = save_upload(request.files["resume"], "resumes", Config.ALLOWED_RESUME_EXT)
    except ValueError as e:
        return err(str(e), 400, errors={"resume": str(e)})
    app_id, _ = execute(
        """INSERT INTO applications (job_id, name, email, phone, resume_path, resume_original_name)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (job_id, name, email, phone, rel_path, original),
    )
    return ok(data={"id": app_id}, message="Application submitted successfully", status=201)


@public_bp.post("/enquiries")
def create_enquiry():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()
    errors = {}
    if not name:
        errors["name"] = "Name is required"
    if not email or not EMAIL_RE.match(email):
        errors["email"] = "Valid email is required"
    if phone and not PHONE_RE.match(phone):
        errors["phone"] = "Invalid phone number"
    if not subject:
        errors["subject"] = "Subject is required"
    if not message or len(message) < 10:
        errors["message"] = "Message must be at least 10 characters"
    if errors:
        return err("Validation failed", 400, errors=errors)
    eid, _ = execute(
        """INSERT INTO enquiries (name, email, phone, subject, message)
           VALUES (%s, %s, %s, %s, %s)""",
        (name, email, phone or None, subject, message),
    )
    return ok(data={"id": eid}, message="Message sent successfully", status=201)


# ⚡ MUKKIYAM: Ithula thaan rating-ah add pannirukken
@public_bp.get("/testimonials")
def list_testimonials():
    rows = query_all(
        """SELECT id, client_name, client_role, company, message, avatar_path, rating
           FROM testimonials WHERE status='published'
           ORDER BY created_at DESC"""
    )
    return ok(data=rows)


@public_bp.get("/media/<path:filename>")
def serve_media(filename):
    folder = os.path.join(Config.UPLOAD_FOLDER, "media")
    return send_from_directory(folder, filename)