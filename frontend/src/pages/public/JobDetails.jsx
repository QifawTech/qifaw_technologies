import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi } from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function JobDetails() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, job: null });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, job: null });
    publicApi
      .getJob(slug)
      .then((r) => !cancelled && setState({ loading: false, error: null, job: r.data.data }))
      .catch((e) => !cancelled && setState({ loading: false, error: e.message, job: null }));
    return () => { cancelled = true; };
  }, [slug]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!resume) errs.resume = "Resume is required";
    else {
      const ext = resume.name.split(".").pop().toLowerCase();
      if (!["pdf", "doc", "docx"].includes(ext)) errs.resume = "Only PDF, DOC, DOCX allowed";
      if (resume.size > 5 * 1024 * 1024) errs.resume = "Max size is 5MB";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("resume", resume);
      const r = await publicApi.applyJob(state.job.id, fd);
      setSuccess(r.data.message || "Application submitted successfully");
      setForm({ name: "", email: "", phone: "" });
      setResume(null);
      setFileName("");
      setErrors({});
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) return <Loader />;
  if (!state.job)
    return (
      <div className="container py-5">
        <ErrorAlert message={state.error || "Job not found"} />
      </div>
    );

  const j = state.job;

  // Type badge logic
  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("internship"))
      return { bg: "rgba(16,185,129,.12)", color: "#059669", icon: "bi-mortarboard" };
    if (t.includes("part"))
      return { bg: "rgba(245,158,11,.14)", color: "#B45309", icon: "bi-clock-history" };
    if (t.includes("contract"))
      return { bg: "rgba(139,92,246,.14)", color: "#6D28D9", icon: "bi-file-earmark-text" };
    return { bg: "rgba(37,99,235,.12)", color: "#1D4ED8", icon: "bi-briefcase" };
  };
  const typeStyle = getTypeStyle(j.employment_type);

  return (
    <section style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div className="container">
        {/* ═══ BREADCRUMB ═══ */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            fontSize: ".82rem",
            color: "var(--muted)",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={{ color: "var(--muted)" }}>Home</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: ".7rem" }} />
          <Link to="/careers" style={{ color: "var(--muted)" }}>Careers</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: ".7rem" }} />
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{j.title}</span>
        </nav>

        <div className="row g-4">
          {/* ═══ LEFT: Job Details ═══ */}
          <div className="col-lg-7">
            {/* Hero card */}
            <div
              style={{
                background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
                borderRadius: 24,
                padding: "2.5rem 2rem",
                marginBottom: "1.75rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(15,23,42,.18)",
              }}
            >
              {/* Decorative glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-80px",
                  right: "-80px",
                  width: 260,
                  height: 260,
                  background:
                    "radial-gradient(circle, rgba(96,165,250,.35), transparent 70%)",
                  filter: "blur(50px)",
                  borderRadius: "50%",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: ".4rem",
                      padding: ".4rem .85rem",
                      background: "rgba(96,165,250,.16)",
                      border: "1px solid rgba(96,165,250,.3)",
                      borderRadius: 999,
                      fontSize: ".72rem",
                      fontWeight: 800,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "#93C5FD",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        background: "#10B981",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px #10B981",
                      }}
                    />
                    Now Hiring
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    margin: "0 0 1.25rem",
                  }}
                >
                  {j.title}
                </h1>

                {/* Meta badges */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: ".6rem",
                  }}
                >
                  {j.employment_type && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                        padding: ".5rem .9rem",
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: 12,
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      <i
                        className={`bi ${typeStyle.icon}`}
                        style={{ color: "#60A5FA" }}
                      />
                      {j.employment_type}
                    </span>
                  )}
                  {j.work_mode && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                        padding: ".5rem .9rem",
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: 12,
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      <i className="bi bi-house-door" style={{ color: "#60A5FA" }} />
                      {j.work_mode}
                    </span>
                  )}
                  {j.location && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                        padding: ".5rem .9rem",
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: 12,
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      <i className="bi bi-geo-alt" style={{ color: "#60A5FA" }} />
                      {j.location}
                    </span>
                  )}
                  {j.department && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                        padding: ".5rem .9rem",
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: 12,
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      <i className="bi bi-diagram-3" style={{ color: "#60A5FA" }} />
                      {j.department}
                    </span>
                  )}
                  {j.deadline && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: ".4rem",
                        padding: ".5rem .9rem",
                        background: "rgba(245,158,11,.14)",
                        border: "1px solid rgba(245,158,11,.3)",
                        borderRadius: 12,
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "#FCD34D",
                      }}
                    >
                      <i className="bi bi-clock-history" />
                      Apply by{" "}
                      {new Date(j.deadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "2rem 1.75rem",
              }}
            >
              {j.eligibility && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      letterSpacing: "-0.01em",
                      margin: "0 0 1rem",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background:
                          "linear-gradient(135deg, rgba(37,99,235,.15), rgba(59,130,246,.06))",
                        color: "var(--accent-h)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".95rem",
                      }}
                    >
                      <i className="bi bi-mortarboard-fill" />
                    </span>
                    Eligibility
                  </h3>
                  <p
                    style={{
                      color: "var(--text-soft)",
                      fontSize: ".95rem",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {j.eligibility}
                  </p>
                </div>
              )}

              {j.skills && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      letterSpacing: "-0.01em",
                      margin: "0 0 1rem",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background:
                          "linear-gradient(135deg, rgba(37,99,235,.15), rgba(59,130,246,.06))",
                        color: "var(--accent-h)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".95rem",
                      }}
                    >
                      <i className="bi bi-lightning-charge-fill" />
                    </span>
                    Required Skills
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: ".5rem",
                    }}
                  >
                    {j.skills.split(",").map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: ".45rem .9rem",
                          background: "var(--bg-alt)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          fontSize: ".82rem",
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {j.description && (
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      letterSpacing: "-0.01em",
                      margin: "0 0 1rem",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background:
                          "linear-gradient(135deg, rgba(37,99,235,.15), rgba(59,130,246,.06))",
                        color: "var(--accent-h)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".95rem",
                      }}
                    >
                      <i className="bi bi-file-text-fill" />
                    </span>
                    Role Description
                  </h3>
                  <p
                    style={{
                      color: "var(--text-soft)",
                      fontSize: ".95rem",
                      lineHeight: 1.75,
                      margin: 0,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {j.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Apply Form ═══ */}
          <div className="col-lg-5">
            <div
  style={{
    position: "sticky",
    top: 110,
    maxHeight: "calc(100vh - 130px)",
    overflowY: "auto",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    padding: "2rem 1.75rem",
    boxShadow: "0 12px 40px rgba(15,23,42,.06)",
    scrollbarWidth: "thin",
  }}
  className="job-apply-sticky"
>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".85rem",
                  marginBottom: "1.75rem",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    boxShadow: "0 10px 26px rgba(37,99,235,.4)",
                    flexShrink: 0,
                  }}
                >
                  <i className="bi bi-send-fill" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      letterSpacing: "-0.015em",
                      margin: "0 0 .2rem",
                    }}
                  >
                    Apply for this role
                  </h3>
                  <p
                    style={{
                      fontSize: ".82rem",
                      color: "var(--muted)",
                      margin: 0,
                    }}
                  >
                    Takes less than 2 minutes
                  </p>
                </div>
              </div>

              {success && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    padding: ".85rem 1rem",
                    background: "rgba(16,185,129,.08)",
                    border: "1px solid rgba(16,185,129,.25)",
                    borderRadius: 12,
                    color: "#059669",
                    fontSize: ".88rem",
                    fontWeight: 600,
                    marginBottom: "1.25rem",
                  }}
                >
                  <i className="bi bi-check-circle-fill" />
                  <div>{success}</div>
                </div>
              )}
              {state.error && !success && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    padding: ".85rem 1rem",
                    background: "rgba(220,38,38,.06)",
                    border: "1px solid rgba(220,38,38,.2)",
                    borderRadius: 12,
                    color: "#991B1B",
                    fontSize: ".88rem",
                    fontWeight: 600,
                    marginBottom: "1.25rem",
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill" />
                  <div>{state.error}</div>
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      fontSize: ".78rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: ".45rem",
                      display: "block",
                    }}
                  >
                    Full Name <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    className="form-control"
                    style={{
                      padding: ".75rem 1rem",
                      borderRadius: 12,
                      border: `1.5px solid ${
                        errors.name ? "#DC2626" : "var(--border)"
                      }`,
                      background: "var(--bg-alt)",
                      fontSize: ".9rem",
                      transition: "border-color .2s ease, box-shadow .2s ease",
                    }}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--accent)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,.1)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.name
                        ? "#DC2626"
                        : "var(--border)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "var(--bg-alt)";
                    }}
                  />
                  {errors.name && (
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "#DC2626",
                        marginTop: ".35rem",
                      }}
                    >
                      {errors.name}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      fontSize: ".78rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: ".45rem",
                      display: "block",
                    }}
                  >
                    Email <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    style={{
                      padding: ".75rem 1rem",
                      borderRadius: 12,
                      border: `1.5px solid ${
                        errors.email ? "#DC2626" : "var(--border)"
                      }`,
                      background: "var(--bg-alt)",
                      fontSize: ".9rem",
                      transition: "border-color .2s ease, box-shadow .2s ease",
                    }}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--accent)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,.1)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.email
                        ? "#DC2626"
                        : "var(--border)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "var(--bg-alt)";
                    }}
                  />
                  {errors.email && (
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "#DC2626",
                        marginTop: ".35rem",
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      fontSize: ".78rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: ".45rem",
                      display: "block",
                    }}
                  >
                    Phone <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    className="form-control"
                    style={{
                      padding: ".75rem 1rem",
                      borderRadius: 12,
                      border: `1.5px solid ${
                        errors.phone ? "#DC2626" : "var(--border)"
                      }`,
                      background: "var(--bg-alt)",
                      fontSize: ".9rem",
                      transition: "border-color .2s ease, box-shadow .2s ease",
                    }}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 00000 00000"
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--accent)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,.1)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.phone
                        ? "#DC2626"
                        : "var(--border)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "var(--bg-alt)";
                    }}
                  />
                  {errors.phone && (
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "#DC2626",
                        marginTop: ".35rem",
                      }}
                    >
                      {errors.phone}
                    </div>
                  )}
                </div>

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
                    Resume <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <div
                    style={{
                      position: "relative",
                      border: `1.5px dashed ${
                        errors.resume ? "#DC2626" : "var(--border)"
                      }`,
                      borderRadius: 12,
                      background: "var(--bg-alt)",
                      padding: "1.25rem",
                      textAlign: "center",
                      transition: "all .25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.background = "rgba(37,99,235,.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = errors.resume
                        ? "#DC2626"
                        : "var(--border)";
                      e.currentTarget.style.background = "var(--bg-alt)";
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        setResume(e.target.files[0] || null);
                        setFileName(e.target.files[0]?.name || "");
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                    <i
                      className="bi bi-cloud-arrow-up-fill"
                      style={{
                        fontSize: "1.75rem",
                        color: "var(--accent)",
                        display: "block",
                        marginBottom: ".5rem",
                      }}
                    />
                    <div
                      style={{
                        fontSize: ".85rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: ".25rem",
                      }}
                    >
                      {fileName || "Click to upload resume"}
                    </div>
                    <div
                      style={{
                        fontSize: ".72rem",
                        color: "var(--muted)",
                      }}
                    >
                      PDF, DOC, DOCX · Max 5MB
                    </div>
                  </div>
                  {errors.resume && (
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "#DC2626",
                        marginTop: ".35rem",
                      }}
                    >
                      {errors.resume}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".6rem",
                    padding: "1rem 2rem",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF",
                    border: 0,
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: ".95rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 30px rgba(37,99,235,.4)",
                    transition:
                      "transform .3s ease, box-shadow .3s ease, opacity .3s ease",
                    opacity: submitting ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 18px 40px rgba(37,99,235,.55)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 30px rgba(37,99,235,.4)";
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <i className="bi bi-arrow-right" />
                    </>
                  )}
                </button>

                <p
                  style={{
                    fontSize: ".72rem",
                    color: "var(--muted)",
                    textAlign: "center",
                    margin: "1rem 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  <i className="bi bi-shield-check me-1" />
                  Your information is safe and confidential.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}