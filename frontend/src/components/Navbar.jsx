import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";
import { publicApi } from "../api/client.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  
  // ⚡ FIX: LocalStorage la irundhu initial state-ah edukkom
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("qifaw_nav_settings");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "products", label: "Products" },
    { id: "services", label: "Services" },
    { id: "careers", label: "Careers" },
    { id: "contact", label: "Contact" },
  ];

  // Fetch site settings
  useEffect(() => {
    publicApi
      .getSettings()
      .then((r) => {
        const data = r.data.data || {};
        setSettings(data);
        // ⚡ FIX: API data-va LocalStorage la save pandrom
        localStorage.setItem("qifaw_nav_settings", JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  // Detect scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section
  useEffect(() => {
    if (location.pathname !== "/") {
      setActive("");
      return;
    }
    const ids = links.map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const scrollTo = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Logo URL path
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const logoUrl = settings.logo_path
    ? `${apiBaseUrl}/${settings.logo_path.replace(/^\//, "")}`
    : null;

  const fullName = settings.company_name || "Qifaw Technologies";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

  return (
    <>
      <nav className={`nav-shell ${scrolled ? "nav-shell--scrolled" : ""}`}>
        <div className="container nav-inner">
          
          {/* ═══ LOGO + COMPANY NAME ═══ */}
          <Link
            to="/"
            className="nav-brand"
            onClick={() => {
              setOpen(false);
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            style={{ textDecoration: "none" }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={fullName}
                className="nav-brand-logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                style={{ maxHeight: "40px", objectFit: "contain" }}
              />
            ) : (
              <span
                className="nav-brand-mark"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  width: "40px",
                  height: "40px",
                  fontWeight: 800,
                }}
              >
                {fullName[0].toUpperCase()}
              </span>
            )}
            
            <span className="nav-brand-text" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
              {firstName}
              {restName && (
                <>
                  {" "}
                  <span className="nav-brand-accent" style={{ color: "var(--accent)" }}>{restName}</span>
                </>
              )}
            </span>
          </Link>

          {/* ═══ DESKTOP LINKS ═══ */}
          <ul className="nav-links d-none d-lg-flex" style={{ gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l) => (
              <li key={l.id}>
                <button
                  className={`nav-link-item ${active === l.id && location.pathname === "/" ? "is-active" : ""}`}
                  onClick={() => scrollTo(l.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: active === l.id ? "var(--accent)" : "var(--text)",
                    cursor: "pointer",
                    position: "relative",
                    padding: "0.5rem 0",
                    transition: "color 0.2s ease",
                  }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* ═══ RIGHT ACTIONS ═══ */}
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "light" ? "Dark mode" : "Light mode"}
              style={{ background: "var(--bg-alt)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", cursor: "pointer", transition: "all 0.3s ease" }}
            >
              <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`} />
            </button>

            <button
              className="btn btn-lime btn-sm d-none d-lg-inline-flex nav-cta"
              onClick={() => scrollTo("contact")}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "50px", fontWeight: 600 }}
            >
              Get Started <i className="bi bi-arrow-right ms-1" />
            </button>

            <button
              className={`hamburger d-lg-none ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ background: "transparent", border: "none", width: "40px", height: "40px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "5px", cursor: "pointer" }}
            >
              <span style={{ width: "24px", height: "2px", background: "var(--text)", borderRadius: "2px", transition: "all 0.3s ease", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <span style={{ width: "24px", height: "2px", background: "var(--text)", borderRadius: "2px", transition: "all 0.3s ease", opacity: open ? 0 : 1 }} />
              <span style={{ width: "24px", height: "2px", background: "var(--text)", borderRadius: "2px", transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE MENU ═══ */}
      <div className={`mobile-menu ${open ? "is-open" : ""}`} style={{ padding: "2rem", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {links.map((l, i) => (
            <li key={l.id} style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}>
              <button
                className={`mobile-link ${active === l.id && location.pathname === "/" ? "is-active" : ""}`}
                onClick={() => scrollTo(l.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: active === l.id ? "var(--accent)" : "var(--text)",
                  padding: "0.75rem 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span>{l.label}</span>
                <i className="bi bi-arrow-up-right" style={{ fontSize: "0.9rem", color: "var(--muted)" }} />
              </button>
            </li>
          ))}
          <li style={{ transitionDelay: open ? `${links.length * 40}ms` : "0ms" }}>
            <button
              className="btn btn-lime w-100 mt-2"
              onClick={() => scrollTo("contact")}
              style={{ padding: "0.85rem", borderRadius: "12px", fontWeight: 600 }}
            >
              Get Started <i className="bi bi-arrow-right ms-1" />
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile backdrop */}
      <div
        className={`mobile-backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        style={{ background: "rgba(0,0,0,0.5)", position: "fixed", inset: 0, zIndex: 999, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
      />
    </>
  );
}