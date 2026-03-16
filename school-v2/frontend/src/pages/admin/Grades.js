import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const SUBJECTS = ['Mathematics','Science','English','History','Geography','Computer Science','Physics','Chemistry','Biology'];
const EXAM_TYPES = ['midterm','final','quiz','assignment','project'];
const GRADE_COLOR = { 'A+':'success',A:'success',B:'info',C:'warning',D:'warning',F:'danger' };
const empty = { student:'', subject:'Mathematics', examType:'midterm', marks:'', totalMarks:100, semester:'Semester 1', academicYear:'2025-2026', remarks:'' };

export default function Grades() {
  const [grades, setGrades] = useState([]); const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); const [filterSubject, setFilterSubject] = useState(''); const [filterType, setFilterType] = useState(''); const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false); const [editId, setEditId] = useState(null); const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      if (filterSubject) p.subject = filterSubject;
      if (filterType) p.examType = filterType;
      const r = await API.get('/grades', { params:p });
      setGrades(r.data);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [filterSubject, filterType]);

  useEffect(() => { fetch(); API.get('/students', { params:{ limit:200 } }).then(r=>setStudents(r.data.students)); }, [fetch]);

  const openCreate = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = g => { setForm({ student:g.student?._id||'', subject:g.subject, examType:g.examType, marks:g.marks, totalMarks:g.totalMarks, semester:g.semester, academicYear:g.academicYear, remarks:g.remarks||'' }); setEditId(g._id); setModal(true); };
  const handleDelete = async id => { if (!window.confirm('Delete?')) return; try { await API.delete(`/grades/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Error'); } };
  const handleSubmit = async e => { e.preventDefault(); if (!form.student) return toast.error('Select a student'); setSaving(true); try { editId ? await API.put(`/grades/${editId}`,form) : await API.post('/grades',form); toast.success(editId?'Updated!':'Added!'); setModal(false); fetch(); } catch(err) { toast.error(err.response?.data?.message||'Error'); } finally { setSaving(false); } };
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const pct = (m,t) => ((m/t)*100).toFixed(1);
  const autoGrade = () => { const p=form.marks/form.totalMarks*100; return p>=90?'A+':p>=80?'A':p>=70?'B':p>=60?'C':p>=50?'D':'F'; };

  const filtered = grades.filter(g => !search || `${g.student?.firstName} ${g.student?.lastName}`.toLowerCase().includes(search.toLowerCase()) || g.student?.studentId?.includes(search));

  const avg = grades.length>0 ? (grades.reduce((s,g)=>s+(g.marks/g.totalMarks)*100,0)/grades.length).toFixed(1) : 0;

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Grades & Reports</div><div className="page-subtitle">{grades.length} records · Avg: {avg}%</div></div><button className="btn btn-primary" onClick={openCreate}>+ Add Grade</button></div>
      <div className="search-bar">
        <div className="search-box"><span className="search-box-icon">🔍</span><input placeholder="Search student..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <select className="form-input" style={{width:160}} value={filterSubject} onChange={e=>setFilterSubject(e.target.value)}><option value="">All Subjects</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select>
        <select className="form-input" style={{width:140}} value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="">All Types</option>{EXAM_TYPES.map(t=><option key={t}>{t}</option>)}</select>
      </div>
      <div className="card">
        {loading?<div className="loading-wrap"><div className="spinner"/></div>:filtered.length===0?<div className="empty-state"><p>No grades found</p></div>:<div className="table-wrap"><table>
          <thead><tr><th>Student</th><th>Subject</th><th>Type</th><th>Score</th><th>Grade</th><th>Semester</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(g=>(
            <tr key={g._id}>
              <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>{g.student?.firstName?.[0]}{g.student?.lastName?.[0]}</div><div><div style={{fontWeight:600}}>{g.student?.firstName} {g.student?.lastName}</div><div style={{fontSize:12,color:'var(--text-3)'}}>{g.student?.studentId}</div></div></div></td>
              <td><span className="badge badge-accent">{g.subject}</span></td>
              <td><span className="badge badge-gray" style={{textTransform:'capitalize'}}>{g.examType}</span></td>
              <td><div style={{fontWeight:700}}>{g.marks}<span style={{color:'var(--text-3)',fontWeight:400}}>/{g.totalMarks}</span><div style={{fontSize:11,color:'var(--text-3)'}}>{pct(g.marks,g.totalMarks)}%</div></div></td>
              <td><span className={`badge badge-${GRADE_COLOR[g.grade]||'gray'}`} style={{fontSize:14,fontWeight:800}}>{g.grade}</span></td>
              <td style={{fontSize:13,color:'var(--text-3)'}}>{g.semester}</td>
              <td><div style={{display:'flex',gap:6}}><button className="btn btn-sm btn-secondary" onClick={()=>openEdit(g)}>✏️</button><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(g._id)}>🗑️</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>
      {modal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">{editId?'Edit Grade':'Add Grade'}</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div><div className="modal-body"><form onSubmit={handleSubmit}><div className="modal-grid">
        <div className="form-group col-span-2"><label className="form-label">Student *</label><select className="form-input" value={form.student} onChange={e=>f('student',e.target.value)} required><option value="">Select student...</option>{students.map(s=><option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId}) - {s.grade}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Subject *</label><select className="form-input" value={form.subject} onChange={e=>f('subject',e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Exam Type</label><select className="form-input" value={form.examType} onChange={e=>f('examType',e.target.value)}>{EXAM_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Marks *</label><input type="number" className="form-input" value={form.marks} onChange={e=>f('marks',e.target.value)} required min="0" max={form.totalMarks} /></div>
        <div className="form-group"><label className="form-label">Total Marks</label><input type="number" className="form-input" value={form.totalMarks} onChange={e=>f('totalMarks',e.target.value)} min="1" /></div>
        <div className="form-group"><label className="form-label">Semester</label><select className="form-input" value={form.semester} onChange={e=>f('semester',e.target.value)}><option>Semester 1</option><option>Semester 2</option></select></div>
        <div className="form-group"><label className="form-label">Academic Year</label><select className="form-input" value={form.academicYear} onChange={e=>f('academicYear',e.target.value)}><option>2025-2026</option><option>2024-2025</option></select></div>
        <div className="form-group col-span-2"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e=>f('remarks',e.target.value)} placeholder="Optional..." /></div>
        {form.marks&&<div style={{gridColumn:'1/-1',padding:'12px 16px',background:'var(--accent-light)',borderRadius:10,fontSize:14}}>Preview: <strong>{pct(form.marks,form.totalMarks)}%</strong> → Grade: <strong>{autoGrade()}</strong></div>}
      </div><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:24}}><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':editId?'Update':'Add Grade'}</button></div></form></div></div></div>}
    </div>
  );
}
