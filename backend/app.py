import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from db import init_pool
from extensions import limiter

# Register blueprints after extension is defined
from routes.public import public_bp
from routes.auth import auth_bp
from routes.admin import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.permanent_session_lifetime = timedelta(
        hours=Config.PERMANENT_SESSION_LIFETIME_HOURS
    )

    CORS(
        app,
        resources={r"/api/*": {"origins": Config.FRONTEND_ORIGINS}},
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-Token"],
        expose_headers=["Content-Disposition"],   # ← ADDED: allow frontend to read filename
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    limiter.init_app(app)
    init_pool()

    os.makedirs(os.path.join(Config.UPLOAD_FOLDER, "media"), exist_ok=True)
    os.makedirs(os.path.join(Config.UPLOAD_FOLDER, "resumes"), exist_ok=True)

    app.register_blueprint(public_bp, url_prefix="/api/v1/public")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")

    @app.get("/api/v1/health")
    def health():
        return jsonify({"success": True, "message": "API is running"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"success": False, "message": "File too large"}), 413

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({
            "success": False,
            "message": "Too many attempts. Please try again later."
        }), 429

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)