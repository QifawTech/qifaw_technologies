import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

// ─── Section schemas ──────────────────────────────
const SCHEMAS = {
  home: {
    label: "Home Page",
    icon: "bi-house",
    sections: {
      hero: {
        label: "Hero Section",
        fields: [
          { key: "headline", label: "Headline", type: "text" },
          { key: "subheadline", label: "Subheadline", type: "textarea" },
          { key: "cta_primary_text", label: "Primary Button Text", type: "text" },
          { key: "cta_primary_link", label: "Primary Button Link", type: "text" },
          { key: "cta_secondary_text", label: "Secondary Button Text", type: "text" },
          { key: "cta_secondary_link", label: "Secondary Button Link", type: "text" },
        ],
      },
      intro: {
        label: "About Intro",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
        ],
      },
      cta: {
        label: "Bottom CTA",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "button_text", label: "Button Text", type: "text" },
          { key: "button_link", label: "Button Link", type: "text" },
        ],
      },
    },
  },
  about: {
  label: "About Page",
  icon: "bi-info-circle",
  sections: {
    story: {
      label: "Company Story",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Story Text", type: "textarea" },
      ],
    },
    mission: {
      label: "Mission",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Mission Statement", type: "textarea" },
      ],
    },
    vision: {
      label: "Vision",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Vision Statement", type: "textarea" },
      ],
    },
  },
},
  footer: {
    label: "Footer",
    icon: "bi-layout-text-window-reverse",
    sections: {
      about: {
        label: "Footer About Text",
        fields: [{ key: "text", label: "About Text", type: "textarea" }],
      },
    },
  },
};

export default function AdminContent() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: {}, // { home: { hero: { content: {...}, id }, ... }, ... }
  });
  const [active, setActive] = useState({ page: "home", section: "hero" });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await api.get("/admin/page-content");
      setState({ loading: false, error: null, data: r.data.data || {} });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load form when active section changes
  useEffect(() => {
    const secData =
      state.data?.[active.page]?.[active.section]?.content || {};
    setForm({ ...secData });
    setDirty(false);
  }, [active, state.data]);

  const schema = SCHEMAS[active.page]?.sections?.[active.section];

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(
        `/admin/page-content/${active.page}/${active.section}`,
        { content: form }
      );
      showToast("Content saved");
      setDirty(false);
      await load();
    } catch (e) {
      showToast(e.response?.data?.message || e.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    const secData =
      state.data?.[active.page]?.[active.section]?.content || {};
    setForm({ ...secData });
    setDirty(false);
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
          <h2 className="mb-1">Website Content</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            Edit text content shown on the public website
          </p>
        </div>
        <div className="d-flex gap-2">
          {dirty && (
            <button className="btn btn-dark-ghost" onClick={discard}>
              Discard
            </button>
          )}
          <button
            className="btn btn-lime"
            onClick={save}
            disabled={saving || !dirty}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      <div className="row g-4">
        {/* Sidebar — Page + Section picker */}
        <div className="col-lg-4">
          <div className="card-clean p-3">
            {Object.entries(SCHEMAS).map(([pageKey, page]) => (
              <div key={pageKey} className="mb-3">
                <div
                  className="d-flex align-items-center gap-2 fw-semibold mb-2 small text-uppercase"
                  style={{
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                    fontSize: ".72rem",
                  }}
                >
                  <i className={`bi ${page.icon}`} />
                  {page.label}
                </div>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                  {Object.entries(page.sections).map(([secKey, sec]) => {
                    const isActive =
                      active.page === pageKey && active.section === secKey;
                    return (
                      <li key={secKey}>
                        <button
                          className="btn w-100 text-start"
                          style={{
                            background: isActive
                              ? "var(--accent-soft)"
                              : "transparent",
                            color: isActive
                              ? "var(--accent-h)"
                              : "var(--text)",
                            fontWeight: isActive ? 700 : 500,
                            padding: ".55rem .75rem",
                            borderRadius: 10,
                            fontSize: ".88rem",
                            border: 0,
                          }}
                          onClick={() =>
                            setActive({ page: pageKey, section: secKey })
                          }
                        >
                          {sec.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="col-lg-8">
          <div className="card-clean p-4">
            <h5 className="mb-1">{schema?.label || "Section"}</h5>
            <p
              style={{ color: "var(--muted)", fontSize: ".8rem" }}
              className="mb-4"
            >
              {active.page} / {active.section}
            </p>

            <div className="row g-3">
              {schema?.fields.map((f) => (
                <div className="col-12" key={f.key}>
                  <label className="form-label small fw-semibold">
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form[f.key] || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={form[f.key] || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className="mt-4 pt-3 d-flex align-items-center justify-content-between"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="small" style={{ color: "var(--muted)" }}>
                {dirty ? (
                  <span style={{ color: "#D97706" }}>
                    <i className="bi bi-circle-fill me-1" style={{ fontSize: 6 }} />
                    Unsaved changes
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-check-circle me-1" />
                    All changes saved
                  </span>
                )}
              </div>
              <button
                className="btn btn-lime"
                onClick={save}
                disabled={saving || !dirty}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}