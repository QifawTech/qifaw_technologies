import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Loader from "../../components/Loader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/admin/Modal.jsx";

export default function AdminEnquiries() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    readFilter: "",
    status: "",
    search: "",
  });
  const [detail, setDetail] = useState({ open: false, item: null });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async (overrides = {}) => {
    const page = overrides.page ?? state.page;
    const readFilter = overrides.readFilter ?? state.readFilter;
    const status = overrides.status ?? state.status;
    const search = overrides.search ?? state.search;

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      page,
      readFilter,
      status,
      search,
    }));

    try {
      const params = { page, per_page: 10, status, search };
      if (readFilter !== "") params.is_read = readFilter === "read" ? 1 : 0;

      const r = await api.get("/admin/enquiries", { params });
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
      const r = await api.get("/admin/enquiries/" + id);
      setDetail({ open: true, item: r.data.data });
      // Refresh list to update read state
      load({ page: state.page });
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const toggleRead = async (id, currentRead) => {
    try {
      await api.patch("/admin/enquiries/" + id + "/read", {
        is_read: currentRead ? 0 : 1,
      });
      showToast(currentRead ? "Marked as unread" : "Marked as read");
      load({ page: state.page });
      if (detail.open && detail.item?.id === id) {
        setDetail((d) => ({ ...d, item: { ...d.item, is_read: currentRead ? 0 : 1 } }));
      }
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch("/admin/enquiries/" + id + "/status", { status });
      showToast("Status changed to " + status);
      load({ page: state.page });
      if (detail.open && detail.item?.id === id) {
        setDetail((d) => ({ ...d, item: { ...d.item, follow_up_status: status } }));
      }
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) return;
    try {
      await api.delete("/admin/enquiries/" + id);
      showToast("Enquiry deleted");
      setDetail({ open: false, item: null });
      load({ page: state.page });
    } catch (e) {
      showToast(e.message, "danger");
    }
  };

  const statusBadge = (s) => {
    const map = {
      New: "badge-draft",
      Contacted: "badge-on_hold",
      Closed: "badge-published",
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
          <h2 className="mb-1">Enquiries</h2>
          <p style={{ color: "var(--muted)" }} className="mb-0 small">
            {state.total} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load({ page: 1 });
            }}
            className="d-flex gap-2"
          >
            <input
              className="form-control"
              placeholder="Search name, email, subject..."
              value={state.search}
              onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
            />
            <button className="btn btn-dark-ghost" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={state.readFilter}
            onChange={(e) => load({ page: 1, readFilter: e.target.value })}
          >
            <option value="">All messages</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={state.status}
            onChange={(e) => load({ page: 1, status: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <ErrorAlert message={state.error} />

      {state.loading ? (
        <Loader />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon="bi-envelope"
          title="No enquiries"
          message="Contact form messages will appear here."
        />
      ) : (
        <>
          <div className="card-clean" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Follow-up</th>
                    <th>Received</th>
                    <th style={{ width: 200 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((e) => (
                    <tr
                      key={e.id}
                      style={{
                        fontWeight: !e.is_read ? 600 : 400,
                        background: !e.is_read ? "rgba(59,130,246,.04)" : "transparent",
                      }}
                    >
                      <td>
                        {!e.is_read && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#2563EB",
                            }}
                            title="Unread"
                          />
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{e.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>
                          {e.email}
                        </div>
                      </td>
                      <td style={{ fontSize: ".85rem" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>
                          {e.subject}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: 2 }}>
                          {e.message.slice(0, 60)}
                          {e.message.length > 60 ? "..." : ""}
                        </div>
                      </td>
                      <td>
                        <span className={"badge-status " + statusBadge(e.follow_up_status)}>
                          {e.follow_up_status}
                        </span>
                      </td>
                      <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button
                            className="btn btn-sm btn-dark-ghost"
                            style={{ padding: ".25rem .55rem", fontSize: ".75rem" }}
                            onClick={() => openDetail(e.id)}
                          >
                            <i className="bi bi-eye" /> View
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              padding: ".25rem .55rem",
                              fontSize: ".75rem",
                              background: e.is_read ? "#FEF3C7" : "#DBEAFE",
                              color: e.is_read ? "#92400E" : "#1E40AF",
                              border: 0,
                            }}
                            onClick={() => toggleRead(e.id, e.is_read)}
                            title={e.is_read ? "Mark unread" : "Mark read"}
                          >
                            <i
                              className={
                                "bi " + (e.is_read ? "bi-envelope" : "bi-envelope-open")
                              }
                            />
                          </button>
                          <select
                            className="form-select form-select-sm"
                            style={{
                              width: "auto",
                              fontSize: ".75rem",
                              padding: ".2rem .4rem",
                            }}
                            value={e.follow_up_status}
                            onChange={(ev) => changeStatus(e.id, ev.target.value)}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <button
                            className="btn btn-sm"
                            style={{
                              padding: ".25rem .55rem",
                              fontSize: ".75rem",
                              background: "#FEE2E2",
                              color: "#991B1B",
                              border: 0,
                            }}
                            onClick={() => doDelete(e.id)}
                            title="Delete"
                          >
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
                  <li
                    key={n}
                    className={"page-item " + (n === state.page ? "active" : "")}
                  >
                    <button className="page-link" onClick={() => load({ page: n })}>
                      {n}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        open={detail.open}
        title="Enquiry Details"
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
            {detail.item && (
              <a
                className="btn btn-lime"
                href={`mailto:${detail.item.email}?subject=Re: ${encodeURIComponent(
                  detail.item.subject
                )}`}
              >
                <i className="bi bi-reply me-1" /> Reply by Email
              </a>
            )}
          </>
        }
      >
        {detail.item && (
          <div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">From</label>
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
                <div>{detail.item.phone || "—"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Received</label>
                <div>{new Date(detail.item.created_at).toLocaleString()}</div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Subject</label>
                <div className="fw-semibold">{detail.item.subject}</div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Message</label>
                <div
                  className="p-3"
                  style={{
                    background: "var(--bg-alt)",
                    borderRadius: 10,
                    whiteSpace: "pre-line",
                    fontSize: ".9rem",
                  }}
                >
                  {detail.item.message}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Follow-up Status
                </label>
                <select
                  className="form-select form-select-sm"
                  value={detail.item.follow_up_status}
                  onChange={(e) => changeStatus(detail.item.id, e.target.value)}
                  style={{ maxWidth: 200 }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Read Status</label>
                <div>
                  <button
                    className="btn btn-sm btn-dark-ghost"
                    onClick={() => toggleRead(detail.item.id, detail.item.is_read)}
                  >
                    <i
                      className={
                        "bi " +
                        (detail.item.is_read ? "bi-envelope" : "bi-envelope-open") +
                        " me-1"
                      }
                    />
                    {detail.item.is_read ? "Mark as Unread" : "Mark as Read"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}