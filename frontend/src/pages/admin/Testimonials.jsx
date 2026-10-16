import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/admin/Modal.jsx";
import ImageUpload from "../../components/admin/ImageUpload.jsx";

const EMPTY = {
  id: null,
  client_name: "",
  client_role: "",
  company: "",
  message: "",
  avatar_path: "",
  status: "draft",
};

export default function AdminTestimonials() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "",
    search: "",
  });
  const [modal, setModal] = useState({ open: false, mode: "create", form: EMPTY });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async (overrides = {}) => {
    const page = overrides.page ?? state.page;
    const status = overrides.status ?? state.status;
    const search = overrides.search ?? state.search;
    setState((s) => ({ ...s, loading: true, error: null, page, status, search }));
    try {
      const r = await api.get("/admin/testimonials", {
        params: { page, per_page: 10, status, search },
      });
      const d = r.data.data;
      setState((s) => ({
        ...s,
        loading: false,
        items: d.items,
        total: d.total,
        totalPages: d.total_pages,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setModalError(null);
    setModal({ open: true, mode: "create", form: { ...EMPTY } });
  };

  const openEdit = async (id) => {
    setModalError(null);
    try {
      const r = await api.get("/admin/testimonials/" + id);
      const t = r.data.data;
      setModal({
        open: true,
        mode: "edit",
        form: {
          id: t.id,
          client_name: t.client_name || "",
          client_role: t.client_role || "",
          company: t.company || "",
          message: t.message || "",
          avatar_path: t.avatar_path || "",
          status: t.status || "draft",
        },
      });
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const save = async () => {
    setModalError(null);
    const f = modal.form;
    if (!f.client_name.trim()) {
      setModalError("Client name is required");
      return;
    }
    if (!f.message.trim()) {
      setModalError("Message is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        client_name: f.client_name.trim(),
        client_role: f.client_role.trim(),
        company: f.company.trim(),
        message: f.message.trim(),
        avatar_path: f.avatar_path.trim(),
        status: f.status,
      };
      if (modal.mode === "create") {
        await api.post("/admin/testimonials", payload);
        showToast("Testimonial created");
      } else {
        await api.put("/admin/testimonials/" + f.id, payload);
        showToast("Testimonial updated");
      }
      setModal({ open: false, mode: "create", form: EMPTY });
      load();
    } catch (e) {
      setModalError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch("/admin/testimonials/" + id + "/status", { status });
      showToast("Status changed to " + status);
      load();
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const doDelete = async () => {
    try {
      await api.delete("/admin/testimonials/" + confirm.id);
      showToast("Testimonial deleted");
      setConfirm({ open: false, id: null, name: "" });
      load();
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const badgeClass = (s) =>
    s === "published" ? "badge-published" :
    s === "on_hold" ? "badge-on_hold" :
    "badge-draft";

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  const previewImage = (path) =>
    path ? `${API_BASE}/public/media/${path.replace(/^media\//, "")}` : null;

  return (
    <div>
      {toast && (
        <div className={"alert alert-" + toast.type + " position-fixed"}
          style={{ top: 80, right: 20, zIndex: 2100, minWidth: 240 }}>
          {toast.msg}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Testimonials</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            {state.total} total
          </p>
        </div>
        <button className="btn btn-lime" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add Testimonial
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <form onSubmit={(e) => { e.preventDefault(); load({ page: 1 }); }} className="d-flex gap-2">
            <input className="form-control" placeholder="Search testimonials..."
              value={state.search}
              onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))} />
            <button className="btn btn-dark-ghost" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={state.status}
            onChange={(e) => load({ page: 1, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      {state.loading ? (
        <Loader />
      ) : state.items.length === 0 ? (
        <EmptyState icon="bi-chat-quote" title="No testimonials"
          message="Click Add Testimonial to create one." />
      ) : (
        <>
          <div className="card-clean" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Avatar</th>
                    <th>Client</th>
                    <th>Company</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.avatar_path ? (
                          <img
                            src={previewImage(t.avatar_path)}
                            alt={t.client_name}
                            style={{
                              width: 44, height: 44, objectFit: "cover",
                              borderRadius: "50%", border: "1px solid var(--border)",
                            }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44, height: 44, borderRadius: "50%",
                              background: "var(--accent-soft)",
                              color: "var(--accent-h)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: ".9rem",
                            }}
                          >
                            {t.client_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{t.client_name}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                          {t.client_role || "—"}
                        </div>
                      </td>
                      <td style={{ fontSize: ".85rem" }}>{t.company || "—"}</td>
                      <td style={{ fontSize: ".8rem", maxWidth: 280 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.message}
                        </div>
                      </td>
                      <td>
                        <span className={"badge-status " + badgeClass(t.status)}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button className="btn btn-sm btn-dark-ghost"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem" }}
                            onClick={() => openEdit(t.id)}>
                            <i className="bi bi-pencil" /> Edit
                          </button>
                          {t.status !== "published" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#DCFCE7", color: "#166534", border: 0 }}
                              onClick={() => changeStatus(t.id, "published")} title="Publish">
                              <i className="bi bi-eye" />
                            </button>
                          )}
                          {t.status !== "draft" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#E5E7EB", color: "#374151", border: 0 }}
                              onClick={() => changeStatus(t.id, "draft")} title="Draft">
                              <i className="bi bi-eye-slash" />
                            </button>
                          )}
                          {t.status !== "on_hold" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEF3C7", color: "#92400E", border: 0 }}
                              onClick={() => changeStatus(t.id, "on_hold")} title="On Hold">
                              <i className="bi bi-pause" />
                            </button>
                          )}
                          <button className="btn btn-sm"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEE2E2", color: "#991B1B", border: 0 }}
                            onClick={() => setConfirm({ open: true, id: t.id, name: t.client_name })} title="Delete">
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {state.totalPages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                {Array.from({ length: state.totalPages }, (_, i) => i + 1).map((n) => (
                  <li key={n} className={"page-item " + (n === state.page ? "active" : "")}>
                    <button className="page-link" onClick={() => load({ page: n })}>{n}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}

      <Modal open={modal.open}
        title={modal.mode === "create" ? "Add Testimonial" : "Edit Testimonial"}
        onClose={() => setModal({ open: false, mode: "create", form: EMPTY })}
        size="lg"
        footer={
          <>
            <button className="btn btn-dark-ghost"
              onClick={() => setModal({ open: false, mode: "create", form: EMPTY })}>
              Cancel
            </button>
            <button className="btn btn-lime" onClick={save} disabled={saving}>
              {saving ? "Saving..." : modal.mode === "create" ? "Create" : "Save Changes"}
            </button>
          </>
        }>
        {modalError && <div className="alert alert-danger">{modalError}</div>}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold">Client Name *</label>
            <input className="form-control" value={modal.form.client_name}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, client_name: e.target.value } }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">Role / Title</label>
            <input className="form-control" placeholder="e.g. CTO" value={modal.form.client_role}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, client_role: e.target.value } }))} />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold">Company</label>
            <input className="form-control" placeholder="e.g. Finlytics" value={modal.form.company}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, company: e.target.value } }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">Status</label>
            <select className="form-select" value={modal.form.status}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, status: e.target.value } }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="col-12">
            <ImageUpload
              label="Client Avatar (optional)"
              value={modal.form.avatar_path}
              onChange={(path) =>
                setModal((m) => ({ ...m, form: { ...m.form, avatar_path: path } }))
              }
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">Message *</label>
            <textarea className="form-control" rows={5}
              placeholder="What the client said about your company..."
              value={modal.form.message}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, message: e.target.value } }))} />
          </div>
        </div>
      </Modal>

      <Modal open={confirm.open}
        title="Delete testimonial?"
        onClose={() => setConfirm({ open: false, id: null, name: "" })}
        size="sm"
        footer={
          <>
            <button className="btn btn-dark-ghost"
              onClick={() => setConfirm({ open: false, id: null, name: "" })}>Cancel</button>
            <button className="btn btn-lime"
              style={{ background: "#DC2626", borderColor: "#DC2626" }}
              onClick={doDelete}>Delete</button>
          </>
        }>
        <p className="mb-0">Are you sure you want to delete testimonial from <strong>{confirm.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}