import { useEffect, useState } from "react";
import { publicApi } from "../../api/client.js";
import SectionHeading from "../../components/SectionHeading.jsx";
import Reveal from "../../components/Reveal.jsx";

export default function Contact() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    publicApi
      .getSettings()
      .then((r) => setSettings(r.data.data || {}))
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email is required";
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone))
      errs.phone = "Invalid phone number";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim() || form.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const r = await publicApi.createEnquiry(form);
      setSuccess(r.data.message || "Message sent successfully");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="section"
      style={{
        background: "var(--bg-alt)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "-200px",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(96,165,250,.14), transparent 70%)",
          filter: "blur(60px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div className="container position-relative" style={{ paddingTop: "2rem" }}>
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description="Have a project in mind? Send us a message and we'll get back within 24 hours."
            center
          />
        </Reveal>

        <div className="row g-4 align-items-stretch">
          {/* ═══ LEFT: Contact Info Panel ═══ */}
          <div className="col-lg-5">
            <Reveal>
              <div
                style={{
                  background:
                    "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
                  borderRadius: 24,
                  padding: "2.5rem 2rem",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(15,23,42,.18)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-80px",
                    width: 220,
                    height: 220,
                    background:
                      "radial-gradient(circle, rgba(96,165,250,.35), transparent 70%)",
                    filter: "blur(40px)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: ".5rem",
                      padding: ".4rem .85rem",
                      background: "rgba(96,165,250,.14)",
                      border: "1px solid rgba(96,165,250,.28)",
                      borderRadius: 999,
                      marginBottom: "1.75rem",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        background: "#60A5FA",
                        borderRadius: "50%",
                        boxShadow: "0 0 12px #60A5FA",
                      }}
                    />
                    <span
                      style={{
                        fontSize: ".72rem",
                        fontWeight: 700,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        color: "#93C5FD",
                      }}
                    >
                      Contact Info
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.65rem",
                      fontWeight: 900,
                      color: "#FFFFFF",
                      letterSpacing: "-0.025em",
                      lineHeight: 1.25,
                      margin: "0 0 .65rem",
                    }}
                  >
                    Let's start a <br />
                    conversation.
                  </h3>

                  <p
                    style={{
                      color: "#94A3B8",
                      fontSize: ".92rem",
                      lineHeight: 1.7,
                      margin: "0 0 2rem",
                    }}
                  >
                    Reach out via any channel below. We typically respond
                    within 24 hours.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {settings.email && (
                      <a
                        href={`mailto:${settings.email}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          background: "rgba(255,255,255,.04)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 14,
                          textDecoration: "none",
                          transition: "all .3s ease",
                          color: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(96,165,250,.12)";
                          e.currentTarget.style.borderColor =
                            "rgba(96,165,250,.4)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,.04)";
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,.08)";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background:
                              "linear-gradient(135deg, #2563EB, #3B82F6)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.15rem",
                            flexShrink: 0,
                            boxShadow: "0 8px 20px rgba(37,99,235,.4)",
                          }}
                        >
                          <i className="bi bi-envelope-fill" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: ".72rem",
                              color: "#94A3B8",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: ".08em",
                              marginBottom: 3,
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              color: "#FFFFFF",
                              fontWeight: 700,
                              fontSize: ".9rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {settings.email}
                          </div>
                        </div>
                      </a>
                    )}

                    {settings.phone && (
                      <a
                        href={`tel:${settings.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          background: "rgba(255,255,255,.04)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 14,
                          textDecoration: "none",
                          transition: "all .3s ease",
                          color: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(96,165,250,.12)";
                          e.currentTarget.style.borderColor =
                            "rgba(96,165,250,.4)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,.04)";
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,.08)";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background:
                              "linear-gradient(135deg, #2563EB, #3B82F6)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.15rem",
                            flexShrink: 0,
                            boxShadow: "0 8px 20px rgba(37,99,235,.4)",
                          }}
                        >
                          <i className="bi bi-telephone-fill" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: ".72rem",
                              color: "#94A3B8",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: ".08em",
                              marginBottom: 3,
                            }}
                          >
                            Phone
                          </div>
                          <div
                            style={{
                              color: "#FFFFFF",
                              fontWeight: 700,
                              fontSize: ".9rem",
                            }}
                          >
                            {settings.phone}
                          </div>
                        </div>
                      </a>
                    )}

                    {settings.address && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                          padding: "1rem",
                          background: "rgba(255,255,255,.04)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background:
                              "linear-gradient(135deg, #2563EB, #3B82F6)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.15rem",
                            flexShrink: 0,
                            boxShadow: "0 8px 20px rgba(37,99,235,.4)",
                          }}
                        >
                          <i className="bi bi-geo-alt-fill" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: ".72rem",
                              color: "#94A3B8",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: ".08em",
                              marginBottom: 3,
                            }}
                          >
                            Address
                          </div>
                          <div
                            style={{
                              color: "#FFFFFF",
                              fontWeight: 600,
                              fontSize: ".85rem",
                              lineHeight: 1.55,
                            }}
                          >
                            {settings.address}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div style={{ marginTop: "2rem" }}>
                    <div
                      style={{
                        fontSize: ".72rem",
                        color: "#94A3B8",
                        fontWeight: 700,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        marginBottom: ".85rem",
                      }}
                    >
                      Follow Us
                    </div>
                    <div style={{ display: "flex", gap: ".55rem", flexWrap: "wrap" }}>
                      {[
                        {
                          url: settings.linkedin_url,
                          icon: "bi-linkedin",
                        },
                        {
                          url: settings.twitter_url,
                          icon: "bi-twitter-x",
                        },
                        {
                          url: settings.facebook_url,
                          icon: "bi-facebook",
                        },
                        {
                          url: settings.instagram_url,
                          icon: "bi-instagram",
                        },
                        {
                          url: settings.github_url,
                          icon: "bi-github",
                        },
                      ]
                        .filter((s) => s.url)
                        .map((s, i) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: "rgba(255,255,255,.06)",
                              border: "1px solid rgba(255,255,255,.1)",
                              color: "#CBD5E1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1rem",
                              textDecoration: "none",
                              transition: "all .3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(135deg, #2563EB, #3B82F6)";
                              e.currentTarget.style.color = "#FFFFFF";
                              e.currentTarget.style.borderColor = "transparent";
                              e.currentTarget.style.transform =
                                "translateY(-3px)";
                              e.currentTarget.style.boxShadow =
                                "0 10px 24px rgba(37,99,235,.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,.06)";
                              e.currentTarget.style.color = "#CBD5E1";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,.1)";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <i className={`bi ${s.icon}`} />
                          </a>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ═══ RIGHT: Contact Form ═══ */}
          <div className="col-lg-7">
            <Reveal delay={150}>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 24,
                  padding: "2.5rem 2rem",
                  height: "100%",
                  boxShadow: "0 12px 40px rgba(15,23,42,.06)",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    margin: "0 0 .35rem",
                  }}
                >
                  Send us a message
                </h4>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: ".88rem",
                    margin: "0 0 1.75rem",
                  }}
                >
                  Fill out the form and we'll get back to you shortly.
                </p>

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

                {formError && (
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
                    <div>{formError}</div>
                  </div>
                )}

                <form onSubmit={onSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        style={{
                          fontSize: ".78rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          marginBottom: ".45rem",
                          display: "block",
                        }}
                      >
                        Name <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        style={{
                          padding: ".75rem 1rem",
                          borderRadius: 12,
                          border: "1.5px solid var(--border)",
                          background: "var(--bg-alt)",
                          fontSize: ".9rem",
                          transition: "border-color .2s ease, box-shadow .2s ease",
                        }}
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="John Doe"
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--accent)";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,.1)";
                          e.target.style.background = "var(--surface)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
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

                    <div className="col-md-6">
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
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        style={{
                          padding: ".75rem 1rem",
                          borderRadius: 12,
                          border: "1.5px solid var(--border)",
                          background: "var(--bg-alt)",
                          fontSize: ".9rem",
                          transition: "border-color .2s ease, box-shadow .2s ease",
                        }}
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="you@company.com"
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--accent)";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,.1)";
                          e.target.style.background = "var(--surface)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
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

                    <div className="col-md-6">
                      <label
                        style={{
                          fontSize: ".78rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          marginBottom: ".45rem",
                          display: "block",
                        }}
                      >
                        Phone{" "}
                        <span style={{ color: "var(--muted)", fontWeight: 500 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        style={{
                          padding: ".75rem 1rem",
                          borderRadius: 12,
                          border: "1.5px solid var(--border)",
                          background: "var(--bg-alt)",
                          fontSize: ".9rem",
                          transition: "border-color .2s ease, box-shadow .2s ease",
                        }}
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="+91 00000 00000"
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--accent)";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,.1)";
                          e.target.style.background = "var(--surface)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
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

                    <div className="col-md-6">
                      <label
                        style={{
                          fontSize: ".78rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          marginBottom: ".45rem",
                          display: "block",
                        }}
                      >
                        Subject <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input
                        className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                        style={{
                          padding: ".75rem 1rem",
                          borderRadius: 12,
                          border: "1.5px solid var(--border)",
                          background: "var(--bg-alt)",
                          fontSize: ".9rem",
                          transition: "border-color .2s ease, box-shadow .2s ease",
                        }}
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        placeholder="How can we help?"
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--accent)";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,.1)";
                          e.target.style.background = "var(--surface)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "var(--bg-alt)";
                        }}
                      />
                      {errors.subject && (
                        <div
                          style={{
                            fontSize: ".78rem",
                            color: "#DC2626",
                            marginTop: ".35rem",
                          }}
                        >
                          {errors.subject}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label
                        style={{
                          fontSize: ".78rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          marginBottom: ".45rem",
                          display: "block",
                        }}
                      >
                        Message <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <textarea
                        rows={5}
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        style={{
                          padding: ".75rem 1rem",
                          borderRadius: 12,
                          border: "1.5px solid var(--border)",
                          background: "var(--bg-alt)",
                          fontSize: ".9rem",
                          resize: "vertical",
                          transition: "border-color .2s ease, box-shadow .2s ease",
                        }}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Tell us about your project..."
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--accent)";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,.1)";
                          e.target.style.background = "var(--surface)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "var(--bg-alt)";
                        }}
                      />
                      {errors.message && (
                        <div
                          style={{
                            fontSize: ".78rem",
                            color: "#DC2626",
                            marginTop: ".35rem",
                          }}
                        >
                          {errors.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12 mt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".6rem",
                          padding: ".85rem 2rem",
                          background:
                            "linear-gradient(135deg, #2563EB, #3B82F6)",
                          color: "#FFFFFF",
                          border: 0,
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: ".92rem",
                          cursor: submitting ? "not-allowed" : "pointer",
                          boxShadow: "0 10px 30px rgba(37,99,235,.35)",
                          transition:
                            "transform .3s ease, box-shadow .3s ease, opacity .3s ease",
                          opacity: submitting ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting) {
                            e.currentTarget.style.transform =
                              "translateY(-3px)";
                            e.currentTarget.style.boxShadow =
                              "0 18px 40px rgba(37,99,235,.5)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 10px 30px rgba(37,99,235,.35)";
                        }}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <i className="bi bi-send-fill" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}