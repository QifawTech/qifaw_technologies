import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { publicApi } from "../api/client.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    publicApi
      .getSettings()
      .then((r) => setSettings(r.data.data || {}))
      .catch(() => {});
  }, []);

  const scrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const logoUrl = settings.logo_path
    ? `${API_BASE}/public/media/${settings.logo_path.replace(/^media\//, "")}`
    : null;

  const companyName = settings.company_name || "Qifaw Technologies";

  return (
    <footer className="site-footer">
      <div className="container site-footer-container">
        <div className="row g-4">
          {/* ═══ COLUMN 1: Brand + Social ═══ */}
          <div className="col-12 col-lg-5">
            <Link to="/" className="footer-brand-link">
              {logoUrl ? (
                <div className="footer-logo-wrapper">
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="footer-logo-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="footer-logo-mark">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="footer-logo-name">{companyName}</span>
            </Link>

            <p className="footer-desc">
              We build modern IT products and SaaS platforms for growing
              businesses.
            </p>

            <div className="footer-socials">
              {[
                { url: settings.linkedin_url, icon: "bi-linkedin", label: "LinkedIn" },
                { url: settings.twitter_url, icon: "bi-twitter-x", label: "Twitter" },
                { url: settings.facebook_url, icon: "bi-facebook", label: "Facebook" },
                { url: settings.instagram_url, icon: "bi-instagram", label: "Instagram" },
                { url: settings.github_url, icon: "bi-github", label: "GitHub" },
              ]
                .filter((s) => s.url)
                .map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="footer-social-link"
                  >
                    <i className={`bi ${s.icon}`} />
                  </a>
                ))}
            </div>
          </div>

          {/* ═══ COLUMN 2: Company ═══ */}
          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Company</h6>
            <ul className="footer-list">
              {[
                { label: "About", action: () => scrollTo("about") },
                { label: "Careers", action: () => scrollTo("careers") },
                { label: "Contact", action: () => scrollTo("contact") },
              ].map((link, i) => (
                <li key={i}>
                  <button onClick={link.action} className="footer-link-btn">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ═══ COLUMN 3: Product ═══ */}
          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Product</h6>
            <ul className="footer-list">
              {[
                { label: "Products", action: () => scrollTo("products") },
                { label: "Services", action: () => scrollTo("services") },
              ].map((link, i) => (
                <li key={i}>
                  <button onClick={link.action} className="footer-link-btn">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ═══ COLUMN 4: Contact ═══ */}
          <div className="col-12 col-lg-3">
            <h6 className="footer-heading">Contact</h6>
            <ul className="footer-contact-list">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="footer-contact-item"
                  >
                    <span className="footer-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 6L2 7" />
                      </svg>
                    </span>
                    <span className="footer-contact-text">{settings.email}</span>
                  </a>
                </li>
              )}

              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone}`}
                    className="footer-contact-item"
                  >
                    <span className="footer-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="footer-contact-text">{settings.phone}</span>
                  </a>
                </li>
              )}

              {settings.address && (
                <li>
                  <div className="footer-contact-item footer-contact-item--static">
                    <span className="footer-contact-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="footer-contact-text">{settings.address}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ═══ COPYRIGHT ═══ */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} <span className="highlight-brand">{companyName}</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}