import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, stats: null });

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/stats")
      .then(
        (r) =>
          !cancelled &&
          setState({ loading: false, error: null, stats: r.data.data })
      )
      .catch(
        (e) =>
          !cancelled &&
          setState({ loading: false, error: e.message, stats: null })
      );
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return <Loader label="Loading dashboard..." />;

  const s = state.stats || {
    products: { total: 0, published: 0 },
    services: { total: 0, published: 0 },
    jobs: { total: 0, published: 0, closed: 0 },
    applications: { total: 0, new: 0, shortlisted: 0, hired: 0 },
    enquiries: { total: 0, unread: 0 },
    testimonials: { total: 0, published: 0 },
    recent_activity: [],
    recent_applications: [],
  };

  const kpis = [
    {
      label: "Total Products",
      value: s.products.total,
      sub: `${s.products.published} published`,
      icon: "bi-box-seam-fill",
      color: "#3B82F6",
      gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
      link: "/admin/products",
    },
    {
      label: "Active Jobs",
      value: s.jobs.published,
      sub: `${s.jobs.total} total`,
      icon: "bi-briefcase-fill",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
      link: "/admin/jobs",
    },
    {
      label: "Applications",
      value: s.applications.total,
      sub: `${s.applications.new} new`,
      icon: "bi-file-earmark-person-fill",
      color: "#10B981",
      gradient: "linear-gradient(135deg, #059669, #10B981)",
      link: "/admin/applications",
    },
    {
      label: "Enquiries",
      value: s.enquiries.total,
      sub: `${s.enquiries.unread} unread`,
      icon: "bi-envelope-fill",
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #D97706, #F59E0B)",
      link: "/admin/enquiries",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Hired":
        return { bg: "rgba(16,185,129,.15)", color: "#6EE7B7" };
      case "Shortlisted":
        return { bg: "rgba(59,130,246,.15)", color: "#93C5FD" };
      case "Rejected":
        return { bg: "rgba(220,38,38,.15)", color: "#FCA5A5" };
      case "Reviewing":
        return { bg: "rgba(245,158,11,.15)", color: "#FCD34D" };
      default:
        return { bg: "rgba(148,163,184,.18)", color: "#CBD5E1" };
    }
  };

  const getActivityIcon = (action) => {
    if (action.includes("login")) return "bi-box-arrow-in-right";
    if (action.includes("logout")) return "bi-box-arrow-right";
    if (action.includes("create")) return "bi-plus-circle";
    if (action.includes("update")) return "bi-pencil-square";
    if (action.includes("delete")) return "bi-trash";
    if (action.includes("status")) return "bi-toggle-on";
    if (action.includes("upload")) return "bi-cloud-arrow-up";
    return "bi-activity";
  };

  return (
    <div>
      {/* ═══ HEADER ═══ */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              marginBottom: ".25rem",
            }}
          >
            Overview
          </h2>
          <p
            style={{ color: "var(--muted)" }}
            className="mb-0 small"
          >
            Welcome back, {s.admin_name || "Admin"}
          </p>
        </div>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div className="col-sm-6 col-xl-3" key={i}>
            <Link
              to={k.link}
              className="admin-kpi-card"
              style={{
                display: "block",
                textDecoration: "none",
                position: "relative",
                padding: "1.35rem 1.25rem",
                background: "var(--admin-surface, var(--surface))",
                border: "1px solid var(--admin-border-strong, var(--border))",
                borderRadius: 18,
                overflow: "hidden",
                transition: "transform .35s ease, box-shadow .35s ease, border-color .3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = k.color;
                e.currentTarget.style.boxShadow = `0 16px 40px ${k.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor =
                  "var(--admin-border-strong, var(--border))";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top row: icon + trend */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: k.gradient,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    boxShadow: `0 8px 20px ${k.color}40`,
                    flexShrink: 0,
                  }}
                >
                  <i className={`bi ${k.icon}`} />
                </div>
                <i
                  className="bi bi-arrow-up-right"
                  style={{
                    color: "var(--muted)",
                    fontSize: "1.1rem",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--text)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  marginBottom: ".35rem",
                }}
              >
                {k.value}
              </div>

              {/* Label + sub */}
              <div
                style={{
                  fontSize: ".82rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: ".01em",
                  marginBottom: ".2rem",
                }}
              >
                {k.label}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--muted)",
                  fontWeight: 600,
                }}
              >
                {k.sub}
              </div>

              {/* Decorative glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: 120,
                  height: 120,
                  background: `radial-gradient(circle, ${k.color}20, transparent 70%)`,
                  borderRadius: "50%",
                  pointerEvents: "none",
                }}
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* ═══ RECENT APPLICATIONS ═══ */}
        <div className="col-lg-7">
          <div
            className="admin-panel"
            style={{
              background: "var(--admin-surface, var(--surface))",
              border: "1px solid var(--admin-border-strong, var(--border))",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--admin-border, var(--border))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".95rem",
                    boxShadow: "0 6px 16px rgba(37,99,235,.35)",
                  }}
                >
                  <i className="bi bi-file-earmark-person-fill" />
                </div>
                <h5
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Recent Applications
                </h5>
              </div>
              <Link
                to="/admin/applications"
                style={{
                  fontSize: ".82rem",
                  fontWeight: 700,
                  color: "var(--accent-h)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".3rem",
                }}
              >
                View all <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {/* Table */}
            {s.recent_applications?.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: ".88rem",
                }}
              >
                <i
                  className="bi bi-inbox"
                  style={{ fontSize: "2rem", display: "block", marginBottom: ".75rem", opacity: 0.4 }}
                />
                No applications yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <thead>
                    <tr>
                      {["Name", "Job", "Status"].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            fontSize: ".7rem",
                            fontWeight: 800,
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                            padding: ".85rem 1.5rem",
                            background: "var(--admin-surface-2, var(--bg-alt))",
                            textAlign: "left",
                            borderBottom: "1px solid var(--admin-border, var(--border))",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.recent_applications.map((a) => {
                      const sc = getStatusColor(a.status);
                      return (
                        <tr
                          key={a.id}
                          style={{
                            background: "transparent",
                            transition: "background .2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "var(--admin-surface-2, var(--bg-alt))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              borderBottom:
                                "1px solid var(--admin-border, var(--border))",
                              verticalAlign: "middle",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                color: "var(--text)",
                                fontSize: ".9rem",
                              }}
                            >
                              {a.name}
                            </div>
                            <div
                              style={{
                                fontSize: ".75rem",
                                color: "var(--muted)",
                                marginTop: 2,
                              }}
                            >
                              {a.email}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              borderBottom:
                                "1px solid var(--admin-border, var(--border))",
                              verticalAlign: "middle",
                              fontSize: ".85rem",
                              color: "var(--text-soft)",
                            }}
                          >
                            {a.job_title || "—"}
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              borderBottom:
                                "1px solid var(--admin-border, var(--border))",
                              verticalAlign: "middle",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: ".35rem .8rem",
                                background: sc.bg,
                                color: sc.color,
                                borderRadius: 999,
                                fontSize: ".72rem",
                                fontWeight: 800,
                                letterSpacing: ".02em",
                              }}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RECENT ACTIVITY ═══ */}
        <div className="col-lg-5">
          <div
            className="admin-panel"
            style={{
              background: "var(--admin-surface, var(--surface))",
              border: "1px solid var(--admin-border-strong, var(--border))",
              borderRadius: 20,
              overflow: "hidden",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".7rem",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--admin-border, var(--border))",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".95rem",
                  boxShadow: "0 6px 16px rgba(124,58,237,.35)",
                }}
              >
                <i className="bi bi-activity" />
              </div>
              <h5
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.01em",
                }}
              >
                Recent Activity
              </h5>
            </div>

            {s.recent_activity?.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: ".88rem",
                }}
              >
                <i
                  className="bi bi-clock-history"
                  style={{ fontSize: "2rem", display: "block", marginBottom: ".75rem", opacity: 0.4 }}
                />
                No activity yet.
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: ".5rem .75rem",
                  margin: 0,
                }}
              >
                {s.recent_activity.map((log, i) => (
                  <li
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".85rem",
                      padding: ".75rem",
                      borderRadius: 12,
                      transition: "background .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--admin-surface-2, var(--bg-alt))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg, rgba(59,130,246,.15), rgba(96,165,250,.08))",
                        color: "#60A5FA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".9rem",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${getActivityIcon(log.action)}`} />
                    </div>
                    <div style={{ minWidth: 0, flexGrow: 1 }}>
                      <div
                        style={{
                          fontSize: ".85rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          textTransform: "capitalize",
                        }}
                      >
                        {log.action.replace(/_/g, " ")}
                      </div>
                      <div
                        style={{
                          fontSize: ".72rem",
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}