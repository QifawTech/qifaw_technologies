import { Link } from "react-router-dom";

// Badge color mapping
const getTypeBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("internship"))
    return { bg: "rgba(16,185,129,.12)", color: "#059669", icon: "bi-mortarboard" };
  if (t.includes("part"))
    return { bg: "rgba(245,158,11,.14)", color: "#B45309", icon: "bi-clock-history" };
  if (t.includes("contract"))
    return { bg: "rgba(139,92,246,.14)", color: "#6D28D9", icon: "bi-file-earmark-text" };
  return { bg: "rgba(37,99,235,.12)", color: "#1D4ED8", icon: "bi-briefcase" };
};

export default function JobCard({ job }) {
  const typeBadge = getTypeBadge(job.employment_type);

  return (
    <Link
      to={`/careers/${job.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "1.6rem 1.5rem 1.4rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        textDecoration: "none",
        color: "inherit",
        transition:
          "transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease, border-color .3s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = "rgba(37,99,235,.4)";
        e.currentTarget.style.boxShadow = "0 22px 48px rgba(37,99,235,.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top: Type badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".35rem",
            padding: ".35rem .75rem",
            background: typeBadge.bg,
            color: typeBadge.color,
            fontSize: ".68rem",
            fontWeight: 800,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            borderRadius: 999,
          }}
        >
          <i className={`bi ${typeBadge.icon}`} />
          {job.employment_type}
        </span>

        {job.work_mode && (
          <span
            style={{
              fontSize: ".72rem",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            {job.work_mode}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          margin: "0 0 .35rem",
        }}
      >
        {job.title}
      </h3>

      {/* Department */}
      {job.department && (
        <div
          style={{
            fontSize: ".82rem",
            color: "var(--muted)",
            marginBottom: ".85rem",
            fontWeight: 600,
          }}
        >
          {job.department}
        </div>
      )}

      {/* Meta: location + deadline */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".65rem",
          marginTop: "auto",
          paddingTop: "1rem",
          marginBottom: "1.1rem",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".35rem",
            fontSize: ".82rem",
            color: "var(--text-soft)",
            fontWeight: 500,
          }}
        >
          <i
            className="bi bi-geo-alt"
            style={{ color: "var(--accent-h)", fontSize: ".9rem" }}
          />
          {job.location || "Remote"}
        </span>

        {job.deadline && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".35rem",
              fontSize: ".82rem",
              color: "var(--text-soft)",
              fontWeight: 500,
            }}
          >
            <i
              className="bi bi-calendar-event"
              style={{ color: "var(--accent-h)", fontSize: ".9rem" }}
            />
            {new Date(job.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>

      {/* Footer: CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "1.1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: ".88rem",
            fontWeight: 700,
            color: "var(--accent-h)",
          }}
        >
          View & Apply
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--accent-soft)",
            color: "var(--accent-h)",
            fontSize: ".85rem",
          }}
        >
          <i className="bi bi-arrow-right" />
        </span>
      </div>
    </Link>
  );
}