import React from 'react';
import { FiBriefcase } from 'react-icons/fi';
import AdminApprovals from './AdminApprovals';

/**
 * AdminJobs — routes directly to the AdminApprovals component but
 * pre-filtered to the 'jobs' tab. Since AdminApprovals already handles
 * all approval types with tabs, this page just pre-selects "jobs".
 */
const AdminJobs = () => (
  <div>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
        <FiBriefcase size={18} style={{ marginRight: 8, color: '#f59e0b', verticalAlign: 'middle' }} />
        Job Management
      </h2>
      <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
        Approve, reject, and manage all job postings.
      </p>
    </div>
    {/* Re-use the existing Approvals component — it handles tabs internally */}
    <AdminApprovals defaultTab="jobs" />
  </div>
);

export default AdminJobs;
