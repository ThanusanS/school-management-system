// TeacherAttendance.js
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';
const STATUS_ICON = { present:'✅', absent:'❌', late:'⏰', excused:'📝' };
const STATUS_COLOR = { present:'success', absent:'danger', late:'warning', excused:'info' };

export default function TeacherAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState([]);
  const [attMap, setAttMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, ar] = await Promise.all([
        API.get('/teachers', { params:{ limit:100 } }),
        API.get('/attendance', { params:{ date, type:'Teacher' } }),
      ]);
      setTeachers(tr.data.teachers);
      const map = {};
      ar.data.forEach(a => { map[a.person?._id||a.person] = { status:a.status, remarks:a.remarks||'' }; });
      tr.data.teachers.forEach(t => { if (!map[t._id]) map[t._id] = { status:'present', remarks:'' }; });
      setAttMap(map);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const records = teachers.map(t => ({ personId:t._id, status:attMap[t._id]?.status||'present', remarks:attMap[t._id]?.remarks||'' }));
      await API.post('/attendance/bulk', { records, date, personModel:'Teacher' });
      toast.success('Teacher attendance saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const counts = {present:teachers.filter(t=>attMap[t._id]?.status==='present').length,absent:teachers.filter(t=>attMap[t._id]?.status==='absent').length};

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Teacher Attendance</div><div className="page-subtitle">Daily staff attendance tracker</div></div></div>
      <div className="search-bar"><input type="date" className="form-input" value={date} onChange={e=>setDate(e.target.value)} style={{width:180}} /></div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        {Object.entries(counts).map(([st,cnt])=>(
          <div key={st} style={{background:'var(--surface)',borderRadius:12,padding:'14px 20px',border:'1px solid var(--border)',boxShadow:'var(--shadow)',display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontSize:22}}>{STATUS_ICON[st]}</div><div><div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800}}>{cnt}</div><div style={{fontSize:11,color:'var(--text-3)',textTransform:'capitalize',fontWeight:600}}>{st}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        {loading?<div className="loading-wrap"><div className="spinner"/></div>:<>
          <div className="table-wrap"><table>
            <thead><tr><th>#</th><th>Teacher</th><th>Subject</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>{teachers.map((t,i)=>(
              <tr key={t._id}>
                <td style={{color:'var(--text-3)',fontSize:13}}>{i+1}</td>
                <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>{t.firstName[0]}{t.lastName[0]}</div><div><div style={{fontWeight:600}}>{t.firstName} {t.lastName}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{t.teacherId}</div></div></div></td>
                <td><span className="badge badge-success">{t.subject}</span></td>
                <td><div style={{display:'flex',gap:5}}>
                  {['present','absent','late','excused'].map(st=>(
                    <button key={st} className={`btn btn-sm ${attMap[t._id]?.status===st?`btn-${STATUS_COLOR[st]}`:'btn-secondary'}`} style={{textTransform:'capitalize',minWidth:68}} onClick={()=>setAttMap(p=>({...p,[t._id]:{...p[t._id],status:st}}))}>{STATUS_ICON[st]} {st}</button>
                  ))}
                </div></td>
                <td><input className="form-input" style={{padding:'6px 10px',fontSize:12}} placeholder="Remark..." value={attMap[t._id]?.remarks||''} onChange={e=>setAttMap(p=>({...p,[t._id]:{...p[t._id],remarks:e.target.value}}))} /></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div style={{padding:'16px 22px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'💾 Save Attendance'}</button>
          </div>
        </>}
      </div>
    </div>
  );
}
