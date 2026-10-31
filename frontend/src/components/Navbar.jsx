import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";
import { publicApi } from "../api/client.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  
  // ⚡ FIX: Immediate logo & settings with LocalStorage cache + reliable defaults
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("qifaw_nav_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // fallback
    }
    return {
      company_name: "Qifaw Technologies",
      logo_path: "media/b6947d1ebe4749b5890a098866b32eb7.png",
    };
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
        setSettings((prev) => ({ ...prev, ...data }));
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

  // Logo URL path - defaults to /favicon.png immediately so no flash/empty image
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  const defaultLogo = "/favicon.png";
  const logoUrl = settings.logo_path
    ? settings.logo_path.startsWith("http")
      ? settings.logo_path
      : `${API_BASE}/public/media/${settings.logo_path.replace(/^media\//, "")}`
    : defaultLogo;

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
            <img
              src={logoUrl}
              alt={fullName}
              className="nav-brand-logo"
              onError={(e) => {
                if (e.target.src !== window.location.origin + defaultLogo) {
                  e.target.src = defaultLogo;
                }
              }}
              style={{ maxHeight: "40px", width: "auto", objectFit: "contain" }}
            />
            
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

      {/* ═══ MOBILE BACKDROP (Starts UNDER navbar, never blurs top header) ═══ */}
      <div
        className={`mobile-backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          top: scrolled ? "64px" : "72px",
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1040,
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ═══ MOBILE MENU (Flush directly below navbar) ═══ */}
      <div
        className={`mobile-menu ${open ? "is-open" : ""}`}
        style={{
          position: "fixed",
          top: scrolled ? "64px" : "72px",
          right: 0,
          width: "min(340px, 86vw)",
          height: scrolled ? "calc(100dvh - 64px)" : "calc(100dvh - 72px)",
          zIndex: 1050,
          padding: "1.25rem 1.25rem 2rem",
          background: "var(--surface)",
          boxShadow: "-10px 10px 40px rgba(0, 0, 0, 0.2)",
          borderLeft: "1px solid var(--border)",
          borderTop: "1px solid var(--border)",
          overflowY: "auto",
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {links.map((l, i) => (
            <li key={l.id} style={{ transitionDelay: open ? `${i * 35}ms` : "0ms" }}>
              <button
                className={`mobile-link ${active === l.id && location.pathname === "/" ? "is-active" : ""}`}
                onClick={() => scrollTo(l.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: active === l.id ? "var(--accent)" : "var(--text)",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span>{l.label}</span>
                <i className="bi bi-arrow-up-right" style={{ fontSize: "0.85rem", opacity: 0.6 }} />
              </button>
            </li>
          ))}
          <li style={{ transitionDelay: open ? `${links.length * 35}ms` : "0ms", marginTop: "0.75rem" }}>
            <button
              className="btn btn-lime w-100"
              onClick={() => scrollTo("contact")}
              style={{ padding: "0.85rem", borderRadius: "12px", fontWeight: 600 }}
            >
              Get Started <i className="bi bi-arrow-right ms-1" />
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}