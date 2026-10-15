export default function StatusBadge({ status }) {
  const key = (status || "").toLowerCase().replace(/\s+/g, "_");
  const map = {
    published: "badge-published",
    draft: "badge-draft",
    on_hold: "badge-on_hold",
    closed: "badge-closed",
  };
  return (
    <span className={`badge-status ${map[key] || "badge-draft"}`}>
      {status}
    </span>
  );
}