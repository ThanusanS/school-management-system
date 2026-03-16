import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const CATEGORIES = ['general','exam','holiday','event','urgent'];
const PRIORITIES = ['low','medium','high'];
const AUDIENCES = ['all','students','teachers','parents'];
const CAT_COLOR = { urgent:'danger', exam:'warning', event:'info', holiday:'success', general:'gray' };
const CAT_ICON = { urgent:'🚨', exam:'📝', event:'🎉', holiday:'🏖️', general:'📢' };

const empty = { title:'', content:'', category:'general', priority:'medium', targetAudience:['all'], expiryDate:'' };

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [viewNotice, setViewNotice] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await API.get('/notices');
      setNotices(r.data);
    } catch { toast.error('Failed to load notices'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = n => {
    setForm({ title:n.title, content:n.content, category:n.category, priority:n.priority, targetAudience:n.targetAudience, expiryDate:n.expiryDate?n.expiryDate.split('T')[0]:'' });
    setEditId(n._id); setModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this notice?')) return;
    try { await API.delete(`/notices/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Error'); }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      editId ? await API.put(`/notices/${editId}`, form) : await API.post('/notices', form);
      toast.success(editId ? 'Updated!' : 'Notice published!');
      setModal(false); fetch();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const toggleAudience = a => {
    setForm(p => ({
      ...p,
      targetAudience: p.targetAudience.includes(a)
        ? p.targetAudience.filter(x => x !== a)
        : [...p.targetAudience, a]
    }));
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notice Board</div>
          <div className="page-subtitle">{notices.length} active notices</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Post Notice</button>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
        notices.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon">📢</div><p>No notices yet</p></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notices.map(n => (
              <div key={n._id} className="card" style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setViewNotice(n)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `var(--${CAT_COLOR[n.category]}-bg, var(--surface-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {CAT_ICON[n.category]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{n.title}</div>
                        <span className={`badge badge-${CAT_COLOR[n.category]}`}>{n.category}</span>
                        <span className={`badge badge-${n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'gray'}`}>{n.priority}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{n.content.slice(0, 120)}{n.content.length > 120 ? '...' : ''}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>👁️ {n.views} views</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>📅 {new Date(n.createdAt).toLocaleDateString()}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>🎯 {n.targetAudience?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(n)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n._id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Notice' : 'Post New Notice'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={form.title} onChange={e => f('title', e.target.value)} required placeholder="Notice title..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Content *</label>
                    <textarea className="form-input" value={form.content} onChange={e => f('content', e.target.value)} required rows={5} placeholder="Notice content..." style={{ resize: 'vertical' }} />
                  </div>
                  <div className="modal-grid">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={form.category} onChange={e => f('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-input" value={form.priority} onChange={e => f('priority', e.target.value)}>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group col-span-2">
                      <label className="form-label">Target Audience</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {AUDIENCES.map(a => (
                          <button key={a} type="button"
                            className={`btn btn-sm ${form.targetAudience.includes(a) ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleAudience(a)}
                            style={{ textTransform: 'capitalize' }}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input type="date" className="form-input" value={form.expiryDate} onChange={e => f('expiryDate', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Publishing...' : editId ? 'Update' : '📢 Publish'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewNotice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewNotice(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{CAT_ICON[viewNotice.category]}</span>
                <div className="modal-title">{viewNotice.title}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewNotice(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className={`badge badge-${CAT_COLOR[viewNotice.category]}`}>{viewNotice.category}</span>
                <span className={`badge badge-${viewNotice.priority === 'high' ? 'danger' : viewNotice.priority === 'medium' ? 'warning' : 'gray'}`}>{viewNotice.priority} priority</span>
                {viewNotice.targetAudience?.map(a => <span key={a} className="badge badge-gray">{a}</span>)}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{viewNotice.content}</div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-3)' }}>
                <span>📅 {new Date(viewNotice.createdAt).toLocaleString()}</span>
                <span>👁️ {viewNotice.views} views</span>
                {viewNotice.expiryDate && <span>⏰ Expires: {new Date(viewNotice.expiryDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
