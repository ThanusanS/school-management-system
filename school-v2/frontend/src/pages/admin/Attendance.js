// Attendance.js - Student Attendance
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const GRADES = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const STATUS = ['present','absent','late','excused'];
const STATUS_COLOR = { present:'success', absent:'danger', late:'warning', excused:'info' };
const STATUS_ICON = { present:'✅', absent:'❌', late:'⏰', excused:'📝' };

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState('Grade 9');
  const [section, setSection] = useState('A');
  const [students, setStudents] = useState([]);
  const [attMap, setAttMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('mark');
  const [report, setReport] = useState([]);

  const load = useCallback(async () => {
    if (!grade) return; setLoading(true);
    try {
      const [sr, ar] = await Promise.all([
        API.get('/students', { params: { grade, section, limit:100 } }),
        API.get('/attendance', { params: { date, grade, section, type:'Student' } }),
      ]);
      setStudents(sr.data.students);
      const map = {};
      ar.data.forEach(a => { map[a.person?._id || a.person] = { status: a.status, remarks: a.remarks||'' }; });
      sr.data.students.forEach(s => { if (!map[s._id]) map[s._id] = { status:'present', remarks:'' }; });
      setAttMap(map);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [date, grade, section]);

  useEffect(() => { if (tab==='mark') load(); }, [load, tab]);

  useEffect(() => {
    if (tab==='report') API.get('/attendance', { params:{ date, grade, type:'Student' } }).then(r=>setReport(r.data)).catch(console.error);
  }, [tab, date, grade]);

  const save = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({ personId:s._id, status:attMap[s._id]?.status||'present', remarks:attMap[s._id]?.remarks||'' }));
      await API.post('/attendance/bulk', { records, date, grade, section, personModel:'Student' });
      toast.success(`Saved for ${students.length} students!`);
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const counts = { present:students.filter(s=>attMap[s._id]?.status==='present').length, absent:students.filter(s=>attMap[s._id]?.status==='absent').length, late:students.filter(s=>attMap[s._id]?.status==='late').length, excused:students.filter(s=>attMap[s._id]?.status==='excused').length };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Student Attendance</div><div className="page-subtitle">Track daily attendance</div></div>
      </div>
      <div className="tabs">
        <button className={`tab-btn ${tab==='mark'?'active':''}`} onClick={()=>setTab('mark')}>📋 Mark Attendance</button>
        <button className={`tab-btn ${tab==='report'?'active':''}`} onClick={()=>setTab('report')}>📊 Daily Report</button>
      </div>
      <div className="search-bar">
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:13,color:'var(--text-3)',fontWeight:600}}>📅</span><input type="date" className="form-input" value={date} onChange={e=>setDate(e.target.value)} style={{width:160}} /></div>
        <select className="form-input" style={{width:150}} value={grade} onChange={e=>setGrade(e.target.value)}>{GRADES.map(g=><option key={g}>{g}</option>)}</select>
        <select className="form-input" style={{width:100}} value={section} onChange={e=>setSection(e.target.value)}><option>A</option><option>B</option><option>C</option></select>
      </div>
      {tab==='mark'&&<>
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {Object.entries(counts).map(([st,cnt])=>(
            <div key={st} style={{background:'var(--surface)',borderRadius:12,padding:'14px 20px',border:'1px solid var(--border)',boxShadow:'var(--shadow)',minWidth:110,display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:22}}>{STATUS_ICON[st]}</div>
              <div><div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800}}>{cnt}</div><div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize',fontWeight:600}}>{st}</div></div>
            </div>
          ))}
        </div>
        <div className="card">
          {loading?<div className="loading-wrap"><div className="spinner"/></div>:students.length===0?<div className="empty-state"><p>No students in {grade}-{section}</p></div>:<>
            <div className="table-wrap"><table>
              <thead><tr><th>#</th><th>Student</th><th>Roll</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>{students.map((s,i)=>(
                <tr key={s._id}>
                  <td style={{color:'var(--text-3)',fontSize:13,width:40}}>{i+1}</td>
                  <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar">{s.firstName[0]}{s.lastName[0]}</div><div><div style={{fontWeight:600}}>{s.firstName} {s.lastName}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{s.studentId}</div></div></div></td>
                  <td style={{color:'var(--text-3)',fontSize:13}}>{s.rollNumber||'-'}</td>
                  <td><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {STATUS.map(st=>(
                      <button key={st} className={`btn btn-sm ${attMap[s._id]?.status===st?`btn-${STATUS_COLOR[st]||'primary'}`:'btn-secondary'}`} style={{textTransform:'capitalize',minWidth:72}} onClick={()=>setAttMap(p=>({...p,[s._id]:{...p[s._id],status:st}}))}>
                        {STATUS_ICON[st]} {st}
                      </button>
                    ))}
                  </div></td>
                  <td><input className="form-input" style={{padding:'6px 10px',fontSize:12}} placeholder="Remark..." value={attMap[s._id]?.remarks||''} onChange={e=>setAttMap(p=>({...p,[s._id]:{...p[s._id],remarks:e.target.value}}))} /></td>
                </tr>
              ))}</tbody>
            </table></div>
            <div style={{padding:'16px 22px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,color:'var(--text-3)'}}>{students.length} students · {counts.present} present · {counts.absent} absent</span>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'💾 Save Attendance'}</button>
            </div>
          </>}
        </div>
      </>}
      {tab==='report'&&<div className="card">
        <div style={{padding:'16px 22px',borderBottom:'1px solid var(--border)',fontFamily:'var(--font-display)',fontWeight:700}}>Report for {new Date(date).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
        {report.length===0?<div className="empty-state"><p>No records found</p></div>:<div className="table-wrap"><table>
          <thead><tr><th>Student</th><th>Grade</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>{report.map(a=>(
            <tr key={a._id}><td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar">{a.person?.firstName?.[0]}{a.person?.lastName?.[0]}</div><span>{a.person?.firstName} {a.person?.lastName}</span></div></td><td>{a.grade}</td><td><span className={`badge badge-${STATUS_COLOR[a.status]}`}>{STATUS_ICON[a.status]} {a.status}</span></td><td style={{fontSize:13,color:'var(--text-3)'}}>{a.remarks||'-'}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>}
    </div>
  );
}
