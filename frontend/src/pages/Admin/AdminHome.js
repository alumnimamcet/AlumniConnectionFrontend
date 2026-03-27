import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService, adminService } from '../../services/api';
import FeedItem from '../Alumni/components/FeedItem';
import Toast from '../../components/common/Toast';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import {
    FaClipboardCheck, FaBriefcase, FaCalendarAlt,
    FaUserShield, FaUsers, FaChartLine, FaNewspaper,
    FaPlusCircle, FaBell
} from 'react-icons/fa';

// ──────────────────────────────────────────────────────────────
//  ADMIN QUICK-ACTION CARDS
// ──────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { to: '/admin/approvals',           icon: FaClipboardCheck, label: 'Pending Approvals', color: '#c84022', bg: 'rgba(200,64,34,0.08)' },
    { to: '/admin/create-job',          icon: FaBriefcase,      label: 'Post a Job',        color: '#6f42c1', bg: 'rgba(111,66,193,0.08)' },
    { to: '/admin/create-event',        icon: FaCalendarAlt,    label: 'Create Event',      color: '#fd7e14', bg: 'rgba(253,126,20,0.08)' },
    { to: '/admin/alumni',              icon: FaUsers,          label: 'Manage Alumni',     color: '#198754', bg: 'rgba(25,135,84,0.08)'  },
    { to: '/admin/dashboard',           icon: FaChartLine,      label: 'View Stats',        color: '#0d6efd', bg: 'rgba(13,110,253,0.08)' },
    { to: '/admin/post',                icon: FaNewspaper,      label: 'Admin Post',        color: '#20c997', bg: 'rgba(32,201,151,0.08)' },
];

const QuickActionsGrid = () => (
    <div className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3 mb-4">
        <div className="fw-bold mb-3" style={{ fontSize: 14, color: '#333' }}>
            <FaPlusCircle className="me-2" style={{ color: '#c84022' }} />Quick Actions
        </div>
        <div className="row g-2">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label, color, bg }) => (
                <div className="col-6 col-sm-4" key={to}>
                    <Link
                        to={to}
                        className="d-flex flex-column align-items-center gap-2 p-3 rounded-3 text-decoration-none"
                        style={{ background: bg, transition: 'transform 0.15s, box-shadow 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                            <Icon size={18} style={{ color }} />
                        </div>
                        <span className="fw-semibold text-center" style={{ fontSize: 12, color: '#333', lineHeight: 1.3 }}>{label}</span>
                    </Link>
                </div>
            ))}
        </div>
    </div>
);

// ──────────────────────────────────────────────────────────────
//  ADMIN STATS SIDEBAR (live data)
// ──────────────────────────────────────────────────────────────
const AdminStatsSidebar = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getStats()
            .then(res => { if (res.data?.data) setStats(res.data.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="d-flex flex-column gap-3">
            {/* Admin Mini Profile */}
            <motion.div
                className="dashboard-card bg-white rounded-4 shadow-sm border-0 overflow-hidden"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-100" style={{ height: 64, background: 'linear-gradient(135deg, #1a1a2e 0%, #c84022 100%)' }} />
                <div className="px-3 pb-3 text-center" style={{ marginTop: -32 }}>
                    <div
                        className="rounded-circle border border-3 border-white mx-auto overflow-hidden bg-light d-flex align-items-center justify-content-center fw-bold text-secondary"
                        style={{ width: 64, height: 64, fontSize: 22 }}
                    >
                        {user?.profilePic
                            ? <img src={user.profilePic} alt="admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (user?.name?.[0]?.toUpperCase() || 'A')}
                    </div>
                    <div className="fw-bold mt-2" style={{ fontSize: 15 }}>{user?.name}</div>
                    <div className="badge mt-1" style={{ backgroundColor: '#c84022', fontSize: 11 }}>
                        <FaUserShield className="me-1" />Administrator
                    </div>
                    <Link to="/admin/profile" className="btn btn-outline-danger btn-sm rounded-pill mt-2 w-100" style={{ fontSize: 12 }}>
                        Edit Profile
                    </Link>
                </div>
            </motion.div>

            {/* Live Stats */}
            <motion.div
                className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="fw-bold mb-3" style={{ fontSize: 14, color: '#c84022' }}>
                    <FaChartLine className="me-2" />Platform Stats
                </div>
                {loading ? (
                    <div className="text-center py-2"><ClipLoader size={20} color="#c84022" /></div>
                ) : stats ? (
                    <>
                        {[
                            { label: 'Total Users',    value: stats.totalUsers    || 0, color: '#0d6efd' },
                            { label: 'Total Posts',    value: stats.totalPosts    || 0, color: '#198754' },
                            { label: 'Pending Alumni', value: stats.pendingAlumni || 0, color: stats.pendingAlumni > 0 ? '#c84022' : '#198754' },
                            { label: 'Pending Jobs',   value: stats.pendingJobs   || 0, color: stats.pendingJobs   > 0 ? '#fd7e14' : '#198754' },
                            { label: 'Pending Events', value: stats.pendingEvents || 0, color: stats.pendingEvents > 0 ? '#fd7e14' : '#198754' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ fontSize: 13 }}>
                                <span className="text-muted">{label}</span>
                                <span className="fw-bold" style={{ color }}>{value}</span>
                            </div>
                        ))}
                        <button
                            className="btn btn-sm text-white w-100 fw-bold rounded-pill mt-3"
                            style={{ backgroundColor: '#c84022', fontSize: 13 }}
                            onClick={() => navigate('/admin/approvals')}
                        >
                            <FaClipboardCheck className="me-2" />Review Approvals
                        </button>
                    </>
                ) : (
                    <p className="text-muted small mb-0">Could not load stats.</p>
                )}
            </motion.div>

            {/* Notifications shortcut */}
            <motion.div
                className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#333' }}>
                    <FaBell className="me-2" style={{ color: '#fd7e14' }} />Notifications
                </div>
                <p className="text-muted small mb-2">View system alerts and approval notifications.</p>
                <Link to="/notifications" className="btn btn-outline-warning btn-sm rounded-pill w-100" style={{ fontSize: 12 }}>
                    View Alerts
                </Link>
            </motion.div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
//  ADMIN HOME (main)
// ──────────────────────────────────────────────────────────────
const AdminHome = () => {
    const { user } = useAuth();
    const [feedData, setFeedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'info') => setToast({ message, type });

    useEffect(() => {
        const loadFeed = async () => {
            try {
                setLoading(true);
                const res = await postService.getFeed();
                setFeedData(res.data.data || []);
            } catch {
                showToast('Failed to load feed.', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadFeed();
    }, []);

    const handleLike = async (postId) => {
        try {
            const res = await postService.likePost(postId);
            setFeedData(prev => prev.map(p => (p._id === postId || p.id === postId) ? res.data.data : p));
        } catch { showToast('Could not update like.', 'error'); }
    };

    const handleComment = async (postId, commentText) => {
        try {
            const res = await postService.addComment(postId, commentText);
            setFeedData(prev => prev.map(p => (p._id === postId || p.id === postId) ? res.data.data : p));
            showToast('Comment posted!', 'success');
        } catch { showToast('Could not post comment.', 'error'); }
    };

    if (loading) {
        return (
            <div className="dashboard-main-bg py-5 min-vh-100 d-flex align-items-center justify-content-center">
                <ClipLoader color="#c84022" size={45} />
            </div>
        );
    }

    return (
        <div className="dashboard-main-bg py-4 min-vh-100">
            <div className="container">
                {/* Admin Welcome Banner */}
                <motion.div
                    className="rounded-4 mb-4 px-4 py-3 d-flex align-items-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #c84022 100%)', color: '#fff' }}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaUserShield size={32} />
                    <div>
                        <div className="fw-bold" style={{ fontSize: 18 }}>Admin Control Centre 🛡️</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>
                            Welcome, {user?.name?.split(' ')[0] || 'Admin'}. Manage approvals, jobs, events, and alumni from here.
                        </div>
                    </div>
                </motion.div>

                <div className="row g-4">
                    {/* LEFT SIDEBAR */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <AdminStatsSidebar user={user} />
                    </div>

                    {/* CENTER */}
                    <div className="col-lg-6">
                        <QuickActionsGrid />
                        <div className="fw-bold mb-3 ps-1" style={{ fontSize: 15, color: '#444' }}>Recent Activity Feed</div>
                        <div className="feed-scroll-area">
                            {feedData.length > 0 ? (
                                feedData.map(post => (
                                    <FeedItem
                                        key={post._id || post.id}
                                        post={post}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        onShare={() => showToast('Post link copied!', 'info')}
                                    />
                                ))
                            ) : (
                                <div className="text-center p-5 bg-white rounded-4 shadow-sm border-0">
                                    <FaNewspaper size={36} className="text-muted mb-3 opacity-50" />
                                    <p className="text-muted mb-0">No posts in the feed yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <motion.div
                            className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="fw-bold mb-3" style={{ fontSize: 14, color: '#c84022' }}>Admin Navigation</div>
                            {[
                                { to: '/admin/dashboard',           label: '📊 Statistics Dashboard' },
                                { to: '/admin/alumni',              label: '👥 Alumni Management'    },
                                { to: '/admin/approvals',           label: '✅ Pending Approvals'    },
                                { to: '/admin/job-vacancies',       label: '💼 Job Vacancies'        },
                                { to: '/admin/upcoming-events-list',label: '📅 Events List'          },
                                { to: '/admin/add-alumni',          label: '➕ Add Alumni'           },
                            ].map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="d-block py-2 px-2 rounded-2 text-decoration-none mb-1"
                                    style={{ fontSize: 13, color: '#333', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {label}
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminHome;