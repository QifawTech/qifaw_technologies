import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // ⚡ NEW: Import pannirukken
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import Reveal from "../../components/Reveal.jsx";

export default function MissionVision() {
  const location = useLocation(); // ⚡ NEW: Location track pandrom

  const [state, setState] = useState({ loading: true, error: null });
  const [forms, setForms] = useState({
    mission: { title: "", body: "" },
    vision: { title: "", body: "" },
  });
  const [original, setOriginal] = useState({
    mission: { title: "", body: "" },
    vision: { title: "", body: "" },
  });
  const [saving, setSaving] = useState({ mission: false, vision: false });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load current content
  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/page-content")
      .then((r) => {
        if (cancelled) return;
        const about = r.data.data?.about || {};
        const missionContent = about.mission?.content || {};
        const visionContent = about.vision?.content || {};

        const mission = {
          title: missionContent.title || "Our Mission",
          body: missionContent.body || "",
        };
        const vision = {
          title: visionContent.title || "Our Vision",
          body: visionContent.body || "",
        };

        setForms({ mission, vision });
        setOriginal({ mission, vision });
        setState({ loading: false, error: null });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ loading: false, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ⚡ NEW: Page change aagumbothu form-ah reset pannum (Unsaved changes poidum)
  useEffect(() => {
    setForms(original);
  }, [location.pathname, original]);

  const updateField = (section, key, value) => {
    setForms((f) => ({
      ...f,
      [section]: { ...f[section], [key]: value },
    }));
  };

  const isDirty = (section) =>
    JSON.stringify(forms[section]) !== JSON.stringify(original[section]);

  const save = async (section) => {
    if (!forms[section].title.trim()) {
      showToast("Title is required", "danger");
      return;
    }
    if (!forms[section].body.trim()) {
      showToast("Body content is required", "danger");
      return;
    }

    setSaving((s) => ({ ...s, [section]: true }));
    try {
      await api.put(`/admin/page-content/about/${section}`, {
        content: forms[section],
      });
      showToast(
        `${section.charAt(0).toUpperCase() + section.slice(1)} saved successfully`
      );
      setOriginal((o) => ({ ...o, [section]: { ...forms[section] } }));
    } catch (e) {
      showToast(
        e.response?.data?.message || e.message || "Failed to save",
        "danger"
      );
    } finally {
      setSaving((s) => ({ ...s, [section]: false }));
    }
  };

  const discard = (section) => {
    setForms((f) => ({ ...f, [section]: { ...original[section] } }));
  };

  if (state.loading) return <Loader label="Loading..." />;

  const cards = [
    {
      key: "mission",
      label: "Mission",
      icon: "bi-bullseye",
      color: "#2563EB",
      gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
      desc: "Define your company's purpose and what drives you every day.",
    },
    {
      key: "vision",
      label: "Vision",
      icon: "bi-eye-fill",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
      desc: "Describe the future you want to create with your business.",
    },
  ];

  return (
    <div>
      {toast && (
        <div
          className={"alert alert-" + toast.type + " position-fixed"}
          style={{ top: 80, right: 20, zIndex: 2100, minWidth: 260 }}
        >
          <i
            className={`bi ${
              toast.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-triangle-fill"
            } me-2`}
          />
          {toast.msg}
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="mb-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".85rem",
            marginBottom: ".5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              boxShadow: "0 10px 26px rgba(37,99,235,.35)",
            }}
          >
            <i className="bi bi-compass" />
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                margin: 0,
                color: "var(--text)",
              }}
            >
              Mission &amp; Vision
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: ".88rem",
                margin: 0,
              }}
            >
              Define your company's purpose and future direction
            </p>
          </div>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      {/* ═══ TWO COLUMN LAYOUT ═══ */}
      <div className="row g-4">
        {cards.map((card) => {
          const dirty = isDirty(card.key);
          const savingNow = saving[card.key];

          return (
            <div className="col-lg-6" key={card.key}>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "1.75rem",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: "absolute",
                    top: "-60px",
                    right: "-60px",
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle, ${card.color}25, transparent 70%)`,
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                />

                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".85rem",
                    marginBottom: "1.5rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.gradient,
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.15rem",
                      boxShadow: `0 8px 20px ${card.color}40`,
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${card.icon}`} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: "var(--text)",
                        letterSpacing: "-0.015em",
                        margin: 0,
                      }}
                    >
                      {card.label}
                    </h3>
                    <p
                      style={{
                        fontSize: ".78rem",
                        color: "var(--muted)",
                        margin: 0,
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Title */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      style={{
                        fontSize: ".78rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: ".45rem",
                        display: "block",
                      }}
                    >
                      Title <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      className="form-control"
                      style={{
                        padding: ".75rem 1rem",
                        borderRadius: 12,
                        border: "1.5px solid var(--border)",
                        background: "var(--bg-alt)",
                        fontSize: ".9rem",
                        fontWeight: 600,
                        transition: "border-color .2s ease, box-shadow .2s ease",
                      }}
                      value={forms[card.key].title}
                      onChange={(e) =>
                        updateField(card.key, "title", e.target.value)
                      }
                      placeholder={`Our ${card.label}`}
                      onFocus={(e) => {
                        e.target.style.borderColor = card.color;
                        e.target.style.boxShadow = `0 0 0 4px ${card.color}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {/* Body */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        fontSize: ".78rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: ".45rem",
                        display: "block",
                      }}
                    >
                      Description <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <textarea
                      rows={5}
                      className="form-control"
                      style={{
                        padding: ".75rem 1rem",
                        borderRadius: 12,
                        border: "1.5px solid var(--border)",
                        background: "var(--bg-alt)",
                        fontSize: ".9rem",
                        resize: "vertical",
                        lineHeight: 1.65,
                        transition: "border-color .2s ease, box-shadow .2s ease",
                      }}
                      value={forms[card.key].body}
                      onChange={(e) =>
                        updateField(card.key, "body", e.target.value)
                      }
                      placeholder={`Write your ${card.label.toLowerCase()} statement here...`}
                      onFocus={(e) => {
                        e.target.style.borderColor = card.color;
                        e.target.style.boxShadow = `0 0 0 4px ${card.color}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div
                      style={{
                        fontSize: ".72rem",
                        color: "var(--muted)",
                        marginTop: ".35rem",
                        textAlign: "right",
                      }}
                    >
                      {forms[card.key].body.length} characters
                    </div>
                  </div>

                  {/* Action row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: ".75rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: dirty ? "#D97706" : "#059669",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".35rem",
                      }}
                    >
                      {dirty ? (
                        <>
                          <i
                            className="bi bi-circle-fill"
                            style={{ fontSize: 6 }}
                          />
                          Unsaved changes
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill" />
                          Saved
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: ".5rem" }}>
                      {dirty && (
                        <button
                          className="btn btn-dark-ghost btn-sm"
                          onClick={() => discard(card.key)}
                        >
                          Discard
                        </button>
                      )}
                      <button
                        className="btn btn-lime btn-sm"
                        onClick={() => save(card.key)}
                        disabled={savingNow || !dirty}
                        style={{
                          background: dirty ? card.gradient : undefined,
                          opacity: !dirty ? 0.5 : 1,
                        }}
                      >
                        {savingNow ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ INFO BOX ═══ */}
      <div
        className="mt-4"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: ".75rem",
          padding: "1.15rem 1.25rem",
          background: "var(--bg-alt)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        <i
          className="bi bi-info-circle-fill"
          style={{ color: "var(--accent)", fontSize: "1.15rem", marginTop: 2 }}
        />
        <div style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>Mission and Vision</strong>{" "}
          are displayed on the <strong>About section</strong> of the home page.
          Changes save immediately and appear on the public site within seconds.
        </div>
      </div>
    </div>
  );
}