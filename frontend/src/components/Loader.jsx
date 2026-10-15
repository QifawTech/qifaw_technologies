export default function Loader({ label = "Loading..." }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border text-success me-2" role="status" />
      <span className="text-muted">{label}</span>
    </div>
  );
}