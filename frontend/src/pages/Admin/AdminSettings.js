import React, { useState } from 'react';
import { FiSettings, FiLock, FiBell, FiUser, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile state
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  // Password state
  const [oldPass, setOldPass]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [chgPass, setChgPass]   = useState(false);

  // Notification prefs (local only for now)
  const [emailNotifs, setEmailNotifs]   = useState(true);
  const [systemNotifs, setSystemNotifs] = useState(true);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/update-profile', { name, phone });
      updateUser(res.data?.data || { name, phone });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) return toast.error('Fill all fields.');
    if (newPass !== confPass)  return toast.error('Passwords do not match.');
    if (newPass.length < 6)    return toast.error('Min 6 characters.');
    setChgPass(true);
    try {
      await api.put('/auth/change-password', { oldPassword: oldPass, newPassword: newPass });
      toast.success('Password changed successfully!');
      setOldPass(''); setNewPass(''); setConfPass('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChgPass(false);
    }
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',       icon: FiUser  },
    { id: 'security', label: 'Security',       icon: FiLock  },
    { id: 'notifs',   label: 'Notifications',  icon: FiBell  },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
          <FiSettings size={18} style={{ marginRight: 8, color: '#6366f1', verticalAlign: 'middle' }} />
          Settings
        </h2>
        <p style={{ fontSize: 13, color: '#aaa', marginTop: 4, marginBottom: 0 }}>Manage your admin account preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Tab list */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 18px', border: 'none', background: tab === t.id ? 'rgba(200,64,34,0.06)' : 'none',
                borderLeft: tab === t.id ? '3px solid #c84022' : '3px solid transparent',
                cursor: 'pointer', fontSize: 13.5, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? '#c84022' : '#555', textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: '24px 26px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

          {/* Profile tab */}
          {tab === 'profile' && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 20 }}>Profile Information</div>

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: '#fafafa', borderRadius: 12 }}>
                <div className="ap-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                  {user?.profilePic ? <img src={user.profilePic} alt="admin" /> : user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>{user?.email}</div>
                  <div style={{ fontSize: 11, marginTop: 4, background: 'rgba(200,64,34,0.08)', color: '#c84022', borderRadius: 20, padding: '2px 10px', display: 'inline-block', fontWeight: 600 }}>
                    Administrator
                  </div>
                </div>
              </div>

              <label style={labelStyle}>Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+91 XXXXX XXXXX" />

              <label style={labelStyle}>Email (read-only)</label>
              <input value={user?.email || ''} readOnly style={{ ...inputStyle, background: '#f5f5f5', color: '#aaa', cursor: 'not-allowed' }} />

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 20,
                  background: '#c84022', border: 'none', borderRadius: 8,
                  padding: '10px 20px', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700,
                }}
              >
                <FiSave size={14} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 20 }}>Change Password</div>

              <label style={labelStyle}>Current Password</label>
              <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} style={inputStyle} placeholder="••••••••" />

              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle} placeholder="Min 6 characters" />

              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} style={inputStyle} placeholder="Repeat new password" />

              <button
                onClick={handleChangePassword}
                disabled={chgPass}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 20,
                  background: '#c84022', border: 'none', borderRadius: 8,
                  padding: '10px 20px', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700,
                }}
              >
                <FiLock size={14} /> {chgPass ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Notifications tab */}
          {tab === 'notifs' && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 20 }}>Notification Preferences</div>

              {[
                { label: 'Email Notifications', sub: 'Receive approval emails for new alumni registrations', val: emailNotifs, set: setEmailNotifs },
                { label: 'System Notifications', sub: 'Real-time alerts for jobs, events and reports', val: systemNotifs, set: setSystemNotifs },
              ].map(n => (
                <div key={n.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0', borderBottom: '1px solid #f5f5f5',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{n.sub}</div>
                  </div>
                  <button
                    onClick={() => n.set(v => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: n.val ? '#10b981' : '#ddd' }}
                  >
                    {n.val ? <FiBell size={22} /> : <FiBell size={22} style={{ opacity: 0.3 }} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#666',
  marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5',
  borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', background: '#fafafa',
};

export default AdminSettings;
