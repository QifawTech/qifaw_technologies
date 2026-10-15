import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, stats: null });

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/stats")
      .then((r) => !cancelled && setState({ loading: false, error: null, stats: r.data.data }))
      .catch((e) => !cancelled && setState({ loading: false, error: e.message, stats: null }));
    return () => { cancelled = true; };
  }, []);

  if (state.loading) return <Loader label="Loading dashboard..." />;

  const s = state.stats || {
    products: { total: 0, published: 0, draft: 0, on_hold: 0 },
    services: { total: 0, published: 0 },
    jobs: { total: 0, published: 0, closed: 0 },
    applications: { total: 0, new: 0, shortlisted: 0, hired: 0 },
    enquiries: { total: 0, unread: 0 },
    testimonials: { total: 0, published: 0 },
    recent_activity: [],
    recent_applications: [],
  };

  const kpis = [
    { label: "Total Products", value: s.products.total, sub: `${s.products.published} published`, icon: "bi-box-seam", color: "#3B82F6" },
    { label: "Active Jobs", value: s.jobs.published, sub: `${s.jobs.total} total`, icon: "bi-briefcase", color: "#8B5CF6" },
    { label: "Applications", value: s.applications.total, sub: `${s.applications.new} new`, icon: "bi-file-earmark-person", color: "#10B981" },
    { label: "Enquiries", value: s.enquiries.total, sub: `${s.enquiries.unread} unread`, icon: "bi-envelope", color: "#F59E0B" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Overview</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            Welcome back, {state.stats?.admin_name || "Admin"}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div className="col-sm-6 col-xl-3" key={i}>
            <div className="card-clean p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${k.color}1A`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className={`bi ${k.icon}`} style={{ fontSize: 20, color: k.color }} />
                </div>
              </div>
              <div className="mt-3">
                <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>
                  {k.value}
                </div>
                <div className="small fw-semibold mt-1" style={{ color: "var(--text)" }}>
                  {k.label}
                </div>
                <div className="small" style={{ color: "var(--muted)", fontSize: ".78rem" }}>
                  {k.sub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Applications */}
        <div className="col-lg-6">
          <div className="card-clean p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Applications</h5>
              <a href="/admin/applications" className="small">View all →</a>
            </div>
            {s.recent_applications?.length === 0 ? (
              <p className="small mb-0" style={{ color: "var(--muted)" }}>No applications yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr className="small" style={{ color: "var(--muted)" }}>
                      <th>Name</th>
                      <th>Job</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.recent_applications.map((a) => (
                      <tr key={a.id}>
                        <td className="small">
                          <div className="fw-semibold">{a.name}</div>
                          <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>{a.email}</div>
                        </td>
                        <td className="small">{a.job_title || "—"}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                a.status === "Hired" ? "#DCFCE7" :
                                a.status === "Shortlisted" ? "#DBEAFE" :
                                a.status === "Rejected" ? "#FEE2E2" : "#E5E7EB",
                              color:
                                a.status === "Hired" ? "#166534" :
                                a.status === "Shortlisted" ? "#1E40AF" :
                                a.status === "Rejected" ? "#991B1B" : "#374151",
                              fontWeight: 600,
                            }}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-6">
          <div className="card-clean p-4 h-100">
            <h5 className="mb-3">Recent Activity</h5>
            {s.recent_activity?.length === 0 ? (
              <p className="small mb-0" style={{ color: "var(--muted)" }}>No activity yet.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {s.recent_activity.map((log, i) => (
                  <li
                    key={log.id}
                    className="d-flex gap-3 py-2"
                    style={{
                      borderBottom: i === s.recent_activity.length - 1 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--accent-soft)",
                        color: "var(--accent-h)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className="bi bi-activity" style={{ fontSize: 14 }} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-capitalize">
                        {log.action.replace(/_/g, " ")}
                      </div>
                      <div className="small" style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                        {new Date(log.created_at).toLocaleString()}
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