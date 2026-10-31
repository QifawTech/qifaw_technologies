import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Image URL Helper
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/public/media/${imagePath.replace(/^media\//, "")}`;
};

export default function TestimonialCard({ testimonial }) {
  const [hovered, setHovered] = useState(false);
  const t = testimonial;
  
  // ⚡ FIX: API keys-ku thakka maari client_name & avatar_path use pandrom
  const initial = (t.client_name || "?").charAt(0).toUpperCase();
  const avatarUrl = getImageUrl(t.avatar_path); 
  const rating = t.rating || 5;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "2rem 1.85rem 1.65rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        transition:
          "transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease, border-color .3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        borderColor: hovered ? "rgba(37,99,235,.4)" : "var(--border)",
        boxShadow: hovered ? "0 24px 52px rgba(37,99,235,.14)" : "none",
      }}
    >
      {/* Decorative quote */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.75rem",
          fontSize: "4rem",
          lineHeight: 1,
          fontFamily: "Georgia, serif",
          color: "var(--bg-alt)",
          transition: "color .35s ease",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        ”
      </div>

      {/* Stars - Dynamic Rating */}
      <div
        style={{
          display: "flex",
          gap: "3px",
          marginBottom: "1.15rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`bi ${i < rating ? "bi-star-fill" : "bi-star"}`}
            style={{ fontSize: ".85rem", color: i < rating ? "#F59E0B" : "var(--border)" }}
          />
        ))}
      </div>

      {/* Message */}
      <p
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: ".95rem",
          lineHeight: 1.7,
          color: "var(--text-soft)",
          margin: "0 0 1.75rem",
          flexGrow: 1,
          fontStyle: "italic",
        }}
      >
        "{t.message}"
      </p>

      {/* Author */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".9rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Image or Initial */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={t.client_name}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "2px solid var(--bg-alt)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform .4s cubic-bezier(.34,1.56,.64,1)",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.1rem",
              flexShrink: 0,
              boxShadow: "0 6px 18px rgba(37,99,235,.3)",
              transition: "transform .4s cubic-bezier(.34,1.56,.64,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          >
            {initial}
          </div>
        )}
        
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: ".94rem",
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {t.client_name}
          </div>
          <div
            style={{
              fontSize: ".78rem",
              color: "var(--muted)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t.client_role}
            {t.company && ` · ${t.company}`}
          </div>
        </div>
      </div>
    </article>
  );
}