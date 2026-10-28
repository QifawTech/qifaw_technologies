import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/admin/Modal.jsx";
import ImageUpload from "../../components/admin/ImageUpload.jsx";

const EMPTY = {
  id: null,
  name: "",
  slug: "",
  short_description: "",
  description: "",
  category: "",
  demo_url: "",
  image_path: "",
  features: "",
  status: "draft",
};

export default function AdminProducts() {
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
      const r = await api.get("/admin/products", {
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
      const r = await api.get("/admin/products/" + id);
      const p = r.data.data;
      let features = "";
      if (Array.isArray(p.features)) features = p.features.join("\n");
      else if (typeof p.features === "string") features = p.features;
      setModal({
        open: true,
        mode: "edit",
        form: {
          id: p.id,
          name: p.name || "",
          slug: p.slug || "",
          short_description: p.short_description || "",
          description: p.description || "",
          category: p.category || "",
          demo_url: p.demo_url || "",
          image_path: p.image_path || "",
          features,
          status: p.status || "draft",
        },
      });
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const save = async () => {
    setModalError(null);
    const f = modal.form;
    if (!f.name.trim()) {
      setModalError("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: f.name.trim(),
        slug: f.slug.trim() || undefined,
        short_description: f.short_description.trim(),
        description: f.description.trim(),
        category: f.category.trim(),
        demo_url: f.demo_url.trim(),
        image_path: f.image_path.trim(),
        features: f.features.split("\n").map((x) => x.trim()).filter(Boolean),
        status: f.status,
      };
      if (modal.mode === "create") {
        await api.post("/admin/products", payload);
        showToast("Product created");
      } else {
        await api.put("/admin/products/" + f.id, payload);
        showToast("Product updated");
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
      await api.patch("/admin/products/" + id + "/status", { status });
      showToast("Status changed to " + status);
      load();
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const doDelete = async () => {
    try {
      await api.delete("/admin/products/" + confirm.id);
      showToast("Product deleted");
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
          <h2 className="mb-1">Products</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">{state.total} total</p>
        </div>
        <button className="btn btn-lime" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add Product
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <form onSubmit={(e) => { e.preventDefault(); load({ page: 1 }); }} className="d-flex gap-2">
            <input className="form-control" placeholder="Search products..."
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
        <EmptyState icon="bi-box-seam" title="No products" message="Click Add Product to create one." />
      ) : (
        <>
          <div className="card-clean" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image_path ? (
                          <img
                            src={previewImage(p.image_path)}
                            alt={p.name}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                            }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: "var(--accent-soft)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i className="bi bi-image" style={{ color: "var(--accent)" }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>/products/{p.slug}</div>
                      </td>
                      <td>{p.category || "—"}</td>
                      <td>
                        <span className={"badge-status " + badgeClass(p.status)}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* 1. Edit Button */}
                          <button className="btn btn-sm btn-dark-ghost"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem" }}
                            onClick={() => openEdit(p.id)}>
                            <i className="bi bi-pencil" /> Edit
                          </button>
                          
                          {/* 2. Pause (Hold) Button */}
                          {p.status !== "on_hold" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEF3C7", color: "#92400E", border: 0 }}
                              onClick={() => changeStatus(p.id, "on_hold")} title="Put on Hold">
                              <i className="bi bi-pause" />
                            </button>
                          )}

                          {/* 3. Unpause (Unhold) Button */}
                          {p.status === "on_hold" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#DCFCE7", color: "#166534", border: 0 }}
                              onClick={() => changeStatus(p.id, "published")} title="Remove Hold">
                              <i className="bi bi-play" />
                            </button>
                          )}

                          {/* 4. Delete Button */}
                          <button className="btn btn-sm"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEE2E2", color: "#991B1B", border: 0 }}
                            onClick={() => setConfirm({ open: true, id: p.id, name: p.name })} title="Delete">
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

      {/* ⚡ MUKKIYAM: Inga `closeOnClickOutside={false}` add pannirukken */}
      <Modal 
        open={modal.open}
        title={modal.mode === "create" ? "Add Product" : "Edit Product"}
        onClose={() => setModal({ open: false, mode: "create", form: EMPTY })}
        closeOnClickOutside={false}
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
          <div className="col-md-8">
            <label className="form-label small fw-semibold">Name *</label>
            <input className="form-control" value={modal.form.name}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Category</label>
            <input className="form-control" placeholder="e.g. CRM" value={modal.form.category}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, category: e.target.value } }))} />
          </div>

          <div className="col-12">
            <ImageUpload
              label="Product Image"
              value={modal.form.image_path}
              onChange={(path) =>
                setModal((m) => ({ ...m, form: { ...m.form, image_path: path } }))
              }
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">Short description</label>
            <input className="form-control" placeholder="One line summary" value={modal.form.short_description}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, short_description: e.target.value } }))} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Full description</label>
            <textarea className="form-control" rows={4} value={modal.form.description}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Features (one per line)</label>
            <textarea className="form-control" rows={4}
              placeholder={"Sales pipeline automation\nTeam collaboration\nAdvanced reporting"}
              value={modal.form.features}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, features: e.target.value } }))} />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold">Demo URL</label>
            <input className="form-control" placeholder="https://..." value={modal.form.demo_url}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, demo_url: e.target.value } }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Status</label>
            <select className="form-select" value={modal.form.status}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, status: e.target.value } }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={confirm.open}
        title="Delete product?"
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
        <p className="mb-0">Are you sure you want to delete <strong>{confirm.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}