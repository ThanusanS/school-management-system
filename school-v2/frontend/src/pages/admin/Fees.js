// Fees.js
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const FEE_TYPES = ['tuition','transport','library','sports','exam','other'];
const STATUS_COLOR = { paid:'success', pending:'warning', partial:'info', overdue:'danger' };
const empty = { student:'', feeType:'tuition', amount:'', paidAmount:0, dueDate:'', semester:'Semester 1', academicYear:'2025-2026', remarks:'' };

export default function Fees() {
  const [fees, setFees] = useState([]); const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); const [filterStatus, setFilterStatus] = useState(''); const [summary, setSummary] = useState({});
  const [modal, setModal] = useState(false); const [payModal, setPayModal] = useState(null);
  const [editId, setEditId] = useState(null); const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false); const [payAmount, setPayAmount] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [fr, sr] = await Promise.all([ API.get('/fees', { params:filterStatus?{status:filterStatus}:{} }), API.get('/students', { params:{ limit:200 } }) ]);
      setFees(fr.data); setStudents(sr.data.students);
      const total=fr.data.reduce((s,f)=>s+f.amount,0), paid=fr.data.reduce((s,f)=>s+f.paidAmount,0);
      setSummary({ total, paid, pending:total-paid, count:fr.data.length, overdue:fr.data.filter(f=>f.status==='overdue').length });
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetch(); }, [fetch]);

  const handlePay = async () => {
    try { await API.patch(`/fees/${payModal._id}/pay`, { paidAmount: parseFloat(payAmount) }); toast.success('Payment recorded!'); setPayModal(null); fetch(); }
    catch { toast.error('Error'); }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try { editId ? await API.put(`/fees/${editId}`,form) : await API.post('/fees',form); toast.success('Saved!'); setModal(false); fetch(); }
    catch(err) { toast.error(err.response?.data?.message||'Error'); } finally { setSaving(false); }
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Fee Management</div><div className="page-subtitle">{summary.count||0} fee records</div></div><button className="btn btn-primary" onClick={()=>{setForm(empty);setEditId(null);setModal(true);}}>+ Add Fee</button></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',marginBottom:20}}>
        {[{l:'Total Fees',v:`$${((summary.total||0)/1000).toFixed(1)}k`,i:'💰',c:'#4361ee',bg:'rgba(67,97,238,0.1)'},{l:'Collected',v:`$${((summary.paid||0)/1000).toFixed(1)}k`,i:'✅',c:'#10b981',bg:'rgba(16,185,129,0.1)'},{l:'Pending',v:`$${((summary.pending||0)/1000).toFixed(1)}k`,i:'⏳',c:'#f59e0b',bg:'rgba(245,158,11,0.1)'},{l:'Overdue',v:summary.overdue||0,i:'🚨',c:'#ef4444',bg:'rgba(239,68,68,0.1)'}].map(c=>(
          <div key={c.l} className="stat-card"><div className="stat-icon-wrap" style={{background:c.bg}}><span style={{fontSize:22}}>{c.i}</span></div><div className="stat-body"><div className="stat-label">{c.l}</div><div className="stat-value">{c.v}</div></div></div>
        ))}
      </div>
      <div className="search-bar">
        <select className="form-input" style={{width:150}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">All Status</option><option>paid</option><option>pending</option><option>partial</option><option>overdue</option></select>
      </div>
      <div className="card">
        {loading?<div className="loading-wrap"><div className="spinner"/></div>:fees.length===0?<div className="empty-state"><p>No fee records</p></div>:<div className="table-wrap"><table>
          <thead><tr><th>Student</th><th>Type</th><th>Amount</th><th>Paid</th><th>Pending</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{fees.map(fee=>(
            <tr key={fee._id}>
              <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar" style={{background:'linear-gradient(135deg,#8b5cf6,#7c3aed)'}}>{fee.student?.firstName?.[0]}{fee.student?.lastName?.[0]}</div><div><div style={{fontWeight:600}}>{fee.student?.firstName} {fee.student?.lastName}</div><div style={{fontSize:12,color:'var(--text-3)'}}>{fee.student?.grade}</div></div></div></td>
              <td><span className="badge badge-purple" style={{textTransform:'capitalize'}}>{fee.feeType}</span></td>
              <td style={{fontWeight:700}}>${fee.amount.toLocaleString()}</td>
              <td style={{color:'var(--success)',fontWeight:600}}>${fee.paidAmount.toLocaleString()}</td>
              <td style={{color:fee.amount-fee.paidAmount>0?'var(--danger)':'var(--success)',fontWeight:600}}>${(fee.amount-fee.paidAmount).toLocaleString()}</td>
              <td style={{fontSize:13,color:'var(--text-3)'}}>{new Date(fee.dueDate).toLocaleDateString()}</td>
              <td>
                <span className={`badge badge-${STATUS_COLOR[fee.status]}`}>{fee.status}</span>
                <div className="progress-bar" style={{marginTop:4,width:80}}><div className="progress-fill" style={{width:`${Math.min(100,(fee.paidAmount/fee.amount)*100)}%`,background:`var(--${STATUS_COLOR[fee.status]==='success'?'success':STATUS_COLOR[fee.status]==='warning'?'warning':'danger'})`}} /></div>
              </td>
              <td><div style={{display:'flex',gap:5}}>
                {fee.status!=='paid'&&<button className="btn btn-sm btn-success" onClick={()=>{setPayModal(fee);setPayAmount(fee.amount-fee.paidAmount);}}>💳 Pay</button>}
                <button className="btn btn-sm btn-danger" onClick={async()=>{if(!window.confirm('Delete?'))return;await API.delete(`/fees/${fee._id}`);fetch();}}>🗑️</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>

      {modal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">Add Fee Record</div><button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>✕</button></div><div className="modal-body"><form onSubmit={handleSubmit}><div className="modal-grid">
        <div className="form-group col-span-2"><label className="form-label">Student *</label><select className="form-input" value={form.student} onChange={e=>f('student',e.target.value)} required><option value="">Select...</option>{students.map(s=><option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}</select></div>
        <div className="form-group"><label className="form-label">Fee Type</label><select className="form-input" value={form.feeType} onChange={e=>f('feeType',e.target.value)}>{FEE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Amount *</label><input type="number" className="form-input" value={form.amount} onChange={e=>f('amount',e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Due Date *</label><input type="date" className="form-input" value={form.dueDate} onChange={e=>f('dueDate',e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Semester</label><select className="form-input" value={form.semester} onChange={e=>f('semester',e.target.value)}><option>Semester 1</option><option>Semester 2</option></select></div>
        <div className="form-group col-span-2"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e=>f('remarks',e.target.value)} /></div>
      </div><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Add Fee'}</button></div></form></div></div></div>}

      {payModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setPayModal(null)}><div className="modal"><div className="modal-header"><div className="modal-title">Record Payment</div><button className="btn btn-ghost btn-icon" onClick={()=>setPayModal(null)}>✕</button></div><div className="modal-body">
        <div style={{padding:'16px',background:'var(--surface-2)',borderRadius:12,marginBottom:20}}>
          <div style={{fontSize:14,color:'var(--text-3)'}}>Student</div><div style={{fontWeight:700,fontSize:16}}>{payModal.student?.firstName} {payModal.student?.lastName}</div>
          <div style={{marginTop:8,fontSize:14,color:'var(--text-3)'}}>Outstanding: <strong style={{color:'var(--danger)'}}>${(payModal.amount-payModal.paidAmount).toLocaleString()}</strong></div>
        </div>
        <div className="form-group"><label className="form-label">Payment Amount</label><input type="number" className="form-input" value={payAmount} onChange={e=>setPayAmount(e.target.value)} max={payModal.amount-payModal.paidAmount} /></div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><button className="btn btn-secondary" onClick={()=>setPayModal(null)}>Cancel</button><button className="btn btn-success" onClick={handlePay}>✅ Confirm Payment</button></div>
      </div></div></div>}
    </div>
  );
}
