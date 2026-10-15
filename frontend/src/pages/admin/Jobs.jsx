import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/admin/Modal.jsx";

const EMPTY = {
  id: null,
  title: "",
  slug: "",
  department: "",
  location: "",
  employment_type: "Full-Time",
  work_mode: "On-site",
  eligibility: "",
  description: "",
  skills: "",
  deadline: "",
  status: "draft",
};

export default function AdminJobs() {
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
  const [confirm, setConfirm] = useState({ open: false, id: null, title: "" });
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
      const r = await api.get("/admin/jobs", {
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
      const r = await api.get("/admin/jobs/" + id);
      const j = r.data.data;
      let deadline = "";
      if (j.deadline) {
        const d = new Date(j.deadline);
        deadline = !isNaN(d) ? d.toISOString().slice(0, 10) : "";
      }
      setModal({
        open: true,
        mode: "edit",
        form: {
          id: j.id,
          title: j.title || "",
          slug: j.slug || "",
          department: j.department || "",
          location: j.location || "",
          employment_type: j.employment_type || "Full-Time",
          work_mode: j.work_mode || "On-site",
          eligibility: j.eligibility || "",
          description: j.description || "",
          skills: j.skills || "",
          deadline,
          status: j.status || "draft",
        },
      });
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const save = async () => {
    setModalError(null);
    const f = modal.form;
    if (!f.title.trim()) {
      setModalError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: f.title.trim(),
        slug: f.slug.trim() || undefined,
        department: f.department.trim(),
        location: f.location.trim(),
        employment_type: f.employment_type,
        work_mode: f.work_mode,
        eligibility: f.eligibility.trim(),
        description: f.description.trim(),
        skills: f.skills.trim(),
        deadline: f.deadline || null,
        status: f.status,
      };
      if (modal.mode === "create") {
        await api.post("/admin/jobs", payload);
        showToast("Job created");
      } else {
        await api.put("/admin/jobs/" + f.id, payload);
        showToast("Job updated");
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
      await api.patch("/admin/jobs/" + id + "/status", { status });
      showToast("Status changed to " + status);
      load();
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const doDelete = async () => {
    try {
      await api.delete("/admin/jobs/" + confirm.id);
      showToast("Job deleted");
      setConfirm({ open: false, id: null, title: "" });
      load();
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const badgeClass = (s) =>
    s === "published" ? "badge-published" :
    s === "on_hold" ? "badge-on_hold" :
    s === "closed" ? "badge-closed" :
    "badge-draft";

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
          <h2 className="mb-1">Careers / Jobs</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">{state.total} total</p>
        </div>
        <button className="btn btn-lime" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add Job
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <form onSubmit={(e) => { e.preventDefault(); load({ page: 1 }); }} className="d-flex gap-2">
            <input className="form-control" placeholder="Search jobs..."
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
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      {state.loading ? (
        <Loader />
      ) : state.items.length === 0 ? (
        <EmptyState icon="bi-briefcase" title="No jobs" message="Click Add Job to create one." />
      ) : (
        <>
          <div className="card-clean" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Dept</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ width: 230 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((j) => (
                    <tr key={j.id}>
                      <td>
                        <div className="fw-semibold">{j.title}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>/{j.slug}</div>
                      </td>
                      <td style={{ fontSize: ".85rem" }}>{j.department || "—"}</td>
                      <td style={{ fontSize: ".85rem" }}>{j.location || "—"}</td>
                      <td style={{ fontSize: ".85rem" }}>{j.employment_type || "—"}</td>
                      <td>
                        <span className={"badge-status " + badgeClass(j.status)}>
                          {j.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button className="btn btn-sm btn-dark-ghost"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem" }}
                            onClick={() => openEdit(j.id)}>
                            <i className="bi bi-pencil" /> Edit
                          </button>
                          {j.status !== "published" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#DCFCE7", color: "#166534", border: 0 }}
                              onClick={() => changeStatus(j.id, "published")} title="Publish">
                              <i className="bi bi-eye" />
                            </button>
                          )}
                          {j.status !== "closed" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEE2E2", color: "#991B1B", border: 0 }}
                              onClick={() => changeStatus(j.id, "closed")} title="Close">
                              <i className="bi bi-lock" />
                            </button>
                          )}
                          {j.status !== "on_hold" && (
                            <button className="btn btn-sm"
                              style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEF3C7", color: "#92400E", border: 0 }}
                              onClick={() => changeStatus(j.id, "on_hold")} title="On Hold">
                              <i className="bi bi-pause" />
                            </button>
                          )}
                          <button className="btn btn-sm"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem", background: "#FEE2E2", color: "#991B1B", border: 0 }}
                            onClick={() => setConfirm({ open: true, id: j.id, title: j.title })} title="Delete">
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
        title={modal.mode === "create" ? "Add Job" : "Edit Job"}
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
          <div className="col-md-8">
            <label className="form-label small fw-semibold">Title *</label>
            <input className="form-control" value={modal.form.title}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, title: e.target.value } }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Department</label>
            <input className="form-control" placeholder="e.g. Engineering" value={modal.form.department}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, department: e.target.value } }))} />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold">Location</label>
            <input className="form-control" placeholder="e.g. Bangalore" value={modal.form.location}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, location: e.target.value } }))} />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Employment Type</label>
            <select className="form-select" value={modal.form.employment_type}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, employment_type: e.target.value } }))}>
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Work Mode</label>
            <select className="form-select" value={modal.form.work_mode}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, work_mode: e.target.value } }))}>
              <option>On-site</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">Eligibility</label>
            <input className="form-control" placeholder="e.g. 3+ years experience"
              value={modal.form.eligibility}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, eligibility: e.target.value } }))} />
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">Skills</label>
            <input className="form-control" placeholder="React, Node, MySQL"
              value={modal.form.skills}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, skills: e.target.value } }))} />
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">Description</label>
            <textarea className="form-control" rows={5} value={modal.form.description}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold">Deadline</label>
            <input type="date" className="form-control" value={modal.form.deadline}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, deadline: e.target.value } }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Status</label>
            <select className="form-select" value={modal.form.status}
              onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, status: e.target.value } }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_hold">On Hold</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={confirm.open}
        title="Delete job?"
        onClose={() => setConfirm({ open: false, id: null, title: "" })}
        size="sm"
        footer={
          <>
            <button className="btn btn-dark-ghost"
              onClick={() => setConfirm({ open: false, id: null, title: "" })}>Cancel</button>
            <button className="btn btn-lime"
              style={{ background: "#DC2626", borderColor: "#DC2626" }}
              onClick={doDelete}>Delete</button>
          </>
        }>
        <p className="mb-0">Are you sure you want to delete <strong>{confirm.title}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}