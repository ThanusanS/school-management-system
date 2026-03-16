// Teachers.js
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const SUBJECTS = ['Mathematics','Science','English','History','Geography','Computer Science','Physics','Chemistry','Biology','Art','Music','Physical Education'];
const empty = { firstName:'',lastName:'',email:'',phone:'',subject:'Mathematics',qualification:'',experience:0,salary:'',gender:'male',dateOfBirth:'',address:'',password:'' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [page, setPage] = useState(1); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false); const [editId, setEditId] = useState(null); const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await API.get('/teachers', { params: { page, limit:10, ...(search && { search }) } });
      setTeachers(r.data.teachers); setTotal(r.data.total); setTotalPages(r.data.pages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = t => { setForm({ firstName:t.firstName,lastName:t.lastName,email:t.email,phone:t.phone||'',subject:t.subject,qualification:t.qualification||'',experience:t.experience||0,salary:t.salary||'',gender:t.gender||'male',dateOfBirth:t.dateOfBirth?t.dateOfBirth.split('T')[0]:'',address:t.address||'',password:'' }); setEditId(t._id); setModal(true); };
  const handleDelete = async id => { if (!window.confirm('Delete teacher?')) return; try { await API.delete(`/teachers/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Error'); } };
  const handleSubmit = async e => { e.preventDefault(); setSaving(true); try { editId ? await API.put(`/teachers/${editId}`, form) : await API.post('/teachers', form); toast.success(editId ? 'Updated!' : 'Teacher added!'); setModal(false); fetch(); } catch(err) { toast.error(err.response?.data?.message||'Error'); } finally { setSaving(false); } };
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Teachers</div><div className="page-subtitle">{total} staff members</div></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Teacher</button>
      </div>
      <div className="search-bar">
        <div className="search-box"><span className="search-box-icon">🔍</span><input placeholder="Search teachers..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} /></div>
      </div>
      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : teachers.length===0 ? <div className="empty-state"><p>No teachers found</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Teacher</th><th>ID</th><th>Subject</th><th>Qualification</th><th>Exp</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{teachers.map(t=>(
              <tr key={t._id}>
                <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>{t.firstName[0]}{t.lastName[0]}</div><div><div style={{fontWeight:600,color:'var(--text)'}}>{t.firstName} {t.lastName}</div><div style={{fontSize:12,color:'var(--text-3)'}}>{t.email}</div></div></div></td>
                <td><code style={{fontSize:12,background:'var(--surface-2)',padding:'2px 8px',borderRadius:6,color:'var(--success)'}}>{t.teacherId}</code></td>
                <td><span className="badge badge-success">{t.subject}</span></td>
                <td style={{fontSize:13,color:'var(--text-3)'}}>{t.qualification||'-'}</td>
                <td>{t.experience} yrs</td>
                <td><span className={`badge badge-${t.status==='active'?'success':t.status==='on-leave'?'warning':'danger'}`}>{t.status}</span></td>
                <td><div style={{display:'flex',gap:6}}><button className="btn btn-sm btn-secondary" onClick={()=>openEdit(t)}>✏️</button><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(t._id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
        {totalPages>1&&<div className="pagination"><button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>←</button>{Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} className={`page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>)}<button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}>→</button></div>}
      </div>
      {modal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="modal modal-lg"><div className="modal-header"><div className="modal-title">{editId?'Edit Teacher':'Add Teacher'}</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div><div className="modal-body"><form onSubmit={handleSubmit}><div className="modal-grid">
        <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e=>f('firstName',e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={e=>f('lastName',e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e=>f('email',e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>f('phone',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Subject *</label><select className="form-input" value={form.subject} onChange={e=>f('subject',e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" value={form.qualification} onChange={e=>f('qualification',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Experience (yrs)</label><input type="number" className="form-input" value={form.experience} onChange={e=>f('experience',e.target.value)} min="0" /></div>
        <div className="form-group"><label className="form-label">Salary</label><input type="number" className="form-input" value={form.salary} onChange={e=>f('salary',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Gender</label><select className="form-input" value={form.gender} onChange={e=>f('gender',e.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
        <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={form.dateOfBirth} onChange={e=>f('dateOfBirth',e.target.value)} /></div>
        <div className="form-group col-span-2"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>f('address',e.target.value)} /></div>
        {!editId&&<div className="form-group col-span-2"><label className="form-label">Password (default: teacher123)</label><input type="password" className="form-input" value={form.password} onChange={e=>f('password',e.target.value)} placeholder="Leave blank for 'teacher123'" /></div>}
      </div><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:24}}><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':editId?'Update':'Add Teacher'}</button></div></form></div></div></div>}
    </div>
  );
}
