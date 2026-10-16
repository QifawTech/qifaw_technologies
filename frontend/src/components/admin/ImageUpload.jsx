import { useRef, useState } from "react";
import api from "../../api/client.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const previewUrl = value
    ? value.startsWith("http")
      ? value
      : `${API_BASE}/public/media/${value.replace(/^media\//, "")}`
    : null;

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) {
      setError("Only PNG, JPG, JPEG, WEBP, SVG allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size 5MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.post("/admin/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const path = r.data?.data?.path;
      if (path) onChange(path);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange("");
    setError(null);
  };

  return (
    <div>
      <label className="form-label small fw-semibold">{label}</label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: 12,
          padding: "1rem",
          background: "var(--bg-alt)",
          transition: "border-color .2s ease, background .2s ease",
        }}
      >
        {previewUrl ? (
          <div className="d-flex align-items-center gap-3">
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid var(--border)",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div
                className="small fw-semibold"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {value}
              </div>
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-lime"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  <i className="bi bi-arrow-repeat me-1" /> Change
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-dark-ghost"
                  onClick={handleClear}
                >
                  <i className="bi bi-x-lg me-1" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <i
              className="bi bi-cloud-arrow-up"
              style={{ fontSize: 28, color: "var(--accent)" }}
            />
            <div className="small mt-2" style={{ color: "var(--muted)" }}>
              Click to upload or drag &amp; drop
            </div>
            <button
              type="button"
              className="btn btn-lime btn-sm mt-3"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" /> Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1" /> Choose File
                </>
              )}
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="small mt-2" style={{ color: "#DC2626" }}>
          <i className="bi bi-exclamation-circle me-1" /> {error}
        </div>
      )}
    </div>
  );
}