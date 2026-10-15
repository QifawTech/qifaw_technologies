import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export default function ProductCard({ product }) {
  const img = product.image_path
    ? `${API_BASE}/public/media/${product.image_path.replace(/^media\//, "")}`
    : null;

  return (
    <Link
      to={`/products/${product.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "transform .35s ease, box-shadow .35s ease, border-color .3s ease",
        minHeight: 420,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = "rgba(37,99,235,.4)";
        e.currentTarget.style.boxShadow = "0 24px 56px rgba(37,99,235,.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* ═══ MEDIA ═══ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 220,
          flexShrink: 0,
          overflow: "hidden",
          background: "#0F172A",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={product.name}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #1E3A8A 100%)",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 20,
                background: "rgba(96,165,250,.14)",
                border: "1.5px solid rgba(96,165,250,.4)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="bi bi-box-seam"
                style={{ fontSize: "2rem", color: "#93C5FD" }}
              />
            </div>
          </div>
        )}

        {product.category && (
          <span
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              padding: ".4rem .85rem",
              background: "rgba(255,255,255,.95)",
              backdropFilter: "blur(10px)",
              color: "#1E40AF",
              fontSize: ".68rem",
              fontWeight: 800,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              borderRadius: 999,
              zIndex: 2,
              boxShadow: "0 6px 16px rgba(0,0,0,.15)",
            }}
          >
            {product.category}
          </span>
        )}
      </div>

      {/* ═══ BODY ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "1.5rem 1.5rem 1.35rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-.02em",
            lineHeight: 1.3,
            margin: "0 0 .5rem",
          }}
        >
          {product.name}
        </h3>
        <p
          style={{
            fontSize: ".88rem",
            lineHeight: 1.6,
            color: "var(--muted)",
            margin: "0 0 1.5rem",
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.short_description || "Explore this product"}
        </p>

        {/* ═══ ACTION ═══ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: ".75rem",
            paddingTop: "1.1rem",
            borderTop: "1px solid var(--border)",
            fontSize: ".88rem",
            fontWeight: 700,
            color: "var(--text)",
            marginTop: "auto",
          }}
        >
          <span>View Details</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--bg-alt)",
              color: "var(--accent-h)",
              fontSize: ".9rem",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-arrow-right" />
          </span>
        </div>
      </div>
    </Link>
  );
}