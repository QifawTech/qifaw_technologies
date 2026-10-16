import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";
import { useTheme } from "../hooks/useTheme.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api
      .get("/admin/me")
      .then((res) => {
        setAdmin(res.data.data.admin);
        const csrf = res.data?.data?.csrf_token;
        if (csrf) sessionStorage.setItem("csrf_token", csrf);
      })
      .catch(() => navigate("/admin/login", { replace: true }));

    fetch(`${API_BASE}/public/settings`)
      .then((r) => r.json())
      .then((d) => setSettings(d.data || {}))
      .catch(() => {});
  }, [navigate]);

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (_) {}
    sessionStorage.removeItem("csrf_token");
    navigate("/admin/login", { replace: true });
  };

  const menu = [
    { to: "/admin", label: "Overview", icon: "bi-grid-1x2", end: true },
    { to: "/admin/products", label: "Products", icon: "bi-box-seam" },
    { to: "/admin/services", label: "Services", icon: "bi-gear" },
    { to: "/admin/jobs", label: "Careers", icon: "bi-briefcase" },
    { to: "/admin/applications", label: "Applications", icon: "bi-file-earmark-person" },
    { to: "/admin/enquiries", label: "Enquiries", icon: "bi-envelope" },
    { to: "/admin/testimonials", label: "Testimonials", icon: "bi-chat-quote" },
    // { to: "/admin/media", label: "Media", icon: "bi-image" },
    { to: "/admin/content", label: "Content", icon: "bi-file-text" },
    { to: "/admin/mission-vision", label: "Mission & Vision", icon: "bi-compass" },
    { to: "/admin/settings", label: "Settings", icon: "bi-sliders" },
    { to: "/admin/change-password", label: "Security", icon: "bi-shield-lock" },
  ];

  const logoUrl = settings.logo_path
    ? `${API_BASE}/public/media/${settings.logo_path.replace(/^media\//, "")}`
    : null;

  return (
    <div className="admin-shell">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-brand">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={settings.company_name || "Logo"}
              style={{
                height: 42,
                maxWidth: 170,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <>
              <span
                style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#FFFFFF",
                  padding: "5px 11px",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: ".78rem",
                  letterSpacing: ".04em",
                }}
              >
                ADMIN
              </span>
              <span
                className="ms-2 fw-bold"
                style={{ fontSize: ".9rem", color: "#F1F5F9" }}
              >
                {settings.company_name || "Panel"}
              </span>
            </>
          )}
        </div>

        <nav className="admin-nav">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "is-active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${m.icon}`} />
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">
            <i className="bi bi-globe" />
            <span>View Website</span>
          </Link>
          <button className="admin-nav-link" onClick={logout}>
            <i className="bi bi-box-arrow-right" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      <div
        className={`admin-backdrop ${sidebarOpen ? "is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ═══ MAIN ═══ */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-burger d-lg-none"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list" />
          </button>
          <div className="flex-grow-1" />
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i
              className={`bi ${
                theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"
              }`}
            />
          </button>
          <div className="admin-user-chip">
            <div className="admin-avatar">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="d-none d-md-block">
              <div className="small fw-semibold">{admin?.name || "Admin"}</div>
              <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>
                {admin?.email}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}