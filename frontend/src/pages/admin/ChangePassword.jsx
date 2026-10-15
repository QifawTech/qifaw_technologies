import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [currentEmail, setCurrentEmail] = useState("");

  // ── EMAIL CHANGE STATE ────────────────────────────────
  const [emailForm, setEmailForm] = useState({
    current_password: "",
    new_email: "",
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailSaving, setEmailSaving] = useState(false);
  const [showEmailPwd, setShowEmailPwd] = useState(false);

  // ── PASSWORD CHANGE STATE ─────────────────────────────
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load current admin info
  useEffect(() => {
    api
      .get("/admin/me")
      .then((r) => {
        setCurrentEmail(r.data.data?.admin?.email || "");
      })
      .catch(() => {});
  }, []);

  // ── EMAIL HANDLERS ────────────────────────────────────
  const updateEmail = (key, value) => {
    setEmailForm((f) => ({ ...f, [key]: value }));
    setEmailErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateEmail = () => {
    const errs = {};
    if (!emailForm.current_password)
      errs.current_password = "Password is required";
    if (!emailForm.new_email) errs.new_email = "New email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.new_email))
      errs.new_email = "Enter a valid email address";
    else if (
      emailForm.new_email.toLowerCase() === currentEmail.toLowerCase()
    )
      errs.new_email = "New email is same as current email";
    setEmailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setEmailSaving(true);
    try {
      const r = await api.post("/admin/change-email", emailForm);
      showToast(r.data.message || "Email updated successfully");
      setCurrentEmail(r.data.data.email);
      setEmailForm({ current_password: "", new_email: "" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed";
      if (msg.toLowerCase().includes("password")) {
        setEmailErrors({ current_password: msg });
      } else if (msg.toLowerCase().includes("use")) {
        setEmailErrors({ new_email: msg });
      } else {
        showToast(msg, "danger");
      }
    } finally {
      setEmailSaving(false);
    }
  };

  // ── PASSWORD HANDLERS ─────────────────────────────────
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleShow = (key) =>
    setShowPwd((s) => ({ ...s, [key]: !s[key] }));

  const validate = () => {
    const errs = {};
    if (!form.current_password) errs.current_password = "Current password is required";
    if (!form.new_password) errs.new_password = "New password is required";
    else if (form.new_password.length < 8)
      errs.new_password = "Must be at least 8 characters";
    if (form.new_password !== form.confirm_password)
      errs.confirm_password = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const r = await api.post("/admin/change-password", form);
      showToast(r.data.message || "Password updated successfully");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed";
      if (msg.toLowerCase().includes("current")) {
        setErrors({ current_password: "Current password is incorrect" });
      } else {
        showToast(msg, "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  const pwdStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = pwdStrength(form.new_password);
  const strengthLabel =
    strength <= 2 ? { text: "Weak", color: "#DC2626", width: "33%" }
    : strength <= 3 ? { text: "Fair", color: "#F59E0B", width: "66%" }
    : strength === 4 ? { text: "Good", color: "#10B981", width: "80%" }
    : { text: "Strong", color: "#059669", width: "100%" };

  return (
    <div>
      {toast && (
        <div
          className={"alert alert-" + toast.type + " position-fixed"}
          style={{ top: 80, right: 20, zIndex: 2100, minWidth: 240 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-4">
        <h2 className="mb-1">Security</h2>
        <p style={{ color: "var(--muted)" }} className="mb-0 small">
          Manage your email and password
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          CURRENT ACCOUNT BADGE
      ═══════════════════════════════════════════════ */}
      <div className="card-clean p-3 mb-4 d-flex align-items-center gap-3">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #3B82F6)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1rem",
            flexShrink: 0,
          }}
        >
          {currentEmail.charAt(0).toUpperCase() || "A"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="small" style={{ color: "var(--muted)" }}>
            Current Email
          </div>
          <div
            className="fw-semibold"
            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {currentEmail || "—"}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ═══════════════════════════════════════════════
            LEFT COLUMN — EMAIL + PASSWORD FORMS
        ═══════════════════════════════════════════════ */}
        <div className="col-lg-7">
          {/* ── CHANGE EMAIL ──────────────────────────── */}
          <div className="card-clean p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-soft)",
                  color: "var(--accent-h)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bi bi-envelope-fill" />
              </div>
              <div>
                <h5 className="mb-0">Change Email</h5>
                <p
                  className="mb-0 small"
                  style={{ color: "var(--muted)" }}
                >
                  Update your login email address
                </p>
              </div>
            </div>

            <form onSubmit={onEmailSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  New Email
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <i
                      className="bi bi-envelope-at"
                      style={{ color: "var(--muted)" }}
                    />
                  </span>
                  <input
                    type="email"
                    className={`form-control ${
                      emailErrors.new_email ? "is-invalid" : ""
                    }`}
                    placeholder="new@example.com"
                    value={emailForm.new_email}
                    onChange={(e) =>
                      updateEmail("new_email", e.target.value)
                    }
                    autoComplete="email"
                  />
                  {emailErrors.new_email && (
                    <div className="invalid-feedback d-block">
                      {emailErrors.new_email}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Confirm with Password
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <i className="bi bi-lock" style={{ color: "var(--muted)" }} />
                  </span>
                  <input
                    type={showEmailPwd ? "text" : "password"}
                    className={`form-control ${
                      emailErrors.current_password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your current password"
                    value={emailForm.current_password}
                    onChange={(e) =>
                      updateEmail("current_password", e.target.value)
                    }
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowEmailPwd((v) => !v)}
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                      cursor: "pointer",
                    }}
                    tabIndex={-1}
                  >
                    <i
                      className={`bi ${
                        showEmailPwd ? "bi-eye-slash" : "bi-eye"
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>
                  {emailErrors.current_password && (
                    <div className="invalid-feedback d-block">
                      {emailErrors.current_password}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-lime w-100"
                disabled={emailSaving}
              >
                {emailSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope-check me-1" /> Update Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── CHANGE PASSWORD ───────────────────────── */}
          <div className="card-clean p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-soft)",
                  color: "var(--accent-h)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bi bi-shield-lock-fill" />
              </div>
              <div>
                <h5 className="mb-0">Change Password</h5>
                <p
                  className="mb-0 small"
                  style={{ color: "var(--muted)" }}
                >
                  Update your login password
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} noValidate>
              {/* Current */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Current Password
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <i className="bi bi-lock" style={{ color: "var(--muted)" }} />
                  </span>
                  <input
                    type={showPwd.current ? "text" : "password"}
                    className={`form-control ${
                      errors.current_password ? "is-invalid" : ""
                    }`}
                    value={form.current_password}
                    onChange={(e) =>
                      update("current_password", e.target.value)
                    }
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => toggleShow("current")}
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                      cursor: "pointer",
                    }}
                    tabIndex={-1}
                  >
                    <i
                      className={`bi ${
                        showPwd.current ? "bi-eye-slash" : "bi-eye"
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>
                  {errors.current_password && (
                    <div className="invalid-feedback d-block">
                      {errors.current_password}
                    </div>
                  )}
                </div>
              </div>

              {/* New */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  New Password
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <i
                      className="bi bi-shield-lock"
                      style={{ color: "var(--muted)" }}
                    />
                  </span>
                  <input
                    type={showPwd.new ? "text" : "password"}
                    className={`form-control ${
                      errors.new_password ? "is-invalid" : ""
                    }`}
                    value={form.new_password}
                    onChange={(e) => update("new_password", e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => toggleShow("new")}
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                      cursor: "pointer",
                    }}
                    tabIndex={-1}
                  >
                    <i
                      className={`bi ${
                        showPwd.new ? "bi-eye-slash" : "bi-eye"
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>
                  {errors.new_password && (
                    <div className="invalid-feedback d-block">
                      {errors.new_password}
                    </div>
                  )}
                </div>

                {form.new_password && (
                  <div className="mt-2">
                    <div
                      style={{
                        height: 4,
                        background: "var(--border)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: strengthLabel.width,
                          background: strengthLabel.color,
                          transition: "all .3s ease",
                        }}
                      />
                    </div>
                    <div
                      className="small mt-1"
                      style={{ color: strengthLabel.color, fontWeight: 600 }}
                    >
                      {strengthLabel.text}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="mb-4">
                <label className="form-label small fw-semibold">
                  Confirm New Password
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <i
                      className="bi bi-shield-check"
                      style={{ color: "var(--muted)" }}
                    />
                  </span>
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    className={`form-control ${
                      errors.confirm_password ? "is-invalid" : ""
                    }`}
                    value={form.confirm_password}
                    onChange={(e) =>
                      update("confirm_password", e.target.value)
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => toggleShow("confirm")}
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border)",
                      cursor: "pointer",
                    }}
                    tabIndex={-1}
                  >
                    <i
                      className={`bi ${
                        showPwd.confirm ? "bi-eye-slash" : "bi-eye"
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>
                  {errors.confirm_password && (
                    <div className="invalid-feedback d-block">
                      {errors.confirm_password}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-lime w-100"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RIGHT COLUMN — SECURITY TIPS
        ═══════════════════════════════════════════════ */}
        <div className="col-lg-5">
          <div className="card-clean p-4 h-100">
            <h5 className="mb-3">
              <i
                className="bi bi-shield-check me-2"
                style={{ color: "var(--accent)" }}
              />
              Security Tips
            </h5>
            <ul
              className="list-unstyled mb-0"
              style={{ fontSize: ".88rem", lineHeight: 1.9 }}
            >
              <li>
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ color: "#10B981" }}
                />
                Use at least 12 characters for maximum security
              </li>
              <li>
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ color: "#10B981" }}
                />
                Mix uppercase, lowercase, numbers and symbols
              </li>
              <li>
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ color: "#10B981" }}
                />
                Use a unique email you check often
              </li>
              <li>
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ color: "#10B981" }}
                />
                Change your password every 3-6 months
              </li>
              <li>
                <i
                  className="bi bi-x-circle-fill me-2"
                  style={{ color: "#DC2626" }}
                />
                Never share your password with anyone
              </li>
              <li>
                <i
                  className="bi bi-x-circle-fill me-2"
                  style={{ color: "#DC2626" }}
                />
                Avoid common words like "password", "admin", "12345678"
              </li>
            </ul>

            <hr className="my-4" />

            <div className="small" style={{ color: "var(--muted)" }}>
              <i className="bi bi-info-circle me-1" />
              All changes require your current password to confirm.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}