export default function SectionHeading({ eyebrow, title, description, center }) {
  return (
    <div className={`mb-5 ${center ? "text-center" : ""}`}>
      {eyebrow && <div className="text-uppercase fw-bold small mb-2" style={{ color: "#5A6B14", letterSpacing: "0.12em" }}>{eyebrow}</div>}
      <h2 className="mb-3">{title}</h2>
      {description && <p className={`text-muted ${center ? "mx-auto" : ""}`} style={{ maxWidth: 620 }}>{description}</p>}
    </div>
  );
}
