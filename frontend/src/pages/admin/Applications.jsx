import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/admin/Modal.jsx";

export default function AdminApplications() {
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
  const [detail, setDetail] = useState({ open: false, item: null });
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
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
      const r = await api.get("/admin/applications", {
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

  const openDetail = async (id) => {
    try {
      const r = await api.get("/admin/applications/" + id);
      setDetail({ open: true, item: r.data.data });
      setNotes(r.data.data.notes || "");
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch("/admin/applications/" + id + "/status", { status });
      showToast("Status changed to " + status);
      load();
      if (detail.open && detail.item?.id === id) {
        setDetail((d) => ({ ...d, item: { ...d.item, status } }));
      }
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const saveNotes = async () => {
    if (!detail.item) return;
    setSavingNotes(true);
    try {
      await api.patch("/admin/applications/" + detail.item.id + "/notes", { notes });
      showToast("Notes saved");
    } catch (e) {
      showToast(e.message, "danger");
    } finally {
      setSavingNotes(false);
    }
  };

  // ✅ SIMPLE: Direct browser navigation — browser handles everything
  const downloadResume = (id) => {
    const baseURL = api.defaults.baseURL; // http://localhost:5000/api/v1
    const url = `${baseURL}/admin/applications/${id}/resume`;
    window.open(url, "_blank");
  };

  const badgeClass = (s) => {
    const map = {
      New: "badge-draft",
      Reviewing: "badge-on_hold",
      Shortlisted: "badge-published",
      Rejected: "badge-closed",
      Hired: "badge-published",
    };
    return map[s] || "badge-draft";
  };

  return (
    <div>
      {toast && (
        <div
          className={"alert alert-" + toast.type + " position-fixed"}
          style={{ top: 80, right: 20, zIndex: 2100, minWidth: 240 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Applications</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            {state.total} total
          </p>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load({ page: 1 });
            }}
            className="d-flex gap-2"
          >
            <input
              className="form-control"
              placeholder="Search by name or email..."
              value={state.search}
              onChange={(e) =>
                setState((s) => ({ ...s, search: e.target.value }))
              }
            />
            <button className="btn btn-dark-ghost" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={state.status}
            onChange={(e) => load({ page: 1, status: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      {state.loading ? (
        <Loader />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-person"
          title="No applications yet"
          message="Applications will appear here when candidates apply."
        />
      ) : (
        <>
          <div className="card-clean" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th style={{ width: 260 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="fw-semibold">{a.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                          {a.email}
                        </div>
                      </td>
                      <td style={{ fontSize: ".85rem" }}>{a.job_title || "—"}</td>
                      <td style={{ fontSize: ".85rem" }}>{a.phone || "—"}</td>
                      <td>
                        <span className={"badge-status " + badgeClass(a.status)}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button
                            className="btn btn-sm btn-dark-ghost"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem" }}
                            onClick={() => openDetail(a.id)}
                          >
                            <i className="bi bi-eye" /> View
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              padding: ".25rem .55rem",
                              fontSize: ".75rem",
                              background: "#DBEAFE",
                              color: "#1E40AF",
                              border: 0,
                            }}
                            onClick={() => downloadResume(a.id)}
                            title="Open / Download resume"
                          >
                            <i className="bi bi-download" />
                          </button>
                          <select
                            className="form-select form-select-sm"
                            style={{
                              width: "auto",
                              fontSize: ".75rem",
                              padding: ".2rem .4rem",
                            }}
                            value={a.status}
                            onChange={(e) => changeStatus(a.id, e.target.value)}
                          >
                            <option value="New">New</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
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
                {Array.from({ length: state.totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <li
                      key={n}
                      className={
                        "page-item " + (n === state.page ? "active" : "")
                      }
                    >
                      <button
                        className="page-link"
                        onClick={() => load({ page: n })}
                      >
                        {n}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          )}
        </>
      )}

      <Modal
        open={detail.open}
        title="Application Details"
        onClose={() => setDetail({ open: false, item: null })}
        size="lg"
        footer={
          <>
            <button
              className="btn btn-dark-ghost"
              onClick={() => setDetail({ open: false, item: null })}
            >
              Close
            </button>
            <button
              className="btn btn-lime"
              onClick={() => downloadResume(detail.item?.id)}
            >
              <i className="bi bi-download me-1" /> Open / Download Resume
            </button>
          </>
        }
      >
        {detail.item && (
          <div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Name</label>
                <div>{detail.item.name}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Email</label>
                <div>
                  <a href={`mailto:${detail.item.email}`}>{detail.item.email}</a>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Phone</label>
                <div>{detail.item.phone}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Applied For</label>
                <div>{detail.item.job_title || "—"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Applied On</label>
                <div>{new Date(detail.item.created_at).toLocaleString()}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Current Status
                </label>
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={detail.item.status}
                    onChange={(e) =>
                      changeStatus(detail.item.id, e.target.value)
                    }
                    style={{ maxWidth: 200 }}
                  >
                    <option value="New">New</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>
            </div>

            <hr />

            <label className="form-label small fw-semibold">Notes</label>
            <textarea
              className="form-control"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this candidate..."
            />
            <div className="mt-2">
              <button
                className="btn btn-lime btn-sm"
                onClick={saveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}