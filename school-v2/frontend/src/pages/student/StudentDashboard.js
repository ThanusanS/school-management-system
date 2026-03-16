// StudentDashboard.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/student').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!data) return <div>Failed to load</div>;

  const { student, grades, fees, attStats, notices, pendingFees, avgMarks } = data;

  const statCards = [
    { label: 'Attendance', value: `${attStats.percentage}%`, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', sub: `${attStats.present}/${attStats.total} days present` },
    { label: 'Avg Marks', value: `${avgMarks}%`, icon: '📊', color: '#4361ee', bg: 'rgba(67,97,238,0.1)', sub: `${grades.length} records` },
    { label: 'Pending Fees', value: `$${pendingFees.toLocaleString()}`, icon: '💳', color: pendingFees > 0 ? '#ef4444' : '#10b981', bg: pendingFees > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', sub: pendingFees > 0 ? 'Due payment' : 'All paid!' },
    { label: 'Grade', value: student.grade, icon: '🎓', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', sub: `Section ${student.section}` },
  ];

  const gradeColor = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

  return (
    <div>
      {/* Hero */}
      <div className="profile-hero" style={{ marginBottom: 24 }}>
        <div className="avatar avatar-xl">{student.firstName[0]}{student.lastName[0]}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Welcome back 👋</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>{student.firstName} {student.lastName}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>{student.studentId} · {student.grade} {student.section}</div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((c, i) => (
          <div key={c.label} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 22 }}>{c.icon}</span></div>
            <div className="stat-body">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ fontSize: 24, color: c.color }}>{c.value}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Grades */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>📊 Recent Grades</div>
          {grades.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><p>No grades yet</p></div> : (
            <div>
              {grades.slice(0, 5).map(g => (
                <div key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>{g.examType} · {g.semester}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>{g.marks}/{g.totalMarks}</div>
                    <span className={`badge badge-${gradeColor[g.grade] || 'gray'}`}>{g.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>📢 Notices</div>
          {notices.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><p>No notices</p></div> : (
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notices.map(n => {
                const catColor = { urgent: '#ef4444', exam: '#f59e0b', event: '#4361ee', holiday: '#10b981', general: '#6b7280' };
                return (
                  <div key={n._id} className="notice-card">
                    <div className="notice-card-bar" style={{ background: catColor[n.category] }} />
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{n.content?.slice(0, 60)}...</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
