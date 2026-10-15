import { Link } from "react-router-dom";

// Icon mapping based on service slug/name
const getIcon = (service) => {
  const s = (service.slug || service.name || "").toLowerCase();
  if (s.includes("web") || s.includes("development")) return "bi-code-slash";
  if (s.includes("cloud")) return "bi-cloud-arrow-up";
  if (s.includes("mobile")) return "bi-phone";
  if (s.includes("ui") || s.includes("ux") || s.includes("design")) return "bi-palette";
  if (s.includes("data") || s.includes("ai")) return "bi-graph-up-arrow";
  if (s.includes("devops") || s.includes("automation")) return "bi-gear-wide-connected";
  return "bi-grid-1x2";
};

export default function ServiceCard({ service, index = 0 }) {
  const icon = getIcon(service);
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      to={service.cta_link || "/contact"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "1.75rem 1.6rem 1.5rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease, border-color .3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = "rgba(37,99,235,.4)";
        e.currentTarget.style.boxShadow = "0 22px 48px rgba(37,99,235,.12)";
        const numEl = e.currentTarget.querySelector(".svc-num");
        if (numEl) numEl.style.color = "rgba(37,99,235,.18)";
        const iconEl = e.currentTarget.querySelector(".svc-icon");
        if (iconEl) {
          iconEl.style.background = "linear-gradient(135deg, #2563EB, #3B82F6)";
          iconEl.style.color = "#FFFFFF";
          iconEl.style.transform = "rotate(-6deg) scale(1.05)";
        }
        const arrowEl = e.currentTarget.querySelector(".svc-arrow");
        if (arrowEl) {
          arrowEl.style.opacity = "1";
          arrowEl.style.transform = "translateX(0)";
          arrowEl.style.background = "linear-gradient(135deg, #2563EB, #3B82F6)";
          arrowEl.style.color = "#FFFFFF";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        const numEl = e.currentTarget.querySelector(".svc-num");
        if (numEl) numEl.style.color = "var(--bg-alt)";
        const iconEl = e.currentTarget.querySelector(".svc-icon");
        if (iconEl) {
          iconEl.style.background =
            "linear-gradient(135deg, rgba(37,99,235,.12), rgba(59,130,246,.05))";
          iconEl.style.color = "var(--accent-h)";
          iconEl.style.transform = "rotate(0) scale(1)";
        }
        const arrowEl = e.currentTarget.querySelector(".svc-arrow");
        if (arrowEl) {
          arrowEl.style.opacity = "0";
          arrowEl.style.transform = "translateX(-6px)";
          arrowEl.style.background = "var(--bg-alt)";
          arrowEl.style.color = "var(--text)";
        }
      }}
    >
      {/* Big number background */}
      <span
        className="svc-num"
        style={{
          position: "absolute",
          top: ".75rem",
          right: "1.25rem",
          fontSize: "3.5rem",
          fontWeight: 900,
          lineHeight: 1,
          color: "var(--bg-alt)",
          letterSpacing: "-0.05em",
          transition: "color .35s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {number}
      </span>

      {/* Icon */}
      <div
        className="svc-icon"
        style={{
          position: "relative",
          zIndex: 1,
          width: 54,
          height: 54,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(37,99,235,.12), rgba(59,130,246,.05))",
          color: "var(--accent-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          marginBottom: "1.25rem",
          transition:
            "background .35s ease, color .35s ease, transform .4s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <i className={`bi ${icon}`} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            margin: "0 0 .5rem",
          }}
        >
          {service.name}
        </h3>
        <p
          style={{
            fontSize: ".88rem",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: "0 0 1.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {service.short_description || "Learn how we can help your business."}
        </p>
      </div>

      {/* Footer with CTA */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "1.15rem",
          borderTop: "1px solid var(--border)",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            fontSize: ".88rem",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {service.cta_text || "Learn more"}
        </span>
        <span
          className="svc-arrow"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--bg-alt)",
            color: "var(--text)",
            fontSize: ".9rem",
            opacity: 0,
            transform: "translateX(-6px)",
            transition:
              "opacity .3s ease, transform .35s cubic-bezier(.34,1.56,.64,1), background .3s ease, color .3s ease",
            flexShrink: 0,
          }}
        >
          <i className="bi bi-arrow-right" />
        </span>
      </div>
    </Link>
  );
}