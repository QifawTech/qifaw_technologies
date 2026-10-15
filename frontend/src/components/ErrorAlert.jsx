export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger d-flex align-items-center">
      <i className="bi bi-exclamation-triangle-fill me-2" />
      <div className="flex-grow-1">{message}</div>
      {onClose && <button className="btn-close" onClick={onClose} />}
    </div>
  );
}
