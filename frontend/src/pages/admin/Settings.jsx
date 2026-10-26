import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import ImageUpload from "../../components/admin/ImageUpload.jsx";

const EMPTY = {
  company_name: "",
  logo_path: "",
  email: "",
  phone: "",
  address: "",
  facebook_url: "",
  twitter_url: "",
  linkedin_url: "",
  instagram_url: "",
  github_url: "",
};

export default function AdminSettings() {
  const [state, setState] = useState({
    loading: true,
    error: null,
  });
  const [form, setForm] = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setState({ loading: true, error: null });
    try {
      const r = await api.get("/admin/settings");
      const d = r.data.data || {};
      const clean = { ...EMPTY };
      Object.keys(EMPTY).forEach((k) => {
        clean[k] = d[k] || "";
      });
      setForm(clean);
      setOriginal(clean);
      setState({ loading: false, error: null });
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const save = async () => {
    if (!form.company_name.trim()) {
      showToast("Company name is required", "danger");
      return;
    }
    setSaving(true);
    try {
      await api.put("/admin/settings", form);
      showToast("Settings saved");
      setOriginal(form);
    } catch (e) {
      showToast(e.response?.data?.message || e.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setForm(original);
  };

  if (state.loading) return <Loader />;

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

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Settings</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            Company information used across the website
          </p>
        </div>
        <div className="d-flex gap-2">
          {isDirty && (
            <button className="btn btn-dark-ghost" onClick={discard}>
              Discard
            </button>
          )}
          <button
            className="btn btn-lime"
            onClick={save}
            disabled={saving || !isDirty}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      <div className="row g-4">
        {/* Left column — Company Basics */}
        <div className="col-lg-8">
          <div className="card-clean p-4 mb-4">
            <h5 className="mb-3">Company Information</h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Company Name *
                </label>
                <input
                  className="form-control"
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone</label>
                <input
                  className="form-control"
                  placeholder="+91 00000 00000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">Address</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Street, City, State, Country"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card-clean p-4">
            <h5 className="mb-3">Social Links</h5>
            <div className="row g-3">
              {[
                {
                  key: "linkedin_url",
                  label: "LinkedIn",
                  icon: "bi-linkedin",
                  placeholder: "https://linkedin.com/company/...",
                },
                {
                  key: "twitter_url",
                  label: "Twitter / X",
                  icon: "bi-twitter-x",
                  placeholder: "https://twitter.com/...",
                },
                {
                  key: "facebook_url",
                  label: "Facebook",
                  icon: "bi-facebook",
                  placeholder: "https://facebook.com/...",
                },
                {
                  key: "instagram_url",
                  label: "Instagram",
                  icon: "bi-instagram",
                  placeholder: "https://instagram.com/...",
                },
                {
                  key: "github_url",
                  label: "GitHub",
                  icon: "bi-github",
                  placeholder: "https://github.com/...",
                },
              ].map((s) => (
                <div className="col-md-6" key={s.key}>
                  <label className="form-label small fw-semibold">
                    <i className={`bi ${s.icon} me-1`} />
                    {s.label}
                  </label>
                  <input
                    className="form-control"
                    placeholder={s.placeholder}
                    value={form[s.key]}
                    onChange={(e) => update(s.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ Right column — Logo (Mobile Alignment Fixed) */}
        <div className="col-lg-4">
          <div className="card-clean p-3 p-md-4">
            <h5 className="mb-3">Company Logo</h5>
            
            {/* ImageUpload-ah oru neat white box kulla vachirukken */}
            <div 
              style={{ 
                background: "var(--bg-alt)", 
                borderRadius: 12, 
                padding: "1rem", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                overflow: "hidden"
              }}
            >
              <ImageUpload
                label=""
                value={form.logo_path}
                onChange={(path) => update("logo_path", path)}
              />
            </div>
            
            <div
              className="small mt-3"
              style={{ color: "var(--muted)", fontSize: ".75rem", textAlign: "center" }}
            >
              <i className="bi bi-info-circle me-1" />
              SVG or PNG, 200×50px (Transparent)
            </div>
          </div>

          {/* Preview Card */}
          <div className="card-clean p-3 p-md-4 mt-4">
            <h6 className="mb-3">Preview</h6>
            <div
              style={{
                background: "var(--bg-alt)",
                borderRadius: 12,
                padding: "2rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 100,
                width: "100%",
                overflow: "hidden"
              }}
            >
              {form.logo_path ? (
                <img
                  src={`${api.defaults.baseURL}/public/media/${form.logo_path.replace(/^media\//, "")}`}
                  alt="Logo preview"
                  style={{ maxWidth: "100%", maxHeight: 60, objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: ".9rem",
                    textAlign: "center",
                    wordBreak: "break-word"
                  }}
                >
                  {form.company_name || "YOUR COMPANY"}
                </div>
              )}
            </div>
            <div
              className="small mt-3 text-center fw-semibold"
              style={{ color: "var(--text)" }}
            >
              {form.company_name || "Company Name"}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div
        className="d-flex justify-content-end mt-4"
        style={{ position: "sticky", bottom: 20 }}
      >
        {isDirty && (
          <div
            className="card-clean d-flex align-items-center gap-3 p-3"
            style={{ boxShadow: "0 10px 40px rgba(0,0,0,.15)" }}
          >
            <span
              className="small"
              style={{ color: "#D97706", whiteSpace: "nowrap" }}
            >
              <i className="bi bi-circle-fill me-1" style={{ fontSize: 6 }} />
              Unsaved changes
            </span>
            <button className="btn btn-dark-ghost btn-sm" onClick={discard}>
              Discard
            </button>
            <button
              className="btn btn-lime btn-sm"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}