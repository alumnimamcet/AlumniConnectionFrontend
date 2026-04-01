import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import AdminApprovals from './AdminApprovals';

const AdminEvents = () => (
  <div>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
        <FiCalendar size={18} style={{ marginRight: 8, color: '#8b5cf6', verticalAlign: 'middle' }} />
        Event Management
      </h2>
      <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
        Approve, reject, and manage all events.
      </p>
    </div>
    <AdminApprovals defaultTab="events" />
  </div>
);

export default AdminEvents;
