import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const GRADES = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SECTIONS = ['A','B','C'];
const BLOOD = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

const empty = { firstName:'',lastName:'',email:'',phone:'',grade:'Grade 9',section:'A',gender:'male',dateOfBirth:'',address:'',parentName:'',parentPhone:'',parentEmail:'',bloodGroup:'A+',rollNumber:'',password:'' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, limit: 10 };
      if (search) p.search = search;
      if (filterGrade) p.grade = filterGrade;
      const r = await API.get('/students', { params: p });
      setStudents(r.data.students); setTotalPages(r.data.pages); setTotal(r.data.total);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search, filterGrade]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = s => {
    setForm({ firstName:s.firstName,lastName:s.lastName,email:s.email,phone:s.phone||'',grade:s.grade,section:s.section||'A',gender:s.gender||'male',dateOfBirth:s.dateOfBirth?s.dateOfBirth.split('T')[0]:'',address:s.address||'',parentName:s.parentName||'',parentPhone:s.parentPhone||'',parentEmail:s.parentEmail||'',bloodGroup:s.bloodGroup||'A+',rollNumber:s.rollNumber||'',password:'' });
    setEditId(s._id); setModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this student and their login account?')) return;
    try { await API.delete(`/students/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await API.put(`/students/${editId}`, form); toast.success('Updated!'); }
      else { await API.post('/students', form); toast.success('Student added! Login: ' + form.email + ' / ' + (form.password || 'student123')); }
      setModal(false); fetch();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));
  const statusColor = { active:'success', inactive:'warning', graduated:'info', suspended:'danger' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Students</div>
          <div className="page-subtitle">{total} enrolled students</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Student</button>
      </div>

      <div className="search-bar">
        <div className="search-box">
          <span className="search-box-icon">🔍</span>
          <input placeholder="Search name, ID, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-input" style={{ width:160 }} value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1); }}>
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
          students.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🎓</div><p>No students found</p></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>ID</th><th>Grade</th><th>Parent</th><th>Blood</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar">{s.firstName[0]}{s.lastName[0]}</div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--text)' }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize:12, background:'var(--surface-2)', padding:'2px 8px', borderRadius:6, color:'var(--accent)' }}>{s.studentId}</code></td>
                    <td><span className="badge badge-accent">{s.grade}</span> {s.section && <span style={{ fontSize:12, color:'var(--text-3)' }}>- {s.section}</span>}</td>
                    <td style={{ fontSize:13 }}>{s.parentName || '-'}</td>
                    <td><span className="badge badge-gray">{s.bloodGroup || '-'}</span></td>
                    <td><span className={`badge badge-${statusColor[s.status]||'gray'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setViewStudent(s)}>👁️</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>←</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>)}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>→</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Student' : 'Add New Student'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Personal Info</div>
                <div className="modal-grid">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e=>f('firstName',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={e=>f('lastName',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e=>f('email',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>f('phone',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Gender</label><select className="form-input" value={form.gender} onChange={e=>f('gender',e.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" value={form.dateOfBirth} onChange={e=>f('dateOfBirth',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Blood Group</label><select className="form-input" value={form.bloodGroup} onChange={e=>f('bloodGroup',e.target.value)}>{BLOOD.map(b=><option key={b}>{b}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" value={form.rollNumber} onChange={e=>f('rollNumber',e.target.value)} /></div>
                  <div className="form-group col-span-2"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>f('address',e.target.value)} /></div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'20px 0 12px' }}>Academic Info</div>
                <div className="modal-grid">
                  <div className="form-group"><label className="form-label">Grade *</label><select className="form-input" value={form.grade} onChange={e=>f('grade',e.target.value)} required>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Section</label><select className="form-input" value={form.section} onChange={e=>f('section',e.target.value)}>{SECTIONS.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'20px 0 12px' }}>Parent / Guardian</div>
                <div className="modal-grid">
                  <div className="form-group"><label className="form-label">Parent Name</label><input className="form-input" value={form.parentName} onChange={e=>f('parentName',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Parent Phone</label><input className="form-input" value={form.parentPhone} onChange={e=>f('parentPhone',e.target.value)} /></div>
                  <div className="form-group col-span-2"><label className="form-label">Parent Email</label><input type="email" className="form-input" value={form.parentEmail} onChange={e=>f('parentEmail',e.target.value)} /></div>
                </div>
                {!editId && (
                  <>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'20px 0 12px' }}>Login Account</div>
                    <div className="form-group"><label className="form-label">Password (default: student123)</label><input type="password" className="form-input" value={form.password} onChange={e=>f('password',e.target.value)} placeholder="Leave blank for 'student123'" /></div>
                  </>
                )}
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Student' : 'Add Student'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewStudent && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setViewStudent(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Student Profile</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:'20px', background:'var(--surface-2)', borderRadius:'var(--radius)' }}>
                <div className="avatar avatar-xl">{viewStudent.firstName[0]}{viewStudent.lastName[0]}</div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800 }}>{viewStudent.firstName} {viewStudent.lastName}</div>
                  <div style={{ color:'var(--text-3)', fontSize:14, marginTop:2 }}>{viewStudent.studentId} · {viewStudent.grade} {viewStudent.section}</div>
                  <div style={{ marginTop:8 }}><span className={`badge badge-${statusColor[viewStudent.status]||'gray'}`}>{viewStudent.status}</span></div>
                </div>
              </div>
              {[['📧 Email', viewStudent.email],['📱 Phone', viewStudent.phone||'-'],['🎂 DOB', viewStudent.dateOfBirth?new Date(viewStudent.dateOfBirth).toLocaleDateString():'-'],['🩸 Blood', viewStudent.bloodGroup||'-'],['🏠 Address', viewStudent.address||'-'],['👨‍👩‍👦 Parent', viewStudent.parentName||'-'],['📞 Parent Phone', viewStudent.parentPhone||'-'],['📧 Parent Email', viewStudent.parentEmail||'-']].map(([label, val]) => (
                <div key={label} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:14 }}>
                  <span style={{ color:'var(--text-3)', minWidth:140 }}>{label}</span>
                  <span style={{ fontWeight:500, color:'var(--text)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
