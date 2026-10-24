from flask import Blueprint, request, send_file
import os
import json
import mimetypes
from db import query_one, query_all, execute
from utils import ok, err, paginate_args, slugify
from middleware import login_required, csrf_protect
from config import Config

admin_bp = Blueprint("admin", __name__)


def _log(admin_id, action, entity, entity_id, meta=None):
    try:
        execute(
            """INSERT INTO admin_activity_logs (admin_id, action, entity, entity_id, meta)
               VALUES (%s, %s, %s, %s, %s)""",
            (admin_id, action, entity, entity_id, json.dumps(meta) if meta else None),
        )
    except Exception:
        pass


@admin_bp.get("/ping")
def ping():
    return ok(message="admin api up")


# =========================================================
# DASHBOARD STATS
# =========================================================
@admin_bp.get("/stats")
@login_required
def stats():
    p_total = query_one("SELECT COUNT(*) AS c FROM products")["c"]
    p_pub = query_one("SELECT COUNT(*) AS c FROM products WHERE status='published'")["c"]
    p_draft = query_one("SELECT COUNT(*) AS c FROM products WHERE status='draft'")["c"]
    p_hold = query_one("SELECT COUNT(*) AS c FROM products WHERE status='on_hold'")["c"]
    s_total = query_one("SELECT COUNT(*) AS c FROM services")["c"]
    s_pub = query_one("SELECT COUNT(*) AS c FROM services WHERE status='published'")["c"]
    j_total = query_one("SELECT COUNT(*) AS c FROM jobs")["c"]
    j_pub = query_one("SELECT COUNT(*) AS c FROM jobs WHERE status='published'")["c"]
    j_closed = query_one("SELECT COUNT(*) AS c FROM jobs WHERE status='closed'")["c"]
    a_total = query_one("SELECT COUNT(*) AS c FROM applications")["c"]
    a_new = query_one("SELECT COUNT(*) AS c FROM applications WHERE status='New'")["c"]
    a_short = query_one("SELECT COUNT(*) AS c FROM applications WHERE status='Shortlisted'")["c"]
    a_hired = query_one("SELECT COUNT(*) AS c FROM applications WHERE status='Hired'")["c"]
    e_total = query_one("SELECT COUNT(*) AS c FROM enquiries")["c"]
    e_unread = query_one("SELECT COUNT(*) AS c FROM enquiries WHERE is_read=0")["c"]
    t_total = query_one("SELECT COUNT(*) AS c FROM testimonials")["c"]
    t_pub = query_one("SELECT COUNT(*) AS c FROM testimonials WHERE status='published'")["c"]

    activity = query_all(
        """SELECT id, action, entity, entity_id, created_at
           FROM admin_activity_logs
           ORDER BY created_at DESC LIMIT 8"""
    )
    recent_apps = query_all(
        """SELECT a.id, a.name, a.email, a.status, a.created_at,
                  j.title AS job_title
           FROM applications a
           LEFT JOIN jobs j ON j.id = a.job_id
           ORDER BY a.created_at DESC LIMIT 5"""
    )

    return ok(data={
        "admin_name": request.admin["name"],
        "products": {"total": p_total, "published": p_pub, "draft": p_draft, "on_hold": p_hold},
        "services": {"total": s_total, "published": s_pub},
        "jobs": {"total": j_total, "published": j_pub, "closed": j_closed},
        "applications": {"total": a_total, "new": a_new, "shortlisted": a_short, "hired": a_hired},
        "enquiries": {"total": e_total, "unread": e_unread},
        "testimonials": {"total": t_total, "published": t_pub},
        "recent_activity": activity,
        "recent_applications": recent_apps,
    })


# =========================================================
# PRODUCTS CRUD
# =========================================================
@admin_bp.get("/products")
@login_required
def list_products():
    page, per_page = paginate_args(request)
    status = request.args.get("status")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if status:
        where.append("status=%s")
        params.append(status)
    if search:
        where.append("(name LIKE %s OR category LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like])
    where_sql = " AND ".join(where)

    total = query_one(f"SELECT COUNT(*) AS c FROM products WHERE {where_sql}", tuple(params))["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT id, name, slug, short_description, category, image_path,
                   demo_url, status, created_at, updated_at
            FROM products WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/products/<int:pid>")
@login_required
def get_product(pid):
    row = query_one("SELECT * FROM products WHERE id=%s", (pid,))
    if not row:
        return err("Product not found", 404)
    if row.get("features") and isinstance(row["features"], str):
        try:
            row["features"] = json.loads(row["features"])
        except Exception:
            row["features"] = []
    return ok(data=row)


def _unique_slug(base, exclude_id=None):
    slug = slugify(base)
    if not slug:
        slug = "item"
    candidate = slug
    i = 1
    while True:
        if exclude_id:
            exists = query_one(
                "SELECT id FROM products WHERE slug=%s AND id<>%s",
                (candidate, exclude_id),
            )
        else:
            exists = query_one("SELECT id FROM products WHERE slug=%s", (candidate,))
        if not exists:
            return candidate
        i += 1
        candidate = f"{slug}-{i}"


@admin_bp.post("/products")
@login_required
@csrf_protect
def create_product():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return err("Name is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    slug = _unique_slug(data.get("slug") or name)

    features = data.get("features")
    if isinstance(features, list):
        features_json = json.dumps(features)
    elif isinstance(features, str) and features.strip():
        features_json = features
    else:
        features_json = None

    pid, _ = execute(
        """INSERT INTO products
           (name, slug, short_description, description, features, category,
            image_path, demo_url, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            name, slug,
            (data.get("short_description") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            features_json,
            (data.get("category") or "").strip() or None,
            (data.get("image_path") or "").strip() or None,
            (data.get("demo_url") or "").strip() or None,
            status,
        ),
    )
    _log(request.admin["id"], "create", "product", pid, {"name": name})
    return ok(data={"id": pid}, message="Product created", status=201)


@admin_bp.put("/products/<int:pid>")
@login_required
@csrf_protect
def update_product(pid):
    existing = query_one("SELECT id, slug FROM products WHERE id=%s", (pid,))
    if not existing:
        return err("Product not found", 404)

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return err("Name is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    new_slug = existing["slug"]
    if data.get("slug") and data.get("slug") != existing["slug"]:
        new_slug = _unique_slug(data["slug"], exclude_id=pid)

    features = data.get("features")
    if isinstance(features, list):
        features_json = json.dumps(features)
    elif isinstance(features, str) and features.strip():
        features_json = features
    else:
        features_json = None

    execute(
        """UPDATE products SET
             name=%s, slug=%s, short_description=%s, description=%s,
             features=%s, category=%s, image_path=%s, demo_url=%s, status=%s
           WHERE id=%s""",
        (
            name, new_slug,
            (data.get("short_description") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            features_json,
            (data.get("category") or "").strip() or None,
            (data.get("image_path") or "").strip() or None,
            (data.get("demo_url") or "").strip() or None,
            status, pid,
        ),
    )
    _log(request.admin["id"], "update", "product", pid, {"name": name})
    return ok(message="Product updated")


@admin_bp.patch("/products/<int:pid>/status")
@login_required
@csrf_protect
def update_product_status(pid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM products WHERE id=%s", (pid,))
    if not exists:
        return err("Product not found", 404)

    execute("UPDATE products SET status=%s WHERE id=%s", (status, pid))
    _log(request.admin["id"], "status_change", "product", pid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.delete("/products/<int:pid>")
@login_required
@csrf_protect
def delete_product(pid):
    exists = query_one("SELECT id FROM products WHERE id=%s", (pid,))
    if not exists:
        return err("Product not found", 404)
    execute("DELETE FROM products WHERE id=%s", (pid,))
    _log(request.admin["id"], "delete", "product", pid)
    return ok(message="Product deleted")


# =========================================================
# MEDIA UPLOAD
# =========================================================
@admin_bp.post("/media/upload")
@login_required
@csrf_protect
def upload_media():
    from utils import save_upload

    if "file" not in request.files:
        return err("No file provided", 400)

    file = request.files["file"]
    try:
        rel_path, original = save_upload(file, "media", Config.ALLOWED_IMAGE_EXT)
    except ValueError as e:
        return err(str(e), 400)

    mid, _ = execute(
        """INSERT INTO media_files (file_name, file_path, kind, uploaded_by)
           VALUES (%s, %s, %s, %s)""",
        (original, rel_path, "product", request.admin["id"]),
    )

    filename = rel_path.replace("media/", "")
    public_url = f"/api/v1/public/media/{filename}"

    _log(request.admin["id"], "upload", "media", mid, {"name": original})

    return ok(data={
        "id": mid,
        "path": rel_path,
        "url": public_url,
        "name": original,
    }, message="File uploaded", status=201)


# =========================================================
# SERVICES CRUD
# =========================================================
def _unique_service_slug(base, exclude_id=None):
    slug = slugify(base)
    if not slug:
        slug = "service"
    candidate = slug
    i = 1
    while True:
        if exclude_id:
            exists = query_one(
                "SELECT id FROM services WHERE slug=%s AND id<>%s",
                (candidate, exclude_id),
            )
        else:
            exists = query_one("SELECT id FROM services WHERE slug=%s", (candidate,))
        if not exists:
            return candidate
        i += 1
        candidate = f"{slug}-{i}"


@admin_bp.get("/services")
@login_required
def admin_list_services():
    page, per_page = paginate_args(request)
    status = request.args.get("status")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if status:
        where.append("status=%s")
        params.append(status)
    if search:
        where.append("(name LIKE %s OR short_description LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like])
    where_sql = " AND ".join(where)

    total = query_one(f"SELECT COUNT(*) AS c FROM services WHERE {where_sql}", tuple(params))["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT id, name, slug, short_description, image_path,
                   cta_text, cta_link, status, created_at, updated_at
            FROM services WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/services/<int:sid>")
@login_required
def admin_get_service(sid):
    row = query_one("SELECT * FROM services WHERE id=%s", (sid,))
    if not row:
        return err("Service not found", 404)
    return ok(data=row)


@admin_bp.post("/services")
@login_required
@csrf_protect
def admin_create_service():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return err("Name is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    slug = _unique_service_slug(data.get("slug") or name)

    sid, _ = execute(
        """INSERT INTO services
           (name, slug, short_description, description, image_path,
            cta_text, cta_link, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            name, slug,
            (data.get("short_description") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            (data.get("image_path") or "").strip() or None,
            (data.get("cta_text") or "").strip() or None,
            (data.get("cta_link") or "").strip() or None,
            status,
        ),
    )
    _log(request.admin["id"], "create", "service", sid, {"name": name})
    return ok(data={"id": sid}, message="Service created", status=201)


@admin_bp.put("/services/<int:sid>")
@login_required
@csrf_protect
def admin_update_service(sid):
    existing = query_one("SELECT id, slug FROM services WHERE id=%s", (sid,))
    if not existing:
        return err("Service not found", 404)

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return err("Name is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    new_slug = existing["slug"]
    if data.get("slug") and data.get("slug") != existing["slug"]:
        new_slug = _unique_service_slug(data["slug"], exclude_id=sid)

    execute(
        """UPDATE services SET
             name=%s, slug=%s, short_description=%s, description=%s,
             image_path=%s, cta_text=%s, cta_link=%s, status=%s
           WHERE id=%s""",
        (
            name, new_slug,
            (data.get("short_description") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            (data.get("image_path") or "").strip() or None,
            (data.get("cta_text") or "").strip() or None,
            (data.get("cta_link") or "").strip() or None,
            status, sid,
        ),
    )
    _log(request.admin["id"], "update", "service", sid, {"name": name})
    return ok(message="Service updated")


@admin_bp.patch("/services/<int:sid>/status")
@login_required
@csrf_protect
def admin_update_service_status(sid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM services WHERE id=%s", (sid,))
    if not exists:
        return err("Service not found", 404)

    execute("UPDATE services SET status=%s WHERE id=%s", (status, sid))
    _log(request.admin["id"], "status_change", "service", sid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.delete("/services/<int:sid>")
@login_required
@csrf_protect
def admin_delete_service(sid):
    exists = query_one("SELECT id FROM services WHERE id=%s", (sid,))
    if not exists:
        return err("Service not found", 404)
    execute("DELETE FROM services WHERE id=%s", (sid,))
    _log(request.admin["id"], "delete", "service", sid)
    return ok(message="Service deleted")


# =========================================================
# JOBS CRUD
# =========================================================
def _unique_job_slug(base, exclude_id=None):
    slug = slugify(base)
    if not slug:
        slug = "job"
    candidate = slug
    i = 1
    while True:
        if exclude_id:
            exists = query_one(
                "SELECT id FROM jobs WHERE slug=%s AND id<>%s",
                (candidate, exclude_id),
            )
        else:
            exists = query_one("SELECT id FROM jobs WHERE slug=%s", (candidate,))
        if not exists:
            return candidate
        i += 1
        candidate = f"{slug}-{i}"


@admin_bp.get("/jobs")
@login_required
def admin_list_jobs():
    page, per_page = paginate_args(request)
    status = request.args.get("status")
    department = request.args.get("department")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if status:
        where.append("status=%s")
        params.append(status)
    if department:
        where.append("department=%s")
        params.append(department)
    if search:
        where.append("(title LIKE %s OR location LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like])
    where_sql = " AND ".join(where)

    total = query_one(f"SELECT COUNT(*) AS c FROM jobs WHERE {where_sql}", tuple(params))["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT id, title, slug, department, location, employment_type,
                   work_mode, eligibility, skills, deadline, status,
                   created_at, updated_at
            FROM jobs WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/jobs/<int:jid>")
@login_required
def admin_get_job(jid):
    row = query_one("SELECT * FROM jobs WHERE id=%s", (jid,))
    if not row:
        return err("Job not found", 404)
    return ok(data=row)


@admin_bp.post("/jobs")
@login_required
@csrf_protect
def admin_create_job():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return err("Title is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold", "closed"):
        return err("Invalid status", 400)

    slug = _unique_job_slug(data.get("slug") or title)
    deadline = data.get("deadline") or None
    if deadline == "":
        deadline = None

    jid, _ = execute(
        """INSERT INTO jobs
           (title, slug, department, location, employment_type, work_mode,
            eligibility, description, skills, deadline, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            title, slug,
            (data.get("department") or "").strip() or None,
            (data.get("location") or "").strip() or None,
            (data.get("employment_type") or "Full-Time").strip(),
            (data.get("work_mode") or "On-site").strip(),
            (data.get("eligibility") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            (data.get("skills") or "").strip() or None,
            deadline,
            status,
        ),
    )
    _log(request.admin["id"], "create", "job", jid, {"title": title})
    return ok(data={"id": jid}, message="Job created", status=201)


@admin_bp.put("/jobs/<int:jid>")
@login_required
@csrf_protect
def admin_update_job(jid):
    existing = query_one("SELECT id, slug FROM jobs WHERE id=%s", (jid,))
    if not existing:
        return err("Job not found", 404)

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return err("Title is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold", "closed"):
        return err("Invalid status", 400)

    new_slug = existing["slug"]
    if data.get("slug") and data.get("slug") != existing["slug"]:
        new_slug = _unique_job_slug(data["slug"], exclude_id=jid)

    deadline = data.get("deadline") or None
    if deadline == "":
        deadline = None

    execute(
        """UPDATE jobs SET
             title=%s, slug=%s, department=%s, location=%s,
             employment_type=%s, work_mode=%s, eligibility=%s,
             description=%s, skills=%s, deadline=%s, status=%s
           WHERE id=%s""",
        (
            title, new_slug,
            (data.get("department") or "").strip() or None,
            (data.get("location") or "").strip() or None,
            (data.get("employment_type") or "Full-Time").strip(),
            (data.get("work_mode") or "On-site").strip(),
            (data.get("eligibility") or "").strip() or None,
            (data.get("description") or "").strip() or None,
            (data.get("skills") or "").strip() or None,
            deadline,
            status, jid,
        ),
    )
    _log(request.admin["id"], "update", "job", jid, {"title": title})
    return ok(message="Job updated")


@admin_bp.patch("/jobs/<int:jid>/status")
@login_required
@csrf_protect
def admin_update_job_status(jid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("draft", "published", "on_hold", "closed"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM jobs WHERE id=%s", (jid,))
    if not exists:
        return err("Job not found", 404)

    execute("UPDATE jobs SET status=%s WHERE id=%s", (status, jid))
    _log(request.admin["id"], "status_change", "job", jid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.delete("/jobs/<int:jid>")
@login_required
@csrf_protect
def admin_delete_job(jid):
    exists = query_one("SELECT id FROM jobs WHERE id=%s", (jid,))
    if not exists:
        return err("Job not found", 404)
    execute("DELETE FROM jobs WHERE id=%s", (jid,))
    _log(request.admin["id"], "delete", "job", jid)
    return ok(message="Job deleted")


# =========================================================
# APPLICATIONS VIEWER
# =========================================================
@admin_bp.get("/applications")
@login_required
def admin_list_applications():
    page, per_page = paginate_args(request)
    status = request.args.get("status")
    job_id = request.args.get("job_id")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if status:
        where.append("a.status=%s")
        params.append(status)
    if job_id:
        where.append("a.job_id=%s")
        params.append(job_id)
    if search:
        where.append("(a.name LIKE %s OR a.email LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like])
    where_sql = " AND ".join(where)

    total = query_one(
        f"""SELECT COUNT(*) AS c FROM applications a
            LEFT JOIN jobs j ON j.id = a.job_id
            WHERE {where_sql}""",
        tuple(params),
    )["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT a.id, a.job_id, a.name, a.email, a.phone,
                   a.resume_path, a.resume_original_name,
                   a.status, a.notes, a.created_at,
                   j.title AS job_title
            FROM applications a
            LEFT JOIN jobs j ON j.id = a.job_id
            WHERE {where_sql}
            ORDER BY a.created_at DESC
            LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/applications/<int:aid>")
@login_required
def admin_get_application(aid):
    row = query_one(
        """SELECT a.*, j.title AS job_title, j.slug AS job_slug
           FROM applications a
           LEFT JOIN jobs j ON j.id = a.job_id
           WHERE a.id=%s""",
        (aid,),
    )
    if not row:
        return err("Application not found", 404)
    return ok(data=row)


@admin_bp.patch("/applications/<int:aid>/status")
@login_required
@csrf_protect
def admin_update_application_status(aid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("New", "Reviewing", "Shortlisted", "Rejected", "Hired"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM applications WHERE id=%s", (aid,))
    if not exists:
        return err("Application not found", 404)

    execute("UPDATE applications SET status=%s WHERE id=%s", (status, aid))
    _log(request.admin["id"], "status_change", "application", aid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.patch("/applications/<int:aid>/notes")
@login_required
@csrf_protect
def admin_update_application_notes(aid):
    data = request.get_json(silent=True) or {}
    notes = (data.get("notes") or "").strip() or None

    exists = query_one("SELECT id FROM applications WHERE id=%s", (aid,))
    if not exists:
        return err("Application not found", 404)

    execute("UPDATE applications SET notes=%s WHERE id=%s", (notes, aid))
    _log(request.admin["id"], "update_notes", "application", aid)
    return ok(message="Notes saved")


@admin_bp.get("/applications/<int:aid>/resume")
@login_required
def admin_download_resume(aid):
    """Secure resume download — only authenticated admins."""
    row = query_one(
        "SELECT resume_path, resume_original_name FROM applications WHERE id=%s",
        (aid,),
    )
    if not row or not row["resume_path"]:
        return err("Resume path not found in DB", 404)

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(backend_dir)
    abs_path = os.path.join(backend_dir, Config.UPLOAD_FOLDER, row["resume_path"])
    abs_path = os.path.abspath(abs_path)

    if not os.path.exists(abs_path):
        return err(f"File missing on server: {row['resume_path']}", 404)

    size = os.path.getsize(abs_path)
    if size == 0:
        return err("File is empty on server", 400)

    mime, _ = mimetypes.guess_type(abs_path)
    if not mime:
        mime = "application/octet-stream"

    download_name = row["resume_original_name"] or f"resume_{aid}"

    return send_file(
        abs_path,
        mimetype=mime,
        as_attachment=True,
        download_name=download_name,
    )


# =========================================================
# ENQUIRIES VIEWER
# =========================================================
@admin_bp.get("/enquiries")
@login_required
def admin_list_enquiries():
    page, per_page = paginate_args(request)
    is_read = request.args.get("is_read")
    status = request.args.get("status")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if is_read is not None and is_read != "":
        where.append("is_read=%s")
        params.append(1 if is_read in ("1", "true", "True") else 0)
    if status:
        where.append("follow_up_status=%s")
        params.append(status)
    if search:
        where.append("(name LIKE %s OR email LIKE %s OR subject LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like, like])
    where_sql = " AND ".join(where)

    total = query_one(f"SELECT COUNT(*) AS c FROM enquiries WHERE {where_sql}", tuple(params))["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT id, name, email, phone, subject, message,
                   is_read, follow_up_status, created_at, updated_at
            FROM enquiries WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/enquiries/<int:eid>")
@login_required
def admin_get_enquiry(eid):
    row = query_one("SELECT * FROM enquiries WHERE id=%s", (eid,))
    if not row:
        return err("Enquiry not found", 404)

    if not row["is_read"]:
        execute("UPDATE enquiries SET is_read=1 WHERE id=%s", (eid,))
        row["is_read"] = 1

    return ok(data=row)


@admin_bp.patch("/enquiries/<int:eid>/read")
@login_required
@csrf_protect
def admin_update_enquiry_read(eid):
    data = request.get_json(silent=True) or {}
    is_read = data.get("is_read")
    if is_read not in (0, 1, True, False):
        return err("is_read must be true or false", 400)

    exists = query_one("SELECT id FROM enquiries WHERE id=%s", (eid,))
    if not exists:
        return err("Enquiry not found", 404)

    execute("UPDATE enquiries SET is_read=%s WHERE id=%s", (1 if is_read else 0, eid))
    _log(request.admin["id"], "read_change", "enquiry", eid, {"is_read": bool(is_read)})
    return ok(message="Marked as " + ("read" if is_read else "unread"))


@admin_bp.patch("/enquiries/<int:eid>/status")
@login_required
@csrf_protect
def admin_update_enquiry_status(eid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("New", "Contacted", "Closed"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM enquiries WHERE id=%s", (eid,))
    if not exists:
        return err("Enquiry not found", 404)

    execute("UPDATE enquiries SET follow_up_status=%s WHERE id=%s", (status, eid))
    _log(request.admin["id"], "status_change", "enquiry", eid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.delete("/enquiries/<int:eid>")
@login_required
@csrf_protect
def admin_delete_enquiry(eid):
    exists = query_one("SELECT id FROM enquiries WHERE id=%s", (eid,))
    if not exists:
        return err("Enquiry not found", 404)
    execute("DELETE FROM enquiries WHERE id=%s", (eid,))
    _log(request.admin["id"], "delete", "enquiry", eid)
    return ok(message="Enquiry deleted")


# =========================================================
# TESTIMONIALS CRUD
# =========================================================
@admin_bp.get("/testimonials")
@login_required
def admin_list_testimonials():
    page, per_page = paginate_args(request)
    status = request.args.get("status")
    search = request.args.get("search")

    where = ["1=1"]
    params = []
    if status:
        where.append("status=%s")
        params.append(status)
    if search:
        where.append("(client_name LIKE %s OR company LIKE %s OR message LIKE %s)")
        like = f"%{search}%"
        params.extend([like, like, like])
    where_sql = " AND ".join(where)

    total = query_one(f"SELECT COUNT(*) AS c FROM testimonials WHERE {where_sql}", tuple(params))["c"]
    offset = (page - 1) * per_page

    rows = query_all(
        f"""SELECT id, client_name, client_role, company, message,
                   avatar_path, rating, status, created_at, updated_at
            FROM testimonials WHERE {where_sql}
            ORDER BY created_at DESC LIMIT %s OFFSET %s""",
        tuple(params) + (per_page, offset),
    )

    return ok(data={
        "items": rows, "page": page, "per_page": per_page,
        "total": total, "total_pages": (total + per_page - 1) // per_page,
    })


@admin_bp.get("/testimonials/<int:tid>")
@login_required
def admin_get_testimonial(tid):
    row = query_one("SELECT * FROM testimonials WHERE id=%s", (tid,))
    if not row:
        return err("Testimonial not found", 404)
    return ok(data=row)


@admin_bp.post("/testimonials")
@login_required
@csrf_protect
def admin_create_testimonial():
    data = request.get_json(silent=True) or {}
    client_name = (data.get("client_name") or "").strip()
    message = (data.get("message") or "").strip()

    if not client_name:
        return err("Client name is required", 400)
    if not message:
        return err("Message is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)
    
    rating = int(data.get("rating") or 5) # ⚡ NEW: Get Rating

    tid, _ = execute(
        """INSERT INTO testimonials
           (client_name, client_role, company, message, avatar_path, rating, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (
            client_name,
            (data.get("client_role") or "").strip() or None,
            (data.get("company") or "").strip() or None,
            message,
            (data.get("avatar_path") or "").strip() or None,
            rating, # ⚡ NEW
            status,
        ),
    )
    _log(request.admin["id"], "create", "testimonial", tid, {"client_name": client_name})
    return ok(data={"id": tid}, message="Testimonial created", status=201)


@admin_bp.put("/testimonials/<int:tid>")
@login_required
@csrf_protect
def admin_update_testimonial(tid):
    existing = query_one("SELECT id FROM testimonials WHERE id=%s", (tid,))
    if not existing:
        return err("Testimonial not found", 404)

    data = request.get_json(silent=True) or {}
    client_name = (data.get("client_name") or "").strip()
    message = (data.get("message") or "").strip()

    if not client_name:
        return err("Client name is required", 400)
    if not message:
        return err("Message is required", 400)

    status = data.get("status") or "draft"
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    rating = int(data.get("rating") or 5) # ⚡ NEW

    execute(
        """UPDATE testimonials SET
             client_name=%s, client_role=%s, company=%s,
             message=%s, avatar_path=%s, rating=%s, status=%s
           WHERE id=%s""",
        (
            client_name,
            (data.get("client_role") or "").strip() or None,
            (data.get("company") or "").strip() or None,
            message,
            (data.get("avatar_path") or "").strip() or None,
            rating, # ⚡ NEW
            status,
            tid,
        ),
    )
    _log(request.admin["id"], "update", "testimonial", tid, {"client_name": client_name})
    return ok(message="Testimonial updated")


@admin_bp.patch("/testimonials/<int:tid>/status")
@login_required
@csrf_protect
def admin_update_testimonial_status(tid):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("draft", "published", "on_hold"):
        return err("Invalid status", 400)

    exists = query_one("SELECT id FROM testimonials WHERE id=%s", (tid,))
    if not exists:
        return err("Testimonial not found", 404)

    execute("UPDATE testimonials SET status=%s WHERE id=%s", (status, tid))
    _log(request.admin["id"], "status_change", "testimonial", tid, {"status": status})
    return ok(message=f"Status changed to {status}")


@admin_bp.delete("/testimonials/<int:tid>")
@login_required
@csrf_protect
def admin_delete_testimonial(tid):
    exists = query_one("SELECT id FROM testimonials WHERE id=%s", (tid,))
    if not exists:
        return err("Testimonial not found", 404)
    execute("DELETE FROM testimonials WHERE id=%s", (tid,))
    _log(request.admin["id"], "delete", "testimonial", tid)
    return ok(message="Testimonial deleted")

# =========================================================
# PAGE CONTENTS EDITOR
# =========================================================
@admin_bp.get("/page-content")
@login_required
def admin_list_page_contents():
    rows = query_all(
        """SELECT id, page_key, section_key, content, updated_at
           FROM page_contents
           ORDER BY page_key, section_key"""
    )
    grouped = {}
    for r in rows:
        c = r["content"]
        if isinstance(c, str):
            try:
                c = json.loads(c)
            except Exception:
                c = {}
        grouped.setdefault(r["page_key"], {})[r["section_key"]] = {
            "id": r["id"],
            "content": c,
            "updated_at": str(r["updated_at"]) if r["updated_at"] else None,
        }
    return ok(data=grouped)


@admin_bp.put("/page-content/<string:page_key>/<string:section_key>")
@login_required
@csrf_protect
def admin_update_page_content(page_key, section_key):
    data = request.get_json(silent=True) or {}
    content = data.get("content")

    if content is None:
        return err("content is required", 400)

    if isinstance(content, dict):
        content_json = json.dumps(content)
    elif isinstance(content, str):
        try:
            json.loads(content)
            content_json = content
        except Exception:
            return err("content must be valid JSON object", 400)
    else:
        return err("content must be an object", 400)

    existing = query_one(
        "SELECT id FROM page_contents WHERE page_key=%s AND section_key=%s",
        (page_key, section_key),
    )

    if existing:
        execute(
            "UPDATE page_contents SET content=%s WHERE id=%s",
            (content_json, existing["id"]),
        )
    else:
        execute(
            """INSERT INTO page_contents (page_key, section_key, content)
               VALUES (%s, %s, %s)""",
            (page_key, section_key, content_json),
        )

    _log(
        request.admin["id"],
        "update_content",
        "page_content",
        None,
        {"page_key": page_key, "section_key": section_key},
    )
    return ok(message=f"{page_key}/{section_key} updated")


# =========================================================
# SITE SETTINGS EDITOR
# =========================================================
@admin_bp.get("/settings")
@login_required
def admin_get_settings():
    row = query_one("SELECT * FROM site_settings WHERE id = 1")
    if not row:
        execute(
            """INSERT INTO site_settings (id, company_name)
               VALUES (1, 'Your Company')
               ON DUPLICATE KEY UPDATE id = 1"""
        )
        row = query_one("SELECT * FROM site_settings WHERE id = 1")
    return ok(data=row or {})


@admin_bp.put("/settings")
@login_required
@csrf_protect
def admin_update_settings():
    data = request.get_json(silent=True) or {}

    company_name = (data.get("company_name") or "").strip()
    if not company_name:
        return err("Company name is required", 400)

    email = (data.get("email") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    address = (data.get("address") or "").strip() or None
    logo_path = (data.get("logo_path") or "").strip() or None
    facebook_url = (data.get("facebook_url") or "").strip() or None
    twitter_url = (data.get("twitter_url") or "").strip() or None
    linkedin_url = (data.get("linkedin_url") or "").strip() or None
    instagram_url = (data.get("instagram_url") or "").strip() or None
    github_url = (data.get("github_url") or "").strip() or None

    execute(
        """INSERT INTO site_settings
           (id, company_name, logo_path, email, phone, address,
            facebook_url, twitter_url, linkedin_url, instagram_url, github_url)
           VALUES (1, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
           ON DUPLICATE KEY UPDATE
             company_name=VALUES(company_name),
             logo_path=VALUES(logo_path),
             email=VALUES(email),
             phone=VALUES(phone),
             address=VALUES(address),
             facebook_url=VALUES(facebook_url),
             twitter_url=VALUES(twitter_url),
             linkedin_url=VALUES(linkedin_url),
             instagram_url=VALUES(instagram_url),
             github_url=VALUES(github_url)""",
        (
            company_name, logo_path, email, phone, address,
            facebook_url, twitter_url, linkedin_url, instagram_url, github_url,
        ),
    )

    _log(request.admin["id"], "update", "settings", 1)
    return ok(message="Settings saved successfully")