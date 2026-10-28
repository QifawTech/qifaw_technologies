import { useEffect } from "react";

export default function Modal({ 
  open, 
  title, 
  onClose, 
  children, 
  footer, 
  size = "md",
  closeOnClickOutside = true // ⚡ Ithu thaan puthu prop
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1rem",
        overflowY: "auto",
        animation: "fadeIn .2s ease",
      }}
      // ⚡ Ithu thaan mukkiyam: closeOnClickOutside true-ah irundha mattum onClose call aagum
      onClick={closeOnClickOutside ? onClose : undefined}
    >
      <div
        className="card-clean"
        style={{
          width: "100%",
          maxWidth: size === "lg" ? 820 : size === "sm" ? 420 : 620,
          background: "var(--surface)",
          animation: "slideUp .25s cubic-bezier(.22,1,.36,1)",
          marginTop: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="d-flex align-items-center justify-content-between p-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h5 className="mb-0">{title}</h5>
          <button
            className="btn btn-sm"
            onClick={onClose}
            style={{ padding: "2px 8px" }}
            aria-label="Close"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="p-4">{children}</div>

        {footer && (
          <div
            className="d-flex justify-content-end gap-2 p-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}