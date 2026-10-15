import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../../api/client.js";
import JobCard from "../../components/JobCard.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import Reveal from "../../components/Reveal.jsx";

export default function Careers() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    department: "",
    employment_type: "",
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const load = async (overrides = {}) => {
    const page = overrides.page ?? 1;
    const department = overrides.department ?? state.department;
    const employment_type = overrides.employment_type ?? state.employment_type;
    setState((s) => ({ ...s, loading: true, page, department, employment_type }));
    try {
      const r = await publicApi.getJobs({ page, per_page: 12, department, employment_type });
      const d = r.data.data;
      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        items: d.items,
        totalPages: d.total_pages,
        total: d.total,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFilters = () => {
    setState((s) => ({ ...s, department: "", employment_type: "" }));
    load({ page: 1, department: "", employment_type: "" });
  };

  const hasFilters = state.department || state.employment_type;

  return (
    <section style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ═══ HERO ═══ */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "4rem 0 3.5rem",
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #1D4ED8 100%)",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(96,165,250,.35), transparent 70%)",
            filter: "blur(60px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-80px",
            width: 350,
            height: 350,
            background:
              "radial-gradient(circle, rgba(59,130,246,.25), transparent 70%)",
            filter: "blur(60px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(147,197,253,.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".5rem",
                  padding: ".45rem 1rem",
                  background: "rgba(96,165,250,.14)",
                  border: "1px solid rgba(96,165,250,.3)",
                  borderRadius: 999,
                  marginBottom: "1.5rem",
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
                  We're Hiring
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(2rem, 4.2vw, 3rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  margin: "0 0 1rem",
                }}
              >
                Join our team
              </h1>

              <p
                style={{
                  color: "#CBD5E1",
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  margin: "0 0 2rem",
                  maxWidth: 560,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                We are hiring talented people. Come build the future with us.
              </p>

              {/* Stats row */}
              <div
                style={{
                  display: "inline-flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {[
                  { num: state.total || 0, label: "Open Roles" },
                  { num: "5+", label: "Departments" },
                  { num: "Remote", label: "Friendly" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: ".65rem 1.25rem",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: 12,
                      minWidth: 100,
                    }}
                  >
                    <div
                      style={{
                        color: "#FFFFFF",
                        fontSize: "1.15rem",
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: ".7rem",
                        marginTop: 5,
                        fontWeight: 600,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ FILTERS + LIST ═══ */}
      <div className="container" style={{ padding: "3rem 1rem 5rem" }}>
        {/* Filter bar */}
        <Reveal>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "1.25rem 1.5rem",
              marginBottom: "2rem",
              boxShadow: "0 8px 24px rgba(15,23,42,.05)",
            }}
          >
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-auto">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    fontSize: ".92rem",
                  }}
                >
                  <i
                    className="bi bi-funnel-fill"
                    style={{ color: "var(--accent)" }}
                  />
                  Filters
                </div>
              </div>

              <div className="col-12 col-md">
                <select
                  className="form-select"
                  value={state.department}
                  onChange={(e) =>
                    load({ page: 1, department: e.target.value })
                  }
                  style={{
                    padding: ".65rem 1rem",
                    borderRadius: 12,
                    border: "1.5px solid var(--border)",
                    fontWeight: 600,
                    fontSize: ".9rem",
                  }}
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="col-12 col-md">
                <select
                  className="form-select"
                  value={state.employment_type}
                  onChange={(e) =>
                    load({ page: 1, employment_type: e.target.value })
                  }
                  style={{
                    padding: ".65rem 1rem",
                    borderRadius: 12,
                    border: "1.5px solid var(--border)",
                    fontWeight: 600,
                    fontSize: ".9rem",
                  }}
                >
                  <option value="">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {hasFilters && (
                <div className="col-12 col-md-auto">
                  <button
                    onClick={clearFilters}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: ".4rem",
                      padding: ".55rem .9rem",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: ".82rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      cursor: "pointer",
                      transition: "all .25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#DC2626";
                      e.currentTarget.style.color = "#DC2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--muted)";
                    }}
                  >
                    <i className="bi bi-x-circle" />
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Result count */}
        {!state.loading && state.items.length > 0 && (
          <div
            style={{
              marginBottom: "1.5rem",
              fontSize: ".9rem",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            Showing <strong style={{ color: "var(--text)" }}>{state.items.length}</strong>{" "}
            of <strong style={{ color: "var(--text)" }}>{state.total}</strong> openings
          </div>
        )}

        <ErrorAlert message={state.error} />

        {/* Jobs grid */}
        {state.loading ? (
          <Loader />
        ) : state.items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
            }}
          >
            <i
              className="bi bi-briefcase"
              style={{ fontSize: "3rem", color: "var(--muted)" }}
            />
            <h4
              style={{
                marginTop: "1rem",
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              No openings found
            </h4>
            <p
              style={{
                color: "var(--muted)",
                fontSize: ".9rem",
                marginBottom: "1.5rem",
              }}
            >
              {hasFilters
                ? "Try adjusting your filters."
                : "Check back soon for new opportunities."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: ".65rem 1.5rem",
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#FFFFFF",
                  border: 0,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: ".88rem",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1.25rem",
                alignItems: "stretch",
              }}
              className="careers-list-grid"
            >
              {state.items.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <nav
                style={{
                  marginTop: "3rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ul className="pagination">
                  {Array.from({ length: state.totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <li
                        key={n}
                        className={
                          "page-item " + (n === state.page ? "active" : "")
                        }
                      >
                        <button
                          className="page-link"
                          onClick={() => load({ page: n })}
                        >
                          {n}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: "4rem",
            padding: "2.5rem 2rem",
            background:
              "linear-gradient(135deg, var(--bg-alt), var(--surface))",
            border: "1px solid var(--border)",
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              color: "var(--text)",
              margin: "0 0 .6rem",
              letterSpacing: "-0.02em",
            }}
          >
            Don't see a role that fits?
          </h3>
          <p
            style={{
              color: "var(--muted)",
              fontSize: ".92rem",
              margin: "0 0 1.5rem",
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            We're always looking for talented people. Send us your resume and
            we'll reach out.
          </p>
          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".5rem",
              padding: ".85rem 1.75rem",
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              color: "#FFFFFF",
              border: 0,
              borderRadius: 12,
              fontWeight: 800,
              fontSize: ".92rem",
              textDecoration: "none",
              boxShadow: "0 10px 30px rgba(37,99,235,.35)",
              transition: "transform .3s ease, box-shadow .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 18px 40px rgba(37,99,235,.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(37,99,235,.35)";
            }}
          >
            Contact Us <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}