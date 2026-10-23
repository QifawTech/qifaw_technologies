import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ProductCard from "../../components/ProductCard.jsx";
import ServiceCard from "../../components/ServiceCard.jsx";
import JobCard from "../../components/JobCard.jsx";
import SectionHeading from "../../components/SectionHeading.jsx";
import Reveal from "../../components/Reveal.jsx";
import Robot from "../../components/Robot.jsx";
import TestimonialCard from "../../components/TestimonialCard.jsx";

export default function Home() {
  const [state, setState] = useState({
    loading: true,
    hero: null,
    intro: null,
    cta: null,
    mission: null,
    vision: null,
    products: [],
    services: [],
    jobs: [],
    testimonials: [],
    settings: {},
  });

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
  const [careersTab, setCareersTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [
          content,
          aboutContent,
          products,
          services,
          jobs,
          testimonials,
          settings,
        ] = await Promise.all([
          publicApi.getPageContent("home").catch(() => ({ data: { data: {} } })),
          publicApi.getPageContent("about").catch(() => ({ data: { data: {} } })),
          publicApi
            .getProducts({ per_page: 6 })
            .catch(() => ({ data: { data: { items: [] } } })),
          publicApi.getServices().catch(() => ({ data: { data: [] } })),
          publicApi
            .getJobs({ per_page: 6 })
            .catch(() => ({ data: { data: { items: [] } } })),
          publicApi.getTestimonials().catch(() => ({ data: { data: [] } })),
          publicApi.getSettings().catch(() => ({ data: { data: {} } })),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          hero: content.data.data?.hero || null,
          intro: content.data.data?.intro || null,
          cta: content.data.data?.cta || null,
          mission: aboutContent.data.data?.mission || null,
          vision: aboutContent.data.data?.vision || null,
          products: products.data.data?.items || [],
          services: services.data.data || [],
          jobs: jobs.data.data?.items || [],
          testimonials: testimonials.data.data || [],
          settings: settings.data.data || {},
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim() || form.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setFormError(null);
    if (!validateForm()) return;
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

  if (state.loading) return <Loader />;

  const hero = state.hero || {
    headline: "Build the future with modern IT solutions",
    subheadline:
      "We craft scalable products and SaaS platforms for growing businesses.",
    cta_primary_text: "Explore Products",
    cta_primary_link: "products",
    cta_secondary_text: "Talk to Us",
    cta_secondary_link: "contact",
  };

  const gotoSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const headlineWords = (hero.headline || "").trim().split(" ");
  const headlineMain = headlineWords.slice(0, -1).join(" ");
  const headlineAccent = headlineWords.slice(-1)[0] || "";

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          HOME / HERO
      ═══════════════════════════════════════════════════ */}
      <section id="home" className="hero-section">
        <div className="hero-bg-mesh" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>
        <div className="hero-grid-dots" aria-hidden="true" />
        <div className="hero-float hero-float-1" aria-hidden="true" />
        <div className="hero-float hero-float-2" aria-hidden="true" />
        <div className="hero-float hero-float-3" aria-hidden="true" />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal>
                <div className="hero-badge">
                  <span className="hero-badge-dot" />
                  <span className="hero-badge-text">
                    <i className="bi bi-stars me-1" />
                    Modern IT &amp; SaaS Company
                  </span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="hero-headline">
                  {headlineMain}{" "}
                  <span className="hero-gradient-text">{headlineAccent}</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="hero-subheadline">{hero.subheadline}</p>
              </Reveal>

              <Reveal delay={300}>
                <div className="hero-cta-group">
                  <button
                    className="btn hero-cta-primary"
                    onClick={() => gotoSection("products")}
                  >
                    <span>{hero.cta_primary_text || "Explore Products"}</span>
                    <i className="bi bi-arrow-right hero-cta-arrow" />
                  </button>
                  <button
                    className="btn hero-cta-secondary"
                    onClick={() => gotoSection("contact")}
                  >
                    <i className="bi bi-chat-dots me-2" />
                    {hero.cta_secondary_text || "Talk to Us"}
                  </button>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="hero-stats">
                  {[
                    { num: "10+", label: "Projects Delivered", icon: "bi-rocket-takeoff" },
                    { num: "30+", label: "Happy Clients", icon: "bi-emoji-smile" },
                    { num: "99%", label: "Uptime SLA", icon: "bi-shield-check" },
                  ].map((s, i) => (
                    <div className="hero-stat" key={i}>
                      <div className="hero-stat-icon">
                        <i className={`bi ${s.icon}`} />
                      </div>
                      <div>
                        <div className="hero-stat-num">{s.num}</div>
                        <div className="hero-stat-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="col-lg-6 d-flex justify-content-center position-relative">
              <Reveal delay={200}>
                <Robot />
              </Reveal>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <i className="bi bi-chevron-double-down" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ABOUT — with Mission + Vision
      ═══════════════════════════════════════════════════ */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="row align-items-center g-5">
            {/* ═══ LEFT: Heading + Description + Stats + CTA ═══ */}
            <div className="col-lg-5">
              <Reveal>
                <div className="about-badge">
                  <span className="about-badge-dot" />
                  About Us
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="about-title">
                  {state.intro?.title || "Who we are"}
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="about-desc">
                  {state.intro?.body ||
                    "We are a product-focused IT company delivering high quality software for global businesses. Our team turns complex ideas into scalable, elegant digital products."}
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="about-stats-mini">
                  <div className="about-mini">
                    <div className="about-mini-num">5+</div>
                    <div className="about-mini-label">Years Experience</div>
                  </div>
                  <div className="about-mini-divider" />
                  <div className="about-mini">
                    <div className="about-mini-num">40+</div>
                    <div className="about-mini-label">Team Members</div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <button
                  className="hero-cta-primary mt-4"
                  onClick={() => gotoSection("services")}
                >
                  <span>See What We Do</span>
                  <i className="bi bi-arrow-right hero-cta-arrow" />
                </button>
              </Reveal>
            </div>

            {/* ═══ RIGHT: Mission + Vision Cards ═══ */}
            <div className="col-lg-7">
              <div className="mv-grid">
                {/* Mission */}
                <Reveal delay={80}>
                  <div className="mv-card mv-card-mission">
                    <div className="mv-icon">
                      <i className="bi bi-bullseye" />
                    </div>
                    <h3 className="mv-title">
                      {state.mission?.title || "Our Mission"}
                    </h3>
                    <p className="mv-body">
                      {state.mission?.body ||
                        "To empower businesses with reliable, modern, and scalable software solutions that drive real growth and simplify operations."}
                    </p>
                  </div>
                </Reveal>

                {/* Vision */}
                <Reveal delay={160}>
                  <div className="mv-card mv-card-vision">
                    <div className="mv-icon">
                      <i className="bi bi-eye-fill" />
                    </div>
                    <h3 className="mv-title">
                      {state.vision?.title || "Our Vision"}
                    </h3>
                    <p className="mv-body">
                      {state.vision?.body ||
                        "To become the most trusted partner for digital product engineering, delivering innovation that shapes the future of business worldwide."}
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Values row */}
              <Reveal delay={240}>
                <div className="mv-values">
                  {[
                    { icon: "bi-shield-check", label: "Integrity" },
                    { icon: "bi-lightning-charge", label: "Innovation" },
                    { icon: "bi-people", label: "Collaboration" },
                    { icon: "bi-award", label: "Quality" },
                  ].map((v, i) => (
                    <div className="mv-value" key={i}>
                      <i className={`bi ${v.icon}`} />
                      <span>{v.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRODUCTS
      ═══════════════════════════════════════════════════ */}
      <section id="products" className="section products-section">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Our Products"
              title="Software built for scale"
              description="Explore our flagship products trusted by growing teams worldwide."
              center
            />
          </Reveal>

          {state.products.length === 0 ? (
            <p className="text-center" style={{ color: "var(--muted)" }}>
              Products coming soon.
            </p>
          ) : (
            <>
              <div className="products-grid">
                {state.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="text-center mt-5">
                <Link to="/products" className="btn btn-dark-ghost">
                  View All Products <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════════════════ */}
      <section id="services" className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="What We Do"
              title="Services that deliver"
              description="End-to-end services from strategy to shipping production software."
              center
            />
          </Reveal>

          {state.services.length === 0 ? (
            <p className="text-center" style={{ color: "var(--muted)" }}>
              Services coming soon.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "1.5rem",
                  alignItems: "stretch",
                  width: "100%",
                  marginTop: "3rem",
                }}
                className="services-grid-inline"
              >
                {state.services.slice(0, 6).map((s, i) => (
                  <ServiceCard key={s.id} service={s} index={i} />
                ))}
              </div>

              <div className="text-center mt-5">
                <Link to="/services" className="btn btn-dark-ghost">
                  View All Services <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      {state.testimonials.length > 0 && (
        <section className="section" style={{ background: "var(--bg-alt)" }}>
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="Testimonials"
                title="What our clients say"
                description="Trusted by founders, CTOs and product leaders worldwide."
                center
              />
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1.5rem",
                alignItems: "stretch",
                width: "100%",
                marginTop: "3rem",
              }}
              className="testimonials-grid-inline"
            >
              {state.testimonials.slice(0, 3).map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          CAREERS
      ═══════════════════════════════════════════════════ */}
      <section id="careers" className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Careers"
              title="Join our team"
              description="We're hiring. Come build the future with us."
              center
            />
          </Reveal>

          {state.jobs.length > 0 && (
            <Reveal delay={100}>
              <div className="careers-tabs">
                {[
                  { key: "all", label: "All Openings", icon: "bi-grid-3x3-gap" },
                  { key: "jobs", label: "Jobs", icon: "bi-briefcase" },
                  { key: "internships", label: "Internships", icon: "bi-mortarboard" },
                ].map((tab) => {
                  const count =
                    tab.key === "all"
                      ? state.jobs.length
                      : tab.key === "jobs"
                      ? state.jobs.filter(
                          (j) =>
                            !(j.employment_type || "")
                              .toLowerCase()
                              .includes("internship")
                        ).length
                      : state.jobs.filter((j) =>
                          (j.employment_type || "")
                            .toLowerCase()
                            .includes("internship")
                        ).length;

                  const isActive = careersTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCareersTab(tab.key)}
                      className={`careers-tab ${isActive ? "is-active" : ""}`}
                    >
                      <i className={`bi ${tab.icon}`} />
                      <span>{tab.label}</span>
                      <span className="careers-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          )}

          {state.jobs.length === 0 ? (
            <p className="text-center" style={{ color: "var(--muted)" }}>
              No openings right now.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "1.5rem",
                  alignItems: "stretch",
                  width: "100%",
                  marginTop: "2.5rem",
                }}
                className="careers-grid-inline"
              >
                {state.jobs
                  .filter((j) => {
                    if (careersTab === "all") return true;
                    const isIntern = (j.employment_type || "")
                      .toLowerCase()
                      .includes("internship");
                    return careersTab === "internships" ? isIntern : !isIntern;
                  })
                  .slice(0, 3)
                  .map((j) => (
                    <JobCard key={j.id} job={j} />
                  ))}
              </div>

              <div className="text-center mt-5">
                <Link to="/careers" className="btn btn-dark-ghost">
                  View All Openings <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CONTACT
      ═══════════════════════════════════════════════════ */}
      <section
        id="contact"
        className="section"
        style={{
          background: "var(--bg-alt)",
          position: "relative",
          overflow: "hidden",
        }}
      >
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

        <div className="container position-relative">
          <Reveal>
            <SectionHeading
              eyebrow="Contact"
              title="Get in touch"
              description="Have a project in mind? We'd love to hear from you."
              center
            />
          </Reveal>

          <div className="row g-4 mt-5 align-items-stretch">
            {/* ═══ LEFT: Contact Info Panel ═══ */}
            <div className="col-lg-5">
              <Reveal>
                <div
                  style={{
                    background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
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

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {state.settings.email && (
                        <a
                          href={`mailto:${state.settings.email}`}
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
                            e.currentTarget.style.background = "rgba(96,165,250,.12)";
                            e.currentTarget.style.borderColor = "rgba(96,165,250,.4)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,.04)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
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
                              {state.settings.email}
                            </div>
                          </div>
                        </a>
                      )}

                      {state.settings.phone && (
                        <a
                          href={`tel:${state.settings.phone}`}
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
                            e.currentTarget.style.background = "rgba(96,165,250,.12)";
                            e.currentTarget.style.borderColor = "rgba(96,165,250,.4)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,.04)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
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
                              {state.settings.phone}
                            </div>
                          </div>
                        </a>
                      )}

                      {state.settings.address && (
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
                              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
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
                              {state.settings.address}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

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
                      <div style={{ display: "flex", gap: ".55rem" }}>
                        {[
                          { url: state.settings.linkedin_url, icon: "bi-linkedin" },
                          { url: state.settings.twitter_url, icon: "bi-twitter-x" },
                          { url: state.settings.facebook_url, icon: "bi-facebook" },
                          { url: state.settings.instagram_url, icon: "bi-instagram" },
                          { url: state.settings.github_url, icon: "bi-github" },
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
                                e.currentTarget.style.transform = "translateY(-3px)";
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

                  <form onSubmit={submitForm} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="contact-label">
                          Name <span className="req">*</span>
                        </label>
                        <input
                          className={`form-control contact-input ${
                            errors.name ? "is-invalid" : ""
                          }`}
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <div className="contact-error">{errors.name}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="contact-label">
                          Email <span className="req">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control contact-input ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="you@company.com"
                        />
                        {errors.email && (
                          <div className="contact-error">{errors.email}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="contact-label">
                          Phone <span className="opt">(optional)</span>
                        </label>
                        <input
                          className={`form-control contact-input ${
                            errors.phone ? "is-invalid" : ""
                          }`}
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="+91 00000 00000"
                        />
                        {errors.phone && (
                          <div className="contact-error">{errors.phone}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="contact-label">
                          Subject <span className="req">*</span>
                        </label>
                        <input
                          className={`form-control contact-input ${
                            errors.subject ? "is-invalid" : ""
                          }`}
                          value={form.subject}
                          onChange={(e) =>
                            setForm({ ...form, subject: e.target.value })
                          }
                          placeholder="How can we help?"
                        />
                        {errors.subject && (
                          <div className="contact-error">{errors.subject}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="contact-label">
                          Message <span className="req">*</span>
                        </label>
                        <textarea
                          rows={5}
                          className={`form-control contact-input ${
                            errors.message ? "is-invalid" : ""
                          }`}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                          placeholder="Tell us about your project..."
                        />
                        {errors.message && (
                          <div className="contact-error">{errors.message}</div>
                        )}
                      </div>

                      <div className="col-12 mt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="hero-cta-primary"
                          style={{ padding: ".85rem 2rem" }}
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

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <Reveal>
            <div className="final-cta">
              <div className="final-cta-bg" aria-hidden="true" />
              <div className="final-cta-content">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".5rem",
                    padding: ".45rem 1rem",
                    background: "rgba(96,165,250,.14)",
                    border: "1px solid rgba(96,165,250,.3)",
                    borderRadius: 999,
                    marginBottom: "1.75rem",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      background: "#10B981",
                      borderRadius: "50%",
                      boxShadow: "0 0 12px #10B981",
                    }}
                  />
                  <span
                    style={{
                      fontSize: ".72rem",
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "#BFDBFE",
                    }}
                  >
                    Available for new projects
                  </span>
                </div>

                <h2 className="final-cta-title">
                  {state.cta?.title || "Ready to start your next project?"}
                </h2>

                <p className="final-cta-sub">
                  Let's turn your idea into a shipped product. Book a free
                  consultation today.
                </p>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <button
                    onClick={() => gotoSection("contact")}
                    className="hero-cta-primary"
                    style={{ padding: "1rem 2.25rem", fontSize: "1rem" }}
                  >
                    <span>Book a Free Call</span>
                    <i className="bi bi-arrow-right hero-cta-arrow" />
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.25rem",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginTop: ".5rem",
                    }}
                  >
                    {[
                      { icon: "bi-check-circle-fill", text: "No credit card required" },
                      { icon: "bi-check-circle-fill", text: "Free consultation" },
                      { icon: "bi-check-circle-fill", text: "24hr response" },
                    ].map((item, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: ".4rem",
                          fontSize: ".82rem",
                          color: "#94A3B8",
                          fontWeight: 600,
                        }}
                      >
                        <i
                          className={`bi ${item.icon}`}
                          style={{ color: "#10B981", fontSize: ".85rem" }}
                        />
                        {item.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}