import { Link } from "react-router-dom";

// Icon mapping
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

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
  return `${baseUrl}/${imagePath.replace(/^\//, "")}`;
};

export default function ServiceCard({ service, index = 0 }) {
  const icon = getIcon(service);
  const number = String(index + 1).padStart(2, "0");
  const imageUrl = getImageUrl(service.image_path);

  return (
    <Link
      to={service.cta_link || "/contact"}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ellame equal height-ah irukkum
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        overflow: "hidden", // Image edges-ku mela poagadhu
        textDecoration: "none",
        color: "inherit",
        transition: "transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease, border-color .3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.borderColor = "rgba(37,99,235,.3)";
        e.currentTarget.style.boxShadow = "0 24px 48px rgba(37,99,235,.08)";
        
        const imgEl = e.currentTarget.querySelector(".svc-img");
        if (imgEl) imgEl.style.transform = "scale(1.08)";

        const iconEl = e.currentTarget.querySelector(".svc-icon-fallback");
        if (iconEl) {
          iconEl.style.transform = "scale(1.1) rotate(-5deg)";
          iconEl.style.background = "linear-gradient(135deg, #2563EB, #3B82F6)";
          iconEl.style.color = "#FFFFFF";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        
        const imgEl = e.currentTarget.querySelector(".svc-img");
        if (imgEl) imgEl.style.transform = "scale(1)";

        const iconEl = e.currentTarget.querySelector(".svc-icon-fallback");
        if (iconEl) {
          iconEl.style.transform = "scale(1) rotate(0)";
          iconEl.style.background = "linear-gradient(135deg, rgba(37,99,235,.1), rgba(59,130,246,.05))";
          iconEl.style.color = "var(--accent-h)";
        }
      }}
    >
      {/* Top Section: Image or Icon */}
      <div style={{ position: "relative", width: "100%", height: "220px", background: "var(--bg-alt)", overflow: "hidden" }}>
        
        {/* Big Number Background */}
        <span
          style={{
            position: "absolute",
            top: "-10px",
            right: "15px",
            fontSize: "6rem",
            fontWeight: 900,
            lineHeight: 1,
            color: "rgba(150, 150, 150, 0.1)", // Light transparent color
            letterSpacing: "-0.05em",
            pointerEvents: "none",
            zIndex: 1,
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          {number}
        </span>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="svc-img"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .6s cubic-bezier(.34,1.56,.64,1)",
            }}
          />
        ) : (
          /* Fallback Icon Design */
          <div style={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            position: "relative",
            zIndex: 2
          }}>
            <div
              className="svc-icon-fallback"
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: "linear-gradient(135deg, rgba(37,99,235,.1), rgba(59,130,246,.05))",
                color: "var(--accent-h)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
              }}
            >
              <i className={`bi ${icon}`} />
            </div>
          </div>
        )}
        
        {/* Gradient Overlay for Image Text Readability */}
        {imageUrl && (
           <div style={{
             position: "absolute",
             bottom: 0,
             left: 0,
             width: "100%",
             height: "50%",
             background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
             zIndex: 2
           }} />
        )}
      </div>

      {/* Content Section */}
      <div style={{ position: "relative", zIndex: 3, flexGrow: 1, display: "flex", flexDirection: "column", padding: "1.75rem 1.75rem 1.5rem", background: "var(--surface)" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            margin: "0 0 .65rem",
          }}
        >
          {service.name}
        </h3>
        <p
          style={{
            fontSize: ".95rem",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: "0 0 1.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          {service.short_description || "Learn how we can help your business."}
        </p>

        {/* Footer with CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border)",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              fontSize: ".95rem",
              fontWeight: 700,
              color: "var(--accent-h)",
            }}
          >
            {service.cta_text || "Learn more"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--bg-alt)",
              color: "var(--text)",
              fontSize: "1rem",
              transition: "all .3s ease",
            }}
          >
            <i className="bi bi-arrow-right" />
          </span>
        </div>
      </div>
    </Link>
  );
}