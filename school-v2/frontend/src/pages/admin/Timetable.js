import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const GRADES = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SUBJECTS = ['Mathematics','Science','English','History','Computer Science','Physical Education','Art','Music','Chemistry','Biology'];
const empty = { grade:'Grade 9', section:'A', dayOfWeek:'Monday', startTime:'08:00', endTime:'08:45', subject:'Mathematics', teacher:'', room:'', academicYear:'2025-2026' };

export default function Timetable() {
  const [timetable, setTimetable] = useState([]); const [teachers, setTeachers] = useState([]);
  const [grade, setGrade] = useState('Grade 9'); const [section, setSection] = useState('A');
  const [modal, setModal] = useState(false); const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const [tr, tch] = await Promise.all([
        API.get('/timetable', { params:{ grade, section, academicYear:'2025-2026' } }),
        API.get('/teachers', { params:{ limit:100 } }),
      ]);
      setTimetable(tr.data); setTeachers(tch.data.teachers);
    } catch { toast.error('Failed'); }
  };

  useEffect(() => { fetch(); }, [grade, section]);

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try { editId ? await API.put(`/timetable/${editId}`,form) : await API.post('/timetable',form); toast.success('Saved!'); setModal(false); fetch(); }
    catch(err) { toast.error(err.response?.data?.message||'Error'); } finally { setSaving(false); }
  };

  const handleDelete = async id => { try { await API.delete(`/timetable/${id}`); fetch(); } catch { toast.error('Error'); } };
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  // Group by day
  const byDay = {};
  DAYS.forEach(d => { byDay[d] = timetable.filter(t=>t.dayOfWeek===d).sort((a,b)=>a.startTime.localeCompare(b.startTime)); });
  const subjectColors = ['#4361ee','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#06b6d4','#84cc16'];
  const subjectColorMap = {};
  SUBJECTS.forEach((s,i) => { subjectColorMap[s] = subjectColors[i%subjectColors.length]; });

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Timetable</div><div className="page-subtitle">Weekly class schedule</div></div><button className="btn btn-primary" onClick={()=>{setForm({...empty,grade,section});setEditId(null);setModal(true);}}>+ Add Period</button></div>
      <div className="search-bar">
        <select className="form-input" style={{width:150}} value={grade} onChange={e=>setGrade(e.target.value)}>{GRADES.map(g=><option key={g}>{g}</option>)}</select>
        <select className="form-input" style={{width:100}} value={section} onChange={e=>setSection(e.target.value)}><option>A</option><option>B</option><option>C</option></select>
      </div>

      {timetable.length===0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📅</div><p>No timetable for {grade}-{section}</p></div></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {DAYS.map(day => byDay[day].length > 0 && (
            <div key={day} className="card" style={{overflow:'hidden'}}>
              <div style={{padding:'14px 20px',background:'var(--surface-2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:16}}>{day}</div>
                <span className="badge badge-gray">{byDay[day].length} periods</span>
              </div>
              <div style={{display:'flex',gap:10,padding:'14px 20px',flexWrap:'wrap'}}>
                {byDay[day].map(t=>(
                  <div key={t._id} className="tt-cell" style={{flex:'0 0 160px',borderLeft:`3px solid ${subjectColorMap[t.subject]||'var(--accent)'}`,background:`${subjectColorMap[t.subject]||'var(--accent)'}15`}}>
                    <div className="tt-subject" style={{color:subjectColorMap[t.subject]}}>{t.subject}</div>
                    <div className="tt-teacher">{t.teacher?.firstName} {t.teacher?.lastName}</div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                      <div className="tt-time">{t.startTime}–{t.endTime}</div>
                      {t.room&&<div className="tt-room">🚪 {t.room}</div>}
                    </div>
                    <div style={{display:'flex',gap:4,marginTop:6}}>
                      <button className="btn btn-sm btn-secondary btn-icon-sm" style={{padding:'3px 6px',fontSize:11}} onClick={()=>{setForm({grade:t.grade,section:t.section,dayOfWeek:t.dayOfWeek,startTime:t.startTime,endTime:t.endTime,subject:t.subject,teacher:t.teacher?._id||'',room:t.room||'',academicYear:t.academicYear});setEditId(t._id);setModal(true);}}>✏️</button>
                      <button className="btn btn-sm btn-danger btn-icon-sm" style={{padding:'3px 6px',fontSize:11}} onClick={()=>handleDelete(t._id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">{editId?'Edit Period':'Add Period'}</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div><div className="modal-body"><form onSubmit={handleSubmit}><div className="modal-grid">
        <div className="form-group"><label className="form-label">Grade</label><select className="form-input" value={form.grade} onChange={e=>f('grade',e.target.value)}>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Section</label><select className="form-input" value={form.section} onChange={e=>f('section',e.target.value)}><option>A</option><option>B</option><option>C</option></select></div>
        <div className="form-group"><label className="form-label">Day *</label><select className="form-input" value={form.dayOfWeek} onChange={e=>f('dayOfWeek',e.target.value)}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Subject *</label><select className="form-input" value={form.subject} onChange={e=>f('subject',e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-input" value={form.startTime} onChange={e=>f('startTime',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-input" value={form.endTime} onChange={e=>f('endTime',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Teacher</label><select className="form-input" value={form.teacher} onChange={e=>f('teacher',e.target.value)}><option value="">Select...</option>{teachers.map(t=><option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Room</label><input className="form-input" value={form.room} onChange={e=>f('room',e.target.value)} placeholder="e.g. Room 101" /></div>
      </div><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':editId?'Update':'Add Period'}</button></div></form></div></div></div>}
    </div>
  );
}
