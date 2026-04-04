import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/api';
import FeedItem from '../Alumni/components/FeedItem';
import Toast from '../../components/common/Toast';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import {
    FaBriefcase, FaCalendarAlt, FaUserFriends,
    FaGraduationCap, FaSearch, FaRegImage, FaSmile, FaTimes
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';
import { postService as ps } from '../../services/api';

// ──────────────────────────────────────────────────────────────
//  STUDENT QUICK LINKS SIDEBAR
// ──────────────────────────────────────────────────────────────
const StudentSidebar = ({ user }) => (
    <div className="d-flex flex-column gap-3">
        {/* Profile Mini-Card */}
        <motion.div
            className="dashboard-card bg-white rounded-4 shadow-sm border-0 overflow-hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                className="w-100"
                style={{ height: 64, background: 'linear-gradient(135deg, #c84022 0%, #e85d38 100%)' }}
            />
            <div className="px-3 pb-3 text-center" style={{ marginTop: -32 }}>
                <div
                    className="rounded-circle border border-3 border-white mx-auto overflow-hidden bg-light d-flex align-items-center justify-content-center fw-bold text-secondary"
                    style={{ width: 64, height: 64, fontSize: 22 }}
                >
                    {user?.profilePic
                        ? <img src={user.profilePic} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (user?.name?.[0]?.toUpperCase() || '?')}
                </div>
                <div className="fw-bold mt-2" style={{ fontSize: 15 }}>{user?.name}</div>
                <div className="text-muted small">{user?.department || 'Student'}</div>
                <div className="text-muted extra-small">{user?.batch ? `Batch of ${user.batch}` : ''}</div>
                <Link to="/alumni/profile" className="btn btn-outline-danger btn-sm rounded-pill mt-2 w-100" style={{ fontSize: 12 }}>
                    View Profile
                </Link>
            </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
            className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="fw-bold mb-3" style={{ fontSize: 14, color: '#c84022' }}>
                <FaGraduationCap className="me-2" />Student Quick Links
            </div>
            {[
                { to: '/Student/JobSearch',        icon: FaBriefcase,    label: 'Search Jobs',          color: '#6f42c1' },
                { to: '/student/StudentEvents',    icon: FaCalendarAlt,  label: 'Upcoming Events',      color: '#fd7e14' },
                { to: '/alumni/home',              icon: FaUserFriends,  label: 'Connect with Alumni',  color: '#198754' },
            ].map(({ to, icon: Icon, label, color }) => (
                <Link
                    key={to}
                    to={to}
                    className="d-flex align-items-center gap-3 py-2 text-decoration-none rounded-2 px-2 mb-1"
                    style={{ color: '#333', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <Icon size={16} style={{ color }} />
                    <span style={{ fontSize: 13 }}>{label}</span>
                </Link>
            ))}
        </motion.div>
    </div>
);

// ──────────────────────────────────────────────────────────────
//  LIGHTWEIGHT CREATE POST BOX (reused from AlumniDashboard)
// ──────────────────────────────────────────────────────────────
const StudentCreatePost = ({ user, onPostCreated, showToast }) => {
    const [expanded, setExpanded] = useState(false);
    const [postText, setPostText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [posting, setPosting] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
            setExpanded(true);
        } catch {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExpanded(true);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!postText.trim() && !imageFile) return;
        setPosting(true);
        try {
            const formData = new FormData();
            formData.append('content', postText);
            if (imageFile) formData.append('image', imageFile);
            const res = await postService.createPost(formData);
            onPostCreated(res.data.data);
            setPostText(''); removeImage(); setExpanded(false);
            showToast('Post shared! 🎉', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create post.', 'error');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="dashboard-card bg-white shadow-sm rounded-4 border-0 mb-4 overflow-hidden">
            <div className="d-flex align-items-center gap-3 p-3 pb-2">
                <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: 48, height: 48, backgroundColor: '#eee' }}>
                    {user?.profilePic
                        ? <img src={user.profilePic} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold text-secondary" style={{ fontSize: 18 }}>{user?.name?.[0]?.toUpperCase() || '?'}</div>}
                </div>
                <button
                    className="btn border rounded-pill flex-grow-1 text-start text-muted fw-semibold px-4 py-2"
                    style={{ backgroundColor: '#f3f2ef', fontSize: 14 }}
                    onClick={() => setExpanded(true)}
                >
                    Share something with your network, {user?.name?.split(' ')[0] || 'student'}...
                </button>
            </div>
            {expanded && (
                <div className="px-3 pb-3">
                    <textarea
                        className="form-control border-0 bg-transparent p-0 mt-1"
                        rows={3}
                        placeholder="What's on your mind?"
                        value={postText}
                        onChange={e => setPostText(e.target.value)}
                        style={{ resize: 'none', fontSize: 15, outline: 'none', boxShadow: 'none' }}
                        autoFocus
                    />
                    {imagePreview && (
                        <div className="position-relative mt-2 rounded-3 overflow-hidden border" style={{ maxHeight: 280 }}>
                            <img src={imagePreview} alt="Preview" className="w-100" style={{ objectFit: 'cover', maxHeight: 280 }} />
                            <button onClick={removeImage} className="position-absolute top-0 end-0 m-2 border-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 28, height: 28, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer' }}>
                                <FaTimes size={11} />
                            </button>
                        </div>
                    )}
                    <div className="d-flex align-items-center justify-content-between border-top mt-2 pt-2">
                        <div className="d-flex gap-1">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="d-none" />
                            <button className="btn btn-sm text-muted d-flex align-items-center gap-1" style={{ fontSize: 13, border: 'none' }} onClick={() => fileInputRef.current?.click()}>
                                <FaRegImage size={16} style={{ color: '#378fe9' }} /><span className="d-none d-sm-inline">Photo</span>
                            </button>
                            <button className="btn btn-sm text-muted d-flex align-items-center gap-1" style={{ fontSize: 13, border: 'none' }} onClick={() => setShowEmoji(s => !s)}>
                                <FaSmile size={16} style={{ color: '#f5c518' }} /><span className="d-none d-sm-inline">Emoji</span>
                            </button>
                            {showEmoji && (
                                <div className="position-absolute" style={{ zIndex: 1000, bottom: 60 }}>
                                    <EmojiPicker onEmojiClick={d => { setPostText(t => t + d.emoji); setShowEmoji(false); }} height={320} width={280} skinTonesDisabled previewConfig={{ showPreview: false }} />
                                </div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm text-muted" style={{ border: 'none', fontSize: 13 }} onClick={() => { setExpanded(false); setPostText(''); removeImage(); }}>Cancel</button>
                            <button className="btn btn-mamcet-red btn-sm px-4 fw-bold rounded-pill" onClick={handleSubmit} disabled={!postText.trim() && !imageFile} style={{ fontSize: 13 }}>
                                {posting ? <ClipLoader size={12} color="#fff" /> : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!expanded && (
                <div className="d-flex justify-content-around border-top px-2 py-1">
                    <button className="btn btn-sm text-muted d-flex align-items-center gap-2 py-2" style={{ fontSize: 13, border: 'none' }}
                        onClick={() => { setExpanded(true); setTimeout(() => fileInputRef.current?.click(), 100); }}>
                        <FaRegImage size={16} style={{ color: '#378fe9' }} /><span className="d-none d-sm-inline">Photo</span>
                    </button>
                    <button className="btn btn-sm text-muted d-flex align-items-center gap-2 py-2" style={{ fontSize: 13, border: 'none' }}
                        onClick={() => setExpanded(true)}>
                        <FaSearch size={16} style={{ color: '#c84022' }} /><span className="d-none d-sm-inline">Ask Alumni</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────
//  RIGHT SIDEBAR — opportunities banner
// ──────────────────────────────────────────────────────────────
const OpportunitiesSidebar = () => (
    <div className="d-flex flex-column gap-3">
        <motion.div
            className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#c84022' }}>
                <FaBriefcase className="me-2" />Latest Opportunities
            </div>
            <p className="text-muted small mb-2">Browse jobs posted by alumni and companies.</p>
            <Link to="/Student/JobSearch" className="btn btn-mamcet-red btn-sm rounded-pill w-100" style={{ fontSize: 13 }}>
                Search Jobs
            </Link>
        </motion.div>

        <motion.div
            className="dashboard-card bg-white rounded-4 shadow-sm border-0 p-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#198754' }}>
                <FaCalendarAlt className="me-2" />Upcoming Events
            </div>
            <p className="text-muted small mb-2">Stay updated with college & alumni events.</p>
            <Link to="/student/StudentEvents" className="btn btn-success btn-sm rounded-pill w-100" style={{ fontSize: 13 }}>
                View Events
            </Link>
        </motion.div>
    </div>
);

// ──────────────────────────────────────────────────────────────
//  STUDENT DASHBOARD (main)
// ──────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useAuth();
    const [feedData,    setFeedData]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page,        setPage]        = useState(1);
    const [hasMore,     setHasMore]     = useState(true);
    const [toast,       setToast]       = useState(null);
    const showToast = (message, type = 'info') => setToast({ message, type });

    // IntersectionObserver sentinel — fires when user scrolls to bottom
    const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

    /* Initial load — page 1 */
    useEffect(() => {
        const loadFeed = async () => {
            try {
                setLoading(true);
                const res = await postService.getFeed(1, 10);
                setFeedData(res.data.data || []);
                setHasMore(res.data.pagination?.hasMore ?? false);
                setPage(1);
            } catch {
                showToast('Failed to load feed.', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadFeed();
    }, []);

    /* Infinite scroll — auto-fetch next page when sentinel is in view */
    useEffect(() => {
        if (inView && hasMore && !loadingMore && !loading) {
            const loadMore = async () => {
                const nextPage = page + 1;
                try {
                    setLoadingMore(true);
                    const res = await postService.getFeed(nextPage, 10);
                    const newPosts = res.data.data || [];
                    setFeedData(prev => [...prev, ...newPosts]);
                    setHasMore(res.data.pagination?.hasMore ?? false);
                    setPage(nextPage);
                } catch {
                    showToast('Failed to load more posts.', 'error');
                } finally {
                    setLoadingMore(false);
                }
            };
            loadMore();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    const handlePostCreated = useCallback((newPost) => setFeedData(prev => [newPost, ...prev]), []);

    const handleLike = async (postId) => {
        try {
            const res = await postService.likePost(postId);
            setFeedData(prev => prev.map(p => (p._id === postId || p.id === postId) ? res.data.data : p));
        } catch { showToast('Could not update like.', 'error'); }
    };

    const handleComment = async (postId, commentText) => {
        try {
            const res = await ps.addComment(postId, commentText);
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
                {/* Welcome Banner */}
                <motion.div
                    className="rounded-4 mb-4 px-4 py-3 d-flex align-items-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #c84022 0%, #e85d38 100%)', color: '#fff' }}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaGraduationCap size={32} />
                    <div>
                        <div className="fw-bold" style={{ fontSize: 18 }}>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>Explore jobs, events, and connect with alumni from your network.</div>
                    </div>
                </motion.div>

                <div className="row g-4">
                    {/* LEFT SIDEBAR */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <StudentSidebar user={user} />
                    </div>

                    {/* CENTER FEED */}
                    <div className="col-lg-6">
                        <StudentCreatePost user={user} onPostCreated={handlePostCreated} showToast={showToast} />
                        <div className="feed-scroll-area">
                            {feedData.length > 0 ? (
                                <>
                                    {feedData.map(post => (
                                        <FeedItem
                                            key={post._id || post.id}
                                            post={post}
                                            onLike={handleLike}
                                            onComment={handleComment}
                                            onShare={() => showToast('Post link copied!', 'info')}
                                        />
                                    ))}

                                    {/* ── Infinite Scroll Sentinel ── */}
                                    <div ref={sentinelRef} className="text-center py-3" style={{ minHeight: 48 }}>
                                        {loadingMore && (
                                            <div className="d-inline-flex align-items-center gap-2 text-muted" style={{ fontSize: 13 }}>
                                                <ClipLoader size={16} color="#c84022" />
                                                <span>Loading more posts…</span>
                                            </div>
                                        )}
                                        {!hasMore && feedData.length > 0 && (
                                            <div className="d-flex align-items-center justify-content-center gap-2" style={{ color: '#aaa', fontSize: 12 }}>
                                                <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                                                <span>You're all caught up</span>
                                                <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-5 bg-white rounded-4 shadow-sm border-0">
                                    <FaUserFriends size={36} className="text-muted mb-3 opacity-50" />
                                    <p className="text-muted mb-0">No posts yet. Connect with alumni to see their updates!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <OpportunitiesSidebar />
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default StudentDashboard;
