import React, { useState, useEffect, useCallback, useRef } from 'react';
import { studentAdminService } from '../../services/api';
import * as XLSX from 'xlsx';
import { ClipLoader } from 'react-spinners';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiUploadCloud,
  FiDownload, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiChevronUp, FiChevronDown, FiX, FiCheck, FiAlertTriangle,
  FiUserCheck, FiUsers, FiAward, FiFileText, FiInfo,
} from 'react-icons/fi';

/* ── Colour coding for avatar initials ─────────────────────── */
const COLORS = ['#6366f1','#14b8a6','#f59e0b','#10b981',
                '#8b5cf6','#3b82f6','#ec4899','#c84022'];
const ac = (name='') => COLORS[name.charCodeAt(0) % COLORS.length];

/* ── Tiny inline toast ──────────────────────────────────────── */
let _tid = 0;
const useToast = () => {
  const [toasts, set] = useState([]);
  const add = useCallback((msg, type='info') => {
    const id = ++_tid;
    set(t => [...t, { id, msg, type }]);
    setTimeout(() => set(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return { toasts, add };
};

const PAGE_SIZES = [10, 20, 50];

const DEPT_OPTIONS = ['CSE','IT','ECE','EEE','MECH','CIVIL','MBA','MCA'];
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + i - 1));

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* ── Status pill ─────────────────────────────────────────────── */
const StatusPill = ({ status }) =>
  status === 'Active' ? (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:'rgba(16,185,129,0.12)', color:'#059669',
      borderRadius:20, padding:'3px 10px', fontSize:11.5, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'#059669', display:'inline-block' }} />
      Active
    </span>
  ) : (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:'rgba(245,158,11,0.12)', color:'#d97706',
      borderRadius:20, padding:'3px 10px', fontSize:11.5, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'#d97706', display:'inline-block' }} />
      Inactive
    </span>
  );

/* ── Form field helper ───────────────────────────────────────── */
const Field = ({ label, children, full }) => (
  <div className="am-field" style={full ? { gridColumn:'1/-1' } : {}}>
    <label>{label}</label>
    {children}
  </div>
);

/* ── Add / Edit modal ────────────────────────────────────────── */
const StudentModal = ({ student, onClose, onSave, saving }) => {
  const isEdit = !!student;
  const [form, setForm] = useState({
    name:           student?.name           || '',
    email:          student?.email          || '',
    phone:          student?.phone          || '',
    rollNumber:     student?.rollNumber     || '',
    department:     student?.department     || '',
    batch:          student?.batch          || '',
    graduationYear: student?.graduationYear || '',
    gender:         student?.gender         || '',
    city:           student?.city           || '',
    status:         student?.status         || 'Active',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="am-modal-backdrop" onClick={onClose}>
      <div className="am-modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="am-modal-header">
          <span className="am-modal-title">
            {isEdit ? <><FiEdit2 size={15} color="#6366f1" /> Edit Student</>
                     : <><FiPlus size={15} color="#10b981" /> Add Student</>}
          </span>
          <button className="am-modal-close" onClick={onClose}><FiX size={18} /></button>
        </div>

        <div className="am-modal-body">
          <div className="am-field-grid">
            <Field label="Full Name *">
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Aarav Kumar" />
            </Field>
            <Field label="Email *">
              <input value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="aarav@mamcet.com" disabled={isEdit} />
            </Field>
            <Field label="Roll Number">
              <input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} placeholder="22CSE001" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </Field>
            <Field label="Department">
              <select value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select Department</option>
                {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Join Year (Batch)">
              <input value={form.batch} onChange={e => set('batch', e.target.value)} placeholder="2022" />
            </Field>
            <Field label="Expected Graduation Year">
              <select value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)}>
                <option value="">Select Year</option>
                {YEAR_OPTIONS.map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="City">
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Chennai" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          {!isEdit && (
            <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(99,102,241,0.05)',
              border:'1px solid rgba(99,102,241,0.15)', borderRadius:9, fontSize:12.5, color:'#555' }}>
              <FiInfo size={13} style={{ verticalAlign:'middle', marginRight:6, color:'#6366f1' }} />
              Default password = Roll Number (or email prefix if no roll number provided).
            </div>
          )}
        </div>

        <div className="am-modal-footer">
          <button className="am-btn am-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="am-btn am-btn-primary" onClick={() => onSave(form)} disabled={saving}>
            {saving ? <ClipLoader size={14} color="#fff" />
                    : <><FiCheck size={14} /> {isEdit ? 'Save Changes' : 'Add Student'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Delete confirm ──────────────────────────────────────────── */
const DeleteModal = ({ student, onClose, onConfirm, saving }) => (
  <div className="am-modal-backdrop" onClick={onClose}>
    <div className="am-modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
      <div className="am-confirm-body">
        <div className="am-confirm-icon"><FiTrash2 size={26} /></div>
        <div className="am-confirm-title">Delete Student Account?</div>
        <div className="am-confirm-sub">
          This will permanently remove <strong>{student.name}</strong>'s account.
          This action cannot be undone.
        </div>
      </div>
      <div className="am-modal-footer" style={{ justifyContent:'center' }}>
        <button className="am-btn am-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="am-btn am-btn-danger" onClick={onConfirm} disabled={saving}>
          {saving ? <ClipLoader size={14} color="#fff" /> : <><FiTrash2 size={14} /> Delete</>}
        </button>
      </div>
    </div>
  </div>
);

/* ── Promote confirm ─────────────────────────────────────────── */
const PromoteModal = ({ student, onClose, onConfirm, saving }) => (
  <div className="am-modal-backdrop" onClick={onClose}>
    <div className="am-modal" style={{ maxWidth:440 }} onClick={e => e.stopPropagation()}>
      <div className="am-confirm-body">
        <div className="am-confirm-icon" style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1' }}>
          <FiAward size={28} />
        </div>
        <div className="am-confirm-title">Promote to Alumni?</div>
        <div className="am-confirm-sub">
          <strong>{student.name}</strong> will be moved to the Alumni network.<br />
          {student.graduationYear
            ? `Their graduation year (${student.graduationYear}) will be set as pass-out batch.`
            : 'You can update their pass-out batch later in Alumni Management.'}
        </div>
      </div>
      <div className="am-modal-footer" style={{ justifyContent:'center' }}>
        <button className="am-btn am-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="am-btn am-btn-primary" onClick={onConfirm} disabled={saving}>
          {saving ? <ClipLoader size={14} color="#fff" />
                  : <><FiAward size={14} /> Promote to Alumni</>}
        </button>
      </div>
    </div>
  </div>
);

/* ── Bulk Import modal ───────────────────────────────────────── */
const BulkImportModal = ({ onClose, onImport, importing, importResult }) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) { alert('Only .xlsx, .xls, or .csv files are allowed.'); return; }
    setFile(f);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name','Email','Roll Number','Phone','Department','Batch','Graduation Year','Gender','City'],
      ['Aarav Kumar','aarav.cse22@mamcet.com','22CSE001','+919876543210','CSE','2022','2026','Male','Chennai'],
      ['Priya Nair','priya.ece22@mamcet.com','22ECE002','+919876543211','ECE','2022','2026','Female','Coimbatore'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  return (
    <div className="am-modal-backdrop" onClick={onClose}>
      <div className="am-modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        <div className="am-modal-header">
          <span className="am-modal-title">
            <FiUploadCloud size={16} color="#6366f1" /> Bulk Import Students
          </span>
          <button className="am-modal-close" onClick={onClose}><FiX size={18} /></button>
        </div>

        <div className="am-modal-body">
          {/* Template download */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
            <button className="am-btn am-btn-ghost" onClick={downloadTemplate} style={{ fontSize:12 }}>
              <FiDownload size={13} /> Download Template
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#6366f1' : '#ddd'}`,
              borderRadius: 12,
              padding: '36px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(99,102,241,0.04)' : '#fafafa',
              transition: 'all 0.15s',
              marginBottom: 14,
            }}
          >
            <FiUploadCloud size={36} color={dragOver ? '#6366f1' : '#bbb'} />
            <div style={{ fontSize:14, fontWeight:600, color:'#555', marginTop:10 }}>
              {file ? file.name : 'Drop file here or click to browse'}
            </div>
            <div style={{ fontSize:12, color:'#aaa', marginTop:4 }}>
              Supports .xlsx, .xls, .csv · Max 5 MB
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display:'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {/* Column guide */}
          <div style={{ background:'#f8f9ff', borderRadius:9, padding:'12px 14px', fontSize:12, color:'#666' }}>
            <strong style={{ color:'#333' }}>Required columns:</strong> Name, Email<br />
            <strong style={{ color:'#333' }}>Optional:</strong> Roll Number, Phone, Department, Batch, Graduation Year, Gender, City<br />
            <strong style={{ color:'#333' }}>Password:</strong> Roll Number (or email prefix if omitted)
          </div>

          {/* Result */}
          {importResult && (
            <div style={{
              marginTop:14, padding:'12px 16px', borderRadius:10,
              background: importResult.results?.errors?.length ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.07)',
              border: `1px solid ${importResult.results?.errors?.length ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              fontSize:13,
            }}>
              <div style={{ fontWeight:700, marginBottom:6, color:'#1a1a2e' }}>Import Result</div>
              <div>✅ Created: <strong>{importResult.results?.created}</strong></div>
              <div>⏭️ Skipped (duplicates): <strong>{importResult.results?.skipped}</strong></div>
              {importResult.results?.errors?.length > 0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ color:'#dc2626', fontWeight:600, marginBottom:4 }}>
                    ❌ Errors ({importResult.results.errors.length}):
                  </div>
                  {importResult.results.errors.slice(0, 5).map((e, i) => (
                    <div key={i} style={{ fontSize:11.5, color:'#888' }}>
                      • {e.row}: {e.reason}
                    </div>
                  ))}
                  {importResult.results.errors.length > 5 && (
                    <div style={{ fontSize:11.5, color:'#aaa' }}>
                      … and {importResult.results.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="am-modal-footer">
          <button className="am-btn am-btn-ghost" onClick={onClose}>
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {!importResult && (
            <button
              className="am-btn am-btn-primary"
              onClick={() => file && onImport(file)}
              disabled={!file || importing}
            >
              {importing
                ? <><ClipLoader size={14} color="#fff" /> Importing…</>
                : <><FiUploadCloud size={14} /> Import {file ? `"${file.name}"` : 'File'}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Sort icon ───────────────────────────────────────────────── */
const SortIcon = ({ col, sk, so }) =>
  col !== sk
    ? <FiChevronDown size={11} style={{ opacity:0.3 }} />
    : so === 'asc'
      ? <FiChevronUp size={11} style={{ color:'#6366f1' }} />
      : <FiChevronDown size={11} style={{ color:'#6366f1' }} />;

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const StudentManagementPanel = () => {
  const [rows,       setRows]       = useState([]);
  const [pagination, setPagination] = useState({ total:0, page:1, limit:10, totalPages:1 });
  const [filterMeta, setFilterMeta] = useState({ departments:[], batches:[], graduationYears:[] });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  /* filters */
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [deptF,       setDeptF]       = useState('');
  const [batchF,      setBatchF]      = useState('');
  const [gradYF,      setGradYF]      = useState('');
  const [sortKey,     setSortKey]     = useState('createdAt');
  const [sortOrder,   setSortOrder]   = useState('desc');
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);

  /* modals */
  const [addOpen,      setAddOpen]      = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [promoteTarget,setPromoteTarget]= useState(null);
  const [bulkOpen,     setBulkOpen]     = useState(false);

  /* action loading */
  const [actionId,    setActionId]    = useState(null);
  const [addSaving,   setAddSaving]   = useState(false);
  const [editSaving,  setEditSaving]  = useState(false);
  const [delSaving,   setDelSaving]   = useState(false);
  const [promSaving,  setPromSaving]  = useState(false);
  const [importing,   setImporting]   = useState(false);
  const [importResult,setImportResult]= useState(null);

  const { toasts, add: toast } = useToast();

  /* debounce search */
  const timerRef = useRef(null);
  const handleSearch = val => {
    setSearchInput(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
  };

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchStudents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await studentAdminService.getStudents({
        search, department: deptF, batch: batchF,
        graduationYear: gradYF, page, limit,
        sort: sortKey, order: sortOrder,
      });
      setRows(res.data.data || []);
      setPagination(res.data.pagination || { total:0, page:1, limit, totalPages:1 });
      if (res.data.filters) setFilterMeta(res.data.filters);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load students.';
      setError(msg); toast(msg, 'error');
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, deptF, batchF, gradYF, page, limit, sortKey, sortOrder]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  /* ── Sort ──────────────────────────────────────────────────── */
  const handleSort = key => {
    if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
    setPage(1);
  };

  /* ── ADD ───────────────────────────────────────────────────── */
  const handleAdd = async form => {
    if (!form.name?.trim() || !form.email?.trim()) {
      return toast('Name and email are required.', 'error');
    }
    setAddSaving(true);
    try {
      const res = await studentAdminService.addStudent(form);
      toast(`✅ ${form.name} added! ${res.data.message?.split('. ').slice(1).join('. ')}`, 'success');
      setAddOpen(false);
      fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add student.', 'error');
    } finally { setAddSaving(false); }
  };

  /* ── EDIT ──────────────────────────────────────────────────── */
  const handleEdit = async form => {
    setEditSaving(true);
    try {
      await studentAdminService.updateStudent(editTarget._id, form);
      setRows(prev => prev.map(r => r._id === editTarget._id ? { ...r, ...form } : r));
      toast('✅ Student updated!', 'success');
      setEditTarget(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed.', 'error');
    } finally { setEditSaving(false); }
  };

  /* ── DELETE ────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDelSaving(true);
    try {
      await studentAdminService.deleteStudent(deleteTarget._id);
      setRows(prev => prev.filter(r => r._id !== deleteTarget._id));
      setPagination(p => ({ ...p, total: p.total - 1 }));
      toast(`🗑️ ${deleteTarget.name} deleted.`, 'info');
      setDeleteTarget(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally { setDelSaving(false); }
  };

  /* ── PROMOTE ───────────────────────────────────────────────── */
  const handlePromote = async () => {
    setPromSaving(true);
    try {
      await studentAdminService.promoteToAlumni(promoteTarget._id);
      setRows(prev => prev.filter(r => r._id !== promoteTarget._id));
      setPagination(p => ({ ...p, total: p.total - 1 }));
      toast(`🎓 ${promoteTarget.name} promoted to Alumni!`, 'success');
      setPromoteTarget(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Promote failed.', 'error');
    } finally { setPromSaving(false); }
  };

  /* ── BULK IMPORT ───────────────────────────────────────────── */
  const handleImport = async file => {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await studentAdminService.bulkImport(fd);
      setImportResult(res.data);
      toast(res.data.message, res.data.results?.errors?.length ? 'info' : 'success');
      fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || 'Import failed.', 'error');
    } finally { setImporting(false); }
  };

  /* ── CSV export ────────────────────────────────────────────── */
  const handleExport = () => {
    const headers = ['Name','Email','Roll Number','Department','Batch','Graduation Year','Gender','City','Status'];
    const data = rows.map(r => [
      r.name, r.email, r.rollNumber||'', r.department||'',
      r.batch||'', r.graduationYear||'', r.gender||'', r.city||'', r.status,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast('Excel exported!', 'success');
  };

  /* ── Pagination ────────────────────────────────────────────── */
  const getPages = () => {
    const { totalPages } = pagination;
    if (totalPages <= 7) return Array.from({length:totalPages}, (_,i)=>i+1);
    const p = pagination.page;
    return [...new Set([1, totalPages, p, p-1, p+1])]
      .filter(n => n >= 1 && n <= totalPages).sort((a,b)=>a-b);
  };

  const COLS = [
    { key:'name',           label:'Student',              sortable:true  },
    { key:'rollNumber',     label:'Roll No.',             sortable:false },
    { key:'department',     label:'Department',           sortable:true  },
    { key:'batch',          label:'Join Year',            sortable:true  },
    { key:'graduationYear', label:'Expected Graduation',  sortable:true  },
    { key:'gender',         label:'Gender',               sortable:false },
    { key:'status',         label:'Status',               sortable:true  },
    { key:'actions',        label:'Actions',              sortable:false },
  ];

  const activeCount  = rows.filter(r => r.status === 'Active').length;
  const clearFilters = () => {
    setSearchInput(''); setSearch('');
    setDeptF(''); setBatchF(''); setGradYF('');
    setPage(1);
  };
  const hasFilters = search || deptF || batchF || gradYF;

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="ap-section-header">
        <div>
          <div className="ap-section-title">Student Management</div>
          <div className="ap-section-sub">
            Add, edit, promote students and bulk-import via Excel / CSV.
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="am-btn am-btn-ghost" onClick={fetchStudents}><FiRefreshCw size={13} /></button>
          <button className="am-btn am-btn-ghost" onClick={handleExport}><FiDownload size={13} /> Export XLS</button>
          <button className="am-btn am-btn-ghost"
            style={{ borderColor:'#6366f1', color:'#6366f1' }}
            onClick={() => { setImportResult(null); setBulkOpen(true); }}>
            <FiUploadCloud size={13} /> Bulk Import
          </button>
          <button className="am-btn am-btn-primary" onClick={() => setAddOpen(true)}>
            <FiPlus size={14} /> Add Student
          </button>
        </div>
      </div>

      {/* ── Stats chips ─────────────────────────────────────── */}
      <div className="am-stats-bar">
        <div className="am-stat-chip">
          <FiUsers size={14} color="#6366f1" />
          <span><strong>{pagination.total}</strong> total students</span>
        </div>
        <div className="am-stat-chip" style={{ color:'#059669' }}>
          <FiUserCheck size={14} color="#059669" />
          <span><strong>{activeCount}</strong> active (this page)</span>
        </div>
        <div className="am-stat-chip" style={{ color:'#6366f1' }}>
          <FiAward size={14} color="#6366f1" />
          <span>Promote graduates to Alumni network</span>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="am-toolbar">
        <div className="am-search-wrap">
          <FiSearch size={14} className="am-search-icon" />
          <input
            className="am-search-input"
            placeholder="Search name or email…"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <select className="am-select" value={deptF}
          onChange={e => { setDeptF(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          {filterMeta.departments.map(d => <option key={d}>{d}</option>)}
        </select>

        <select className="am-select" value={batchF}
          onChange={e => { setBatchF(e.target.value); setPage(1); }}>
          <option value="">All Join Years</option>
          {filterMeta.batches.map(b => <option key={b}>{b}</option>)}
        </select>

        <select className="am-select" value={gradYF}
          onChange={e => { setGradYF(e.target.value); setPage(1); }}>
          <option value="">All Graduation Years</option>
          {filterMeta.graduationYears.map(y => <option key={y}>{y}</option>)}
        </select>

        {hasFilters && (
          <button className="am-btn am-btn-ghost" onClick={clearFilters}>
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
          borderRadius:10, padding:'11px 16px', marginBottom:16, color:'#dc2626', fontSize:13,
        }}>
          <FiAlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── Table card ──────────────────────────────────────────── */}
      <div className="am-table-wrap">
        {loading ? (
          <div style={{ padding:80, display:'flex', justifyContent:'center' }}>
            <ClipLoader color="#6366f1" size={38} />
          </div>
        ) : rows.length === 0 ? (
          <div className="am-empty">
            <div className="am-empty-icon">🎒</div>
            <div className="am-empty-title">No students found</div>
            <div className="am-empty-sub">
              {hasFilters
                ? 'Try adjusting your filters.'
                : 'No students yet. Add one or use Bulk Import.'}
            </div>
            <button className="am-btn am-btn-primary"
              style={{ margin:'16px auto 0', display:'inline-flex' }}
              onClick={() => setAddOpen(true)}>
              <FiPlus size={14} /> Add First Student
            </button>
          </div>
        ) : (
          <>
            <table className="am-table">
              <thead>
                <tr>
                  {COLS.map(col => (
                    <th key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}>
                      <span className="am-th-sort">
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} sk={sortKey} so={sortOrder} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map(s => {
                  const busy     = actionId === s._id;
                  const initials = s.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                  const bg       = ac(s.name || '');

                  return (
                    <tr key={s._id}>
                      {/* Student */}
                      <td>
                        <div className="am-name-cell">
                          <div className="am-avatar-sm" style={{ background:bg }}>
                            {s.profilePic
                              ? <img src={s.profilePic} alt={s.name} />
                              : initials}
                          </div>
                          <div>
                            <div className="am-name-primary">{s.name}</div>
                            <div className="am-name-secondary">{s.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td>
                        <span style={{ fontFamily:'monospace', fontSize:12.5, color:'#555',
                          background:'#f5f5f5', borderRadius:5, padding:'2px 6px' }}>
                          {s.rollNumber || '—'}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        {s.department
                          ? <span style={{ background:'rgba(99,102,241,0.08)', color:'#6366f1',
                              borderRadius:6, padding:'2px 8px', fontSize:12, fontWeight:600 }}>
                              {s.department}
                            </span>
                          : <span style={{ color:'#bbb' }}>—</span>}
                      </td>

                      {/* Join Year */}
                      <td style={{ fontWeight:600, color:'#333' }}>{s.batch || '—'}</td>

                      {/* Graduation Year */}
                      <td>
                        {s.graduationYear
                          ? <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                              background:'rgba(16,185,129,0.08)', color:'#059669',
                              borderRadius:20, padding:'2px 9px', fontSize:12, fontWeight:600 }}>
                              🎓 {s.graduationYear}
                            </span>
                          : <span style={{ color:'#bbb' }}>—</span>}
                      </td>

                      {/* Gender */}
                      <td style={{ color:'#666', fontSize:13 }}>{s.gender || '—'}</td>

                      {/* Status */}
                      <td><StatusPill status={s.status} /></td>

                      {/* Actions */}
                      <td>
                        <div className="am-actions">
                          {busy ? <ClipLoader size={16} color="#6366f1" /> : (
                            <>
                              {/* Promote */}
                              <button
                                className="am-btn-icon"
                                title="Promote to Alumni"
                                style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1' }}
                                onClick={() => setPromoteTarget(s)}
                              >
                                <FiAward size={13} />
                              </button>

                              {/* Edit */}
                              <button
                                className="am-btn-icon am-btn-icon-edit"
                                title="Edit"
                                onClick={() => setEditTarget(s)}
                              >
                                <FiEdit2 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                className="am-btn-icon am-btn-icon-delete"
                                title="Delete"
                                onClick={() => setDeleteTarget(s)}
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Pagination ──────────────────────────────────── */}
            <div className="am-pagination">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span className="am-page-info">
                  Showing {((pagination.page-1)*pagination.limit)+1}–
                  {Math.min(pagination.page*pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <select className="am-limit-select" value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                  {PAGE_SIZES.map(s => <option key={s} value={s}>Show {s}</option>)}
                </select>
              </div>

              <div className="am-page-btns">
                <button className="am-page-btn"
                  onClick={() => setPage(p=>p-1)} disabled={pagination.page<=1}>
                  <FiChevronLeft size={14} />
                </button>
                {getPages().map((n,i,arr) => (
                  <React.Fragment key={n}>
                    {i>0 && arr[i-1]!==n-1 && <span style={{ color:'#bbb', fontSize:13 }}>…</span>}
                    <button
                      className={`am-page-btn${n===pagination.page?' am-page-btn-active':''}`}
                      onClick={() => setPage(n)}>
                      {n}
                    </button>
                  </React.Fragment>
                ))}
                <button className="am-page-btn"
                  onClick={() => setPage(p=>p+1)} disabled={pagination.page>=pagination.totalPages}>
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}
      {addOpen && (
        <StudentModal
          student={null}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
          saving={addSaving}
        />
      )}
      {editTarget && (
        <StudentModal
          student={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
          saving={editSaving}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          student={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          saving={delSaving}
        />
      )}
      {promoteTarget && (
        <PromoteModal
          student={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onConfirm={handlePromote}
          saving={promSaving}
        />
      )}
      {bulkOpen && (
        <BulkImportModal
          onClose={() => setBulkOpen(false)}
          onImport={handleImport}
          importing={importing}
          importResult={importResult}
        />
      )}

      {/* ── Toast stack ─────────────────────────────────────── */}
      <div className="am-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`am-toast am-toast-${t.type}`}>
            {t.type==='success' && <FiCheck size={15}/>}
            {t.type==='error'   && <FiAlertTriangle size={15}/>}
            {t.type==='info'    && <FiFileText size={15}/>}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentManagementPanel;
