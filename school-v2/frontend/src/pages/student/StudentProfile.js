// StudentProfile.js
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/auth/me').then(r => setProfile(r.data.profile)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handlePwChange = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await API.patch('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!'); setPwModal(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!profile) return <div>Profile not found</div>;

  const fields = [
    ['Student ID', profile.studentId], ['Email', profile.email], ['Phone', profile.phone || '-'],
    ['Gender', profile.gender || '-'], ['Date of Birth', profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'],
    ['Blood Group', profile.bloodGroup || '-'], ['Address', profile.address || '-'],
    ['Roll Number', profile.rollNumber || '-'], ['Enrollment Date', new Date(profile.enrollmentDate).toLocaleDateString()],
  ];

  const parentFields = [
    ['Parent Name', profile.parentName || '-'], ['Parent Phone', profile.parentPhone || '-'], ['Parent Email', profile.parentEmail || '-'],
  ];

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Profile</div></div>
        <button className="btn btn-secondary" onClick={() => setPwModal(true)}>🔒 Change Password</button>
      </div>

      {/* Hero */}
      <div className="profile-hero" style={{ marginBottom: 24 }}>
        <div className="avatar avatar-xl">{profile.firstName[0]}{profile.lastName[0]}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>{profile.firstName} {profile.lastName}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>{profile.grade} · Section {profile.section}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 100, fontSize: 12 }}>🎓 {profile.studentId}</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 100, fontSize: 12 }}>{profile.status}</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>👤 Personal Information</div>
          {fields.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>{label}</span>
              <span style={{ fontWeight: 500, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 16 }}>👨‍👩‍👦 Parent / Guardian</div>
          {parentFields.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>{label}</span>
              <span style={{ fontWeight: 500, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {pwModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPwModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">🔒 Change Password</div><button className="btn btn-ghost btn-icon" onClick={() => setPwModal(false)}>✕</button></div>
            <div className="modal-body">
              <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} /></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required /></div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setPwModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Change Password'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
