import React, { useState } from 'react';
import { FiGlobe, FiSave, FiEdit3, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLanding = () => {
  const [heroTitle,   setHeroTitle]   = useState('Welcome to MAMCET Alumni Connect');
  const [heroSub,     setHeroSub]     = useState('Bridging the gap between students, alumni, and opportunities.');
  const [heroCtaText, setHeroCtaText] = useState('Join Now');
  const [showAnnouncement, setShowAnn] = useState(true);
  const [announcement, setAnn]        = useState('Alumni Meet 2025 — Registrations Open! Click to know more.');
  const [saving, setSaving]           = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call
    toast.success('Landing page settings saved!');
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
            <FiGlobe size={18} style={{ marginRight: 8, color: '#3b82f6', verticalAlign: 'middle' }} />
            Landing Page
          </h2>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4, marginBottom: 0 }}>Customize the public home page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#c84022', border: 'none', borderRadius: 8, padding: '9px 18px',
            cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700,
          }}
        >
          <FiSave size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Hero Section */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <FiEdit3 size={15} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Hero Section</span>
          </div>
          <label style={labelStyle}>Hero Title</label>
          <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Hero Subtitle</label>
          <textarea value={heroSub} onChange={e => setHeroSub(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', height: 'auto' }} />

          <label style={labelStyle}>CTA Button Text</label>
          <input value={heroCtaText} onChange={e => setHeroCtaText(e.target.value)} style={inputStyle} />
        </div>

        {/* Announcement Banner */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Announcement Banner</span>
            </div>
            <button
              onClick={() => setShowAnn(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', color: showAnnouncement ? '#10b981' : '#ccc' }}
              title={showAnnouncement ? 'Disable banner' : 'Enable banner'}
            >
              {showAnnouncement ? <FiToggleRight size={30} /> : <FiToggleLeft size={30} />}
            </button>
          </div>

          <div style={{ background: showAnnouncement ? '#f0fdf4' : '#fafafa', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: `1px solid ${showAnnouncement ? '#86efac' : '#e5e5e5'}`, fontSize: 13, color: showAnnouncement ? '#166534' : '#aaa' }}>
            {showAnnouncement ? '✅ Banner is live on the homepage' : '🔕 Banner is hidden'}
          </div>

          <label style={labelStyle}>Banner Message</label>
          <textarea
            value={announcement}
            onChange={e => setAnn(e.target.value)}
            rows={4}
            disabled={!showAnnouncement}
            style={{ ...inputStyle, resize: 'vertical', height: 'auto', opacity: showAnnouncement ? 1 : 0.5 }}
          />
        </div>

        {/* Preview */}
        <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #0f0c1d 0%, #1a1035 60%, #c84022 100%)', borderRadius: 14, padding: '32px 36px', color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Live Preview</div>
          {showAnnouncement && (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', marginBottom: 20, fontSize: 13 }}>
              📢 {announcement}
            </div>
          )}
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>{heroTitle}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 24 }}>{heroSub}</div>
          <div style={{ display: 'inline-block', background: '#fff', color: '#c84022', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 14 }}>
            {heroCtaText}
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  marginBottom: 6,
  marginTop: 14,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#fafafa',
};

export default AdminLanding;
