export default function EmptyState({ icon = "bi-inbox", title = "Nothing here yet", message = "Check back soon." }) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon}`} style={{ fontSize: "3rem", color: "#9CA3AF" }} />
      <h5 className="mt-3 mb-1">{title}</h5>
      <p className="text-muted mb-0">{message}</p>
    </div>
  );
}
