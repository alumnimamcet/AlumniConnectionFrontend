import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import '../../styles/AdminPanel.css';

/**
 * AdminLayout
 * -----------
 * Persistent shell for all /admin/* routes.
 * - Collapsible sidebar (desktop toggle + mobile overlay)
 * - Sticky topbar with profile dropdown
 * - <Outlet /> renders the active page content
 * - Guards: only 'admin' role can access
 */
const AdminLayout = ({ pendingCount = 0 }) => {
  const { user, userRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────
  if (!user) return <Navigate to="/login/admin" replace />;
  if (userRole !== 'admin') {
    const uid = user._id || user.id;
    if (userRole === 'student') return <Navigate to={`/student/home/${uid}`} replace />;
    return <Navigate to={`/alumni/home/${uid}`} replace />;
  }

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(o => !o);
    } else {
      setCollapsed(o => !o);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="ap-shell">
      {/* Mobile overlay */}
      <div
        className={`ap-mobile-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        pendingCount={pendingCount}
        onMobileClose={closeMobile}
      />

      {/* Main area */}
      <div className={`ap-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <AdminTopbar
          onToggleSidebar={toggleSidebar}
          pendingCount={pendingCount}
        />

        <main className="ap-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
