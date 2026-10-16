import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi } from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import ProductCard from "../../components/ProductCard.jsx";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function ProductDetails() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, product: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, product: null });
    publicApi
      .getProduct(slug)
      .then((res) =>
        !cancelled &&
        setState({ loading: false, error: null, product: res.data.data })
      )
      .catch((e) =>
        !cancelled &&
        setState({ loading: false, error: e.message, product: null })
      );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.loading) return <Loader />;
  if (state.error)
    return (
      <div className="container py-5">
        <ErrorAlert message={state.error} />
      </div>
    );
  if (!state.product) return null;

  const p = state.product;
  const img = p.image_path
    ? `${API_BASE}/public/media/${p.image_path.replace(/^media\//, "")}`
    : null;

  let features = [];
  if (Array.isArray(p.features)) features = p.features;
  else if (typeof p.features === "string") {
    try {
      features = JSON.parse(p.features);
    } catch {
      features = [];
    }
  }

  return (
    <section
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        paddingTop: "2rem",
        paddingBottom: "5rem",
      }}
    >
      <div className="container">
        {/* ═══ BREADCRUMB ═══ */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            fontSize: ".82rem",
            color: "var(--muted)",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={{ color: "var(--muted)" }}>
            Home
          </Link>
          <i className="bi bi-chevron-right" style={{ fontSize: ".7rem" }} />
          <Link to="/products" style={{ color: "var(--muted)" }}>
            Products
          </Link>
          <i className="bi bi-chevron-right" style={{ fontSize: ".7rem" }} />
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</span>
        </nav>

        {/* ═══ MAIN GRID ═══ */}
        <div className="row g-5 align-items-start">
          {/* ═══ LEFT: IMAGE ═══ */}
          <div className="col-lg-6">
            <div
              style={{
                position: "sticky",
                top: 110,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(15,23,42,.08)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  background:
                    "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
                  overflow: "hidden",
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(circle at 30% 40%, rgba(96,165,250,.35), transparent 55%), radial-gradient(circle at 70% 60%, rgba(59,130,246,.28), transparent 55%)",
                        animation: "pcardGlow 7s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 26,
                          background: "rgba(96,165,250,.16)",
                          border: "1.5px solid rgba(96,165,250,.4)",
                          backdropFilter: "blur(12px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 12px 32px rgba(96,165,250,.25)",
                        }}
                      >
                        <i
                          className="bi bi-box-seam"
                          style={{ fontSize: "2.8rem", color: "#93C5FD" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {p.category && (
                  <span
                    style={{
                      position: "absolute",
                      top: "1.15rem",
                      left: "1.15rem",
                      padding: ".45rem .9rem",
                      background: "rgba(255,255,255,.95)",
                      backdropFilter: "blur(14px)",
                      color: "#1E40AF",
                      fontSize: ".7rem",
                      fontWeight: 800,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      boxShadow: "0 8px 20px rgba(0,0,0,.18)",
                      zIndex: 2,
                    }}
                  >
                    {p.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: DETAILS ═══ */}
          <div className="col-lg-6">
            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.1,
                color: "var(--text)",
                margin: "0 0 1rem",
              }}
            >
              {p.name}
            </h1>

            {/* Short desc */}
            {p.short_description && (
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  color: "var(--text-soft)",
                  margin: "0 0 2rem",
                }}
              >
                {p.short_description}
              </p>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "1.75rem 1.5rem",
                  marginBottom: "1.75rem",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".6rem",
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                    margin: "0 0 1.25rem",
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,.15), rgba(59,130,246,.06))",
                      color: "var(--accent-h)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: ".95rem",
                    }}
                  >
                    <i className="bi bi-stars" />
                  </span>
                  Key Features
                </h3>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: ".85rem",
                  }}
                >
                  {features.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: ".7rem",
                        fontSize: ".92rem",
                        color: "var(--text)",
                        lineHeight: 1.5,
                      }}
                    >
                      <i
                        className="bi bi-check-circle-fill"
                        style={{
                          color: "#10B981",
                          fontSize: "1rem",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <span>
                        {typeof f === "string" ? f : f.text || f.name || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".85rem" }}>
              {p.demo_url && (
                <a
                  href={p.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".55rem",
                    padding: ".9rem 1.75rem",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF",
                    border: 0,
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: ".92rem",
                    textDecoration: "none",
                    boxShadow: "0 10px 30px rgba(37,99,235,.35)",
                    transition: "transform .3s ease, box-shadow .3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 40px rgba(37,99,235,.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 30px rgba(37,99,235,.35)";
                  }}
                >
                  <i className="bi bi-box-arrow-up-right" /> Live Demo
                </a>
              )}

              <Link
                to="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".55rem",
                  padding: ".9rem 1.75rem",
                  background: "transparent",
                  color: "var(--text)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: ".92rem",
                  textDecoration: "none",
                  transition: "all .3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent-h)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i className="bi bi-chat-dots" /> Request Info
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ DESCRIPTION ═══ */}
        {p.description && (
          <div
            style={{
              marginTop: "4rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem 1.75rem",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.01em",
                margin: "0 0 1.25rem",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,.15), rgba(59,130,246,.06))",
                  color: "var(--accent-h)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                <i className="bi bi-file-text" />
              </span>
              Description
            </h3>
            <p
              style={{
                fontSize: ".98rem",
                lineHeight: 1.8,
                color: "var(--text)",
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {p.description}
            </p>
          </div>
        )}

        {/* ═══ RELATED ═══ */}
        {p.related && p.related.length > 0 && (
          <div style={{ marginTop: "4rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".75rem",
                marginBottom: "1.75rem",
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 24,
                  background: "linear-gradient(180deg, #2563EB, #3B82F6)",
                  borderRadius: 4,
                }}
              />
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  color: "var(--text)",
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Related Products
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1.5rem",
                alignItems: "stretch",
              }}
              className="related-grid-inline"
            >
              {p.related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}