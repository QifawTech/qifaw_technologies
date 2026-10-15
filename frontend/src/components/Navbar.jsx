import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";
import { publicApi } from "../api/client.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [settings, setSettings] = useState({});
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
      .then((r) => setSettings(r.data.data || {}))
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

  // Compute logo URL
  const logoUrl = settings.logo_path
    ? `${API_BASE}/public/media/${settings.logo_path.replace(/^media\//, "")}`
    : null;

  // Split company name into first + rest (for gradient styling)
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
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={fullName}
                className="nav-brand-logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span className="nav-brand-mark">
                <span className="nav-brand-dot" />
                {fullName[0].toUpperCase()}
              </span>
            )}
            <span className="nav-brand-text">
              {firstName}
              {restName && (
                <>
                  {" "}
                  <span className="nav-brand-accent">{restName}</span>
                </>
              )}
            </span>
          </Link>

          {/* ═══ DESKTOP LINKS ═══ */}
          <ul className="nav-links d-none d-lg-flex">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  className={`nav-link-item ${
                    active === l.id && location.pathname === "/"
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() => scrollTo(l.id)}
                >
                  {l.label}
                  <span className="nav-link-underline" />
                </button>
              </li>
            ))}
          </ul>

          {/* ═══ RIGHT ACTIONS ═══ */}
          <div className="nav-actions">
            <button
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "light" ? "Dark mode" : "Light mode"}
            >
              <i
                className={`bi ${
                  theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"
                }`}
              />
            </button>

            <button
              className="btn btn-lime btn-sm d-none d-lg-inline-flex nav-cta"
              onClick={() => scrollTo("contact")}
            >
              Get Started
              <i className="bi bi-arrow-right ms-1" />
            </button>

            <button
              className={`hamburger d-lg-none ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE MENU ═══ */}
      <div className={`mobile-menu ${open ? "is-open" : ""}`}>
        <ul>
          {links.map((l, i) => (
            <li
              key={l.id}
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              <button
                className={`mobile-link ${
                  active === l.id && location.pathname === "/" ? "is-active" : ""
                }`}
                onClick={() => scrollTo(l.id)}
              >
                <span>{l.label}</span>
                <i className="bi bi-arrow-up-right" />
              </button>
            </li>
          ))}
          <li
            style={{
              transitionDelay: open ? `${links.length * 40}ms` : "0ms",
            }}
          >
            <button
              className="btn btn-lime w-100 mt-2"
              onClick={() => scrollTo("contact")}
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
      />
    </>
  );
}