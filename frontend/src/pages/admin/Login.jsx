import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email.trim() || !form.password) {
      setError("Email and password required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/admin/login", {
        email: form.email.trim(),
        password: form.password,
      });
      const csrf = res.data?.data?.csrf_token;
      if (csrf) sessionStorage.setItem("csrf_token", csrf);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1D4ED8 100%)",
        padding: "1.5rem",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          top: -200,
          left: -150,
          background: "radial-gradient(circle, rgba(96,165,250,.25), transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          bottom: -150,
          right: -100,
          background: "radial-gradient(circle, rgba(59,130,246,.22), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="card-clean p-4 p-md-5"
        style={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 2,
          background: "rgba(255,255,255,.98)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                color: "#FFFFFF",
                padding: "6px 14px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: ".9rem",
                letterSpacing: ".04em",
              }}
            >
              YOUR
            </span>
            <span className="fw-bold" style={{ fontSize: "1.05rem", color: "#0F172A" }}>
              COMPANY
            </span>
          </div>
          <h3 className="mb-1" style={{ fontWeight: 800 }}>Admin Login</h3>
          <p style={{ color: "#64748B", fontSize: ".9rem", margin: 0 }}>
            Sign in to manage your website
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                <i className="bi bi-envelope" style={{ color: "#64748B" }} />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                <i className="bi bi-lock" style={{ color: "#64748B" }} />
              </span>
              <input
                type={showPwd ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-group-text"
                onClick={() => setShowPwd((v) => !v)}
                style={{ background: "#F8FAFC", borderColor: "#E2E8F0", cursor: "pointer" }}
                tabIndex={-1}
              >
                <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#64748B" }} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-lime w-100"
            disabled={loading}
            style={{ padding: ".75rem" }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <i className="bi bi-arrow-right ms-1" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="small" style={{ color: "#64748B", textDecoration: "none" }}>
            <i className="bi bi-arrow-left me-1" /> Back to website
          </a>
        </div>
      </div>
    </div>
  );
}