import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

const STATUS_COLOR = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' };
const STATUS_ICON = { present: '✅', absent: '❌', late: '⏰', excused: '📝' };

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await API.get('/auth/me');
        const profile = me.data.profile;
        if (!profile) return;
        setStudentId(profile._id);
        const [ar, sr] = await Promise.all([
          API.get('/attendance', { params: { personId: profile._id } }),
          API.get(`/attendance/stats/${profile._id}`),
        ]);
        setRecords(ar.data); setStats(sr.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const pct = stats?.percentage || 0;
  const pctNum = parseFloat(pct);
  const pctColor = pctNum >= 80 ? 'var(--success)' : pctNum >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Attendance</div><div className="page-subtitle">Your complete attendance record</div></div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', marginBottom: 24 }}>
          {[
            { l: 'Total Days', v: stats.total, i: '📅', bg: 'rgba(67,97,238,0.1)' },
            { l: 'Present', v: stats.present, i: '✅', bg: 'rgba(16,185,129,0.1)' },
            { l: 'Absent', v: stats.absent, i: '❌', bg: 'rgba(239,68,68,0.1)' },
            { l: 'Late', v: stats.late, i: '⏰', bg: 'rgba(245,158,11,0.1)' },
            { l: 'Attendance', v: `${pct}%`, i: '📊', bg: 'rgba(139,92,246,0.1)' },
          ].map(c => (
            <div key={c.l} className="stat-card">
              <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 18 }}>{c.i}</span></div>
              <div className="stat-body"><div className="stat-label">{c.l}</div><div className="stat-value" style={{ fontSize: 22 }}>{c.v}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance rate bar */}
      {stats && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700 }}>Attendance Rate</span>
            <span style={{ fontWeight: 800, color: pctColor, fontSize: 18 }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pctColor }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
            {pctNum >= 80 ? '🎉 Excellent attendance!' : pctNum >= 60 ? '⚠️ Attendance needs improvement' : '🚨 Critical: attendance below 60%'}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
          Attendance Records ({records.length})
        </div>
        {records.length === 0 ? (
          <div className="empty-state"><p>No attendance records found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Day</th><th>Status</th><th>Time In</th><th>Remarks</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{new Date(r.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{new Date(r.date).toLocaleDateString('en', { weekday: 'long' })}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[r.status]}`}>{STATUS_ICON[r.status]} {r.status}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{r.checkInTime || '-'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
