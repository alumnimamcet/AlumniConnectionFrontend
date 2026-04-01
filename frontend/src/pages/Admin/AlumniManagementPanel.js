import React, {
  useState, useEffect, useCallback, useRef, useId,
} from 'react';
import { adminService } from '../../services/api';
import { ClipLoader } from 'react-spinners';
import {
  FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2,
  FiCheck, FiX, FiChevronLeft, FiChevronRight,
  FiChevronUp, FiChevronDown, FiRefreshCw, FiDownload,
  FiUserCheck, FiUsers, FiClock, FiAlertTriangle,
} from 'react-icons/fi';

// ── Avatar colour palette (by initials) ─────────────────────
const AVATAR_COLORS = [
  '#6366f1','#14b8a6','#f59e0b','#10b981',
  '#8b5cf6','#3b82f6','#ec4899','#c84022',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Tiny toast queue ─────────────────────────────────────────
let _toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = ++_toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
};

// ── Column definitions ────────────────────────────────────────
const COLUMNS = [
  { key: 'name',         label: 'Name',         sortable: true  },
  { key: 'email',        label: 'Email',        sortable: true  },
  { key: 'department',   label: 'Department',   sortable: true  },
  { key: 'batch',        label: 'Pass-Out Year',sortable: true  },
  { key: 'company',      label: 'Company',      sortable: false },
  { key: 'designation',  label: 'Designation',  sortable: false },
  { key: 'status',       label: 'Status',       sortable: true  },
  { key: 'actions',      label: 'Actions',      sortable: false },
];

const PAGE_SIZES = [10, 20, 50];

// ────────────────────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────────────────────

// Status pill
const StatusPill = ({ status }) =>
  status === 'Active' ? (
    <span className="am-pill am-pill-active">
      <span className="am-pill-dot" /> Approved
    </span>
  ) : (
    <span className="am-pill am-pill-pending">
      <span className="am-pill-dot" /> Pending
    </span>
  );

// Edit modal
const EditModal = ({ alumni, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    name:       alumni.name        || '',
    email:      alumni.email       || '',
    department: alumni.department  || '',
    batch:      alumni.batch       || '',
    company:    alumni.company     || '',
    designation:alumni.designation || '',
    phone:      alumni.phone       || '',
    city:       alumni.city        || '',
    status:     alumni.status      || 'Pending',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="am-modal-backdrop" onClick={onClose}>
      <div className="am-modal" onClick={e => e.stopPropagation()}>
        <div className="am-modal-header">
          <span className="am-modal-title">
            <FiEdit2 size={16} color="#6366f1" /> Edit Alumni
          </span>
          <button className="am-modal-close" onClick={onClose}><FiX size={18} /></button>
        </div>

        <div className="am-modal-body">
          <div className="am-field-grid">
            {/* Name */}
            <div className="am-field">
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            {/* Email */}
            <div className="am-field">
              <label>Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            {/* Department */}
            <div className="am-field">
              <label>Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
            {/* Batch */}
            <div className="am-field">
              <label>Pass-Out Year</label>
              <input value={form.batch} onChange={e => set('batch', e.target.value)} placeholder="e.g. 2022" />
            </div>
            {/* Company */}
            <div className="am-field">
              <label>Company</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            {/* Designation */}
            <div className="am-field">
              <label>Designation</label>
              <input value={form.designation} onChange={e => set('designation', e.target.value)} />
            </div>
            {/* Phone */}
            <div className="am-field">
              <label>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            {/* City */}
            <div className="am-field">
              <label>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            {/* Status */}
            <div className="am-field am-field-full">
              <label>Account Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active (Approved)</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="am-modal-footer">
          <button className="am-btn am-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="am-btn am-btn-primary" onClick={() => onSave(form)} disabled={saving}>
            {saving ? <ClipLoader size={14} color="#fff" /> : <><FiCheck size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete confirm modal
const DeleteModal = ({ alumni, onClose, onConfirm, saving }) => (
  <div className="am-modal-backdrop" onClick={onClose}>
    <div className="am-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
      <div className="am-confirm-body">
        <div className="am-confirm-icon"><FiTrash2 size={26} /></div>
        <div className="am-confirm-title">Delete Alumni Account?</div>
        <div className="am-confirm-sub">
          This will permanently remove <strong>{alumni.name}</strong>'s account.
          This action cannot be undone.
        </div>
      </div>
      <div className="am-modal-footer" style={{ justifyContent: 'center' }}>
        <button className="am-btn am-btn-ghost" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button className="am-btn am-btn-danger" onClick={onConfirm} disabled={saving}>
          {saving ? <ClipLoader size={14} color="#fff" /> : <><FiTrash2 size={14} /> Delete</>}
        </button>
      </div>
    </div>
  </div>
);

// Sort icon
const SortIcon = ({ col, sortKey, sortOrder }) => {
  if (col !== sortKey) return <FiChevronDown size={11} style={{ opacity: 0.3 }} />;
  return sortOrder === 'asc'
    ? <FiChevronUp size={11} style={{ color: '#6366f1' }} />
    : <FiChevronDown size={11} style={{ color: '#6366f1' }} />;
};

// ────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ────────────────────────────────────────────────────────────────
const AlumniManagementPanel = () => {
  // Data state
  const [rows, setRows]             = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filterMeta, setFilterMeta] = useState({ departments: [], batches: [] });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filter + sort state
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey]       = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState('desc');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);

  // Modal state
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of row being actioned

  const { toasts, add: addToast } = useToast();

  // Debounce search input
  const searchTimer = useRef(null);
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 350);
  };

  // Fetch from API
  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAlumni({
        search,
        department: deptFilter,
        batch: batchFilter,
        status: statusFilter,
        page,
        limit,
        sort: sortKey,
        order: sortOrder,
      });
      setRows(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      if (res.data.filters) {
        setFilterMeta(res.data.filters);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load alumni. Check your connection.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, deptFilter, batchFilter, statusFilter, page, limit, sortKey, sortOrder]);

  useEffect(() => { fetchAlumni(); }, [fetchAlumni]);

  // ── Sort toggle ─────────────────────────────────────────────
  const handleSort = (key) => {
    if (!COLUMNS.find(c => c.key === key)?.sortable) return;
    if (sortKey === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // ── Approve ─────────────────────────────────────────────────
  const handleApprove = async (alumni) => {
    setActionLoading(alumni._id);
    try {
      await adminService.approveAlumni(alumni._id);
      setRows(prev => prev.map(r =>
        r._id === alumni._id ? { ...r, status: 'Active' } : r
      ));
      addToast(`✅ ${alumni.name} approved!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject (set to pending) ─────────────────────────────────
  const handleReject = async (alumni) => {
    setActionLoading(alumni._id);
    try {
      await adminService.rejectAlumni(alumni._id);
      setRows(prev => prev.map(r =>
        r._id === alumni._id ? { ...r, status: 'Pending' } : r
      ));
      addToast(`${alumni.name} set to Pending.`, 'info');
    } catch (err) {
      addToast('Reject failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Edit save ───────────────────────────────────────────────
  const [editSaving, setEditSaving] = useState(false);
  const handleEditSave = async (formData) => {
    setEditSaving(true);
    try {
      await adminService.updateAlumni(editTarget._id, formData);
      setRows(prev => prev.map(r =>
        r._id === editTarget._id ? { ...r, ...formData } : r
      ));
      addToast(`✅ ${formData.name} updated!`, 'success');
      setEditTarget(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────
  const [deleteSaving, setDeleteSaving] = useState(false);
  const handleDeleteConfirm = async () => {
    setDeleteSaving(true);
    try {
      await adminService.deleteAlumni(deleteTarget._id);
      setRows(prev => prev.filter(r => r._id !== deleteTarget._id));
      setPagination(p => ({ ...p, total: p.total - 1 }));
      addToast(`🗑️ ${deleteTarget.name} deleted.`, 'info');
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleteSaving(false);
    }
  };

  // ── CSV export ──────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Name','Email','Department','Batch','Company','Designation','Status'];
    const csvRows = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.name || ''}"`,
        `"${r.email || ''}"`,
        r.department || '',
        r.batch || '',
        `"${r.company || ''}"`,
        `"${r.designation || ''}"`,
        r.status || '',
      ].join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `alumni_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported!', 'success');
  };

  // ── Counts ──────────────────────────────────────────────────
  const totalActive  = rows.filter(r => r.status === 'Active').length;
  const totalPending = rows.filter(r => r.status === 'Pending').length;

  // ── Pagination helpers ──────────────────────────────────────
  const getPageNumbers = () => {
    const { totalPages } = pagination;
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p = pagination.page;
    const pages = new Set([1, totalPages, p, p - 1, p + 1]);
    return [...pages].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  };

  // ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page header ───────────────────────────────────── */}
      <div className="ap-section-header">
        <div>
          <div className="ap-section-title">
            Alumni Management
          </div>
          <div className="ap-section-sub">
            Full CRUD for alumni accounts — search, filter, approve, edit, delete.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="am-btn am-btn-ghost" onClick={fetchAlumni} title="Refresh">
            <FiRefreshCw size={14} />
          </button>
          <button className="am-btn am-btn-ghost" onClick={handleExport} title="Export CSV">
            <FiDownload size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats chips ────────────────────────────────────── */}
      <div className="am-stats-bar">
        <div className="am-stat-chip" style={{ color: '#1a1a2e' }}>
          <FiUsers size={14} color="#6366f1" />
          <span><strong>{pagination.total}</strong> total alumni</span>
        </div>
        <div className="am-stat-chip" style={{ color: '#059669' }}>
          <FiUserCheck size={14} color="#059669" />
          <span><strong>{totalActive}</strong> approved (this page)</span>
        </div>
        <div className="am-stat-chip" style={{ color: '#d97706' }}>
          <FiClock size={14} color="#d97706" />
          <span><strong>{totalPending}</strong> pending (this page)</span>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="am-toolbar">
        {/* Search */}
        <div className="am-search-wrap">
          <FiSearch size={14} className="am-search-icon" />
          <input
            className="am-search-input"
            placeholder="Search name or email…"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Department filter */}
        <select
          className="am-select"
          value={deptFilter}
          onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Departments</option>
          {filterMeta.departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Year filter */}
        <select
          className="am-select"
          value={batchFilter}
          onChange={e => { setBatchFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Years</option>
          {filterMeta.batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Status filter */}
        <select
          className="am-select"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="Active">Approved</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Clear filters */}
        {(search || deptFilter || batchFilter || statusFilter) && (
          <button
            className="am-btn am-btn-ghost"
            onClick={() => {
              setSearchInput(''); setSearch('');
              setDeptFilter(''); setBatchFilter(''); setStatusFilter('');
              setPage(1);
            }}
          >
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Error banner ────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '11px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13,
        }}>
          <FiAlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── Data table ──────────────────────────────────────── */}
      <div className="am-table-wrap">
        {loading ? (
          <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
            <ClipLoader color="#6366f1" size={38} />
          </div>
        ) : rows.length === 0 ? (
          <div className="am-empty">
            <div className="am-empty-icon">🎓</div>
            <div className="am-empty-title">No alumni found</div>
            <div className="am-empty-sub">
              {search || deptFilter || batchFilter || statusFilter
                ? 'Try adjusting your filters or search query.'
                : 'No alumni have registered yet.'}
            </div>
          </div>
        ) : (
          <>
            <table className="am-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      <span className="am-th-sort">
                        {col.label}
                        {col.sortable && (
                          <SortIcon col={col.key} sortKey={sortKey} sortOrder={sortOrder} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map(alumni => {
                  const isActioning = actionLoading === alumni._id;
                  const initials    = alumni.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const bg          = avatarColor(alumni.name || '');

                  return (
                    <tr key={alumni._id}>
                      {/* Name */}
                      <td>
                        <div className="am-name-cell">
                          <div className="am-avatar-sm" style={{ background: bg }}>
                            {alumni.profilePic
                              ? <img src={alumni.profilePic} alt={alumni.name} />
                              : initials}
                          </div>
                          <div>
                            <div className="am-name-primary">{alumni.name}</div>
                            <div className="am-name-secondary">{alumni.phone || '—'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span style={{ fontSize: 13, color: '#666' }}>{alumni.email}</span>
                      </td>

                      {/* Department */}
                      <td>
                        {alumni.department ? (
                          <span style={{
                            background: 'rgba(99,102,241,0.08)', color: '#6366f1',
                            borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600,
                          }}>
                            {alumni.department}
                          </span>
                        ) : <span style={{ color: '#bbb' }}>—</span>}
                      </td>

                      {/* Batch / Pass-Out Year */}
                      <td>
                        <span style={{ fontWeight: 600, color: '#333' }}>
                          {alumni.batch || '—'}
                        </span>
                      </td>

                      {/* Company */}
                      <td>
                        <div style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>
                          {alumni.company || <span style={{ color: '#bbb' }}>—</span>}
                        </div>
                        {alumni.city && (
                          <div style={{ fontSize: 11, color: '#aaa' }}>{alumni.city}</div>
                        )}
                      </td>

                      {/* Designation */}
                      <td style={{ fontSize: 13, color: '#666' }}>
                        {alumni.designation || <span style={{ color: '#bbb' }}>—</span>}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusPill status={alumni.status} />
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="am-actions">
                          {isActioning ? (
                            <ClipLoader size={16} color="#6366f1" />
                          ) : alumni.status === 'Pending' ? (
                            <button
                              className="am-btn-icon am-btn-icon-approve"
                              title="Approve"
                              onClick={() => handleApprove(alumni)}
                            >
                              <FiCheck size={14} />
                            </button>
                          ) : (
                            <button
                              className="am-btn-icon am-btn-icon-reject"
                              title="Revoke Approval"
                              onClick={() => handleReject(alumni)}
                            >
                              <FiX size={14} />
                            </button>
                          )}

                          <button
                            className="am-btn-icon am-btn-icon-edit"
                            title="Edit"
                            onClick={() => setEditTarget(alumni)}
                            disabled={isActioning}
                          >
                            <FiEdit2 size={13} />
                          </button>

                          <button
                            className="am-btn-icon am-btn-icon-delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(alumni)}
                            disabled={isActioning}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Pagination ─────────────────────────────────── */}
            <div className="am-pagination">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="am-page-info">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <select
                  className="am-limit-select"
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>Show {s}</option>)}
                </select>
              </div>

              <div className="am-page-btns">
                <button
                  className="am-page-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={pagination.page <= 1}
                  title="Previous"
                >
                  <FiChevronLeft size={14} />
                </button>

                {getPageNumbers().map((n, i, arr) => (
                  <React.Fragment key={n}>
                    {i > 0 && arr[i - 1] !== n - 1 && (
                      <span style={{ color: '#bbb', fontSize: 13 }}>…</span>
                    )}
                    <button
                      className={`am-page-btn${n === pagination.page ? ' am-page-btn-active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                ))}

                <button
                  className="am-page-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  title="Next"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {editTarget && (
        <EditModal
          alumni={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
          saving={editSaving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          alumni={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          saving={deleteSaving}
        />
      )}

      {/* ── Toast stack ─────────────────────────────────────── */}
      <div className="am-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`am-toast am-toast-${t.type}`}>
            {t.type === 'success' && <FiCheck size={15} />}
            {t.type === 'error'   && <FiAlertTriangle size={15} />}
            {t.type === 'info'    && <FiUserCheck size={15} />}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniManagementPanel;
