// TeacherDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/dashboard/teacher').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!data) return <div>Failed to load</div>;

  const { teacher, totalStudents, todayAttMarked, notices, recentGrades } = data;
  const gradeColor = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

  return (
    <div>
      <div className="profile-hero" style={{ marginBottom: 24 }}>
        <div className="avatar avatar-xl">{teacher.firstName[0]}{teacher.lastName[0]}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Good day, Teacher 👋</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>{teacher.firstName} {teacher.lastName}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>{teacher.subject} · {teacher.teacherId}</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { l: 'Total Students', v: totalStudents, i: '🎓', bg: 'rgba(67,97,238,0.1)' },
          { l: 'Attendance Marked Today', v: todayAttMarked, i: '✅', bg: 'rgba(16,185,129,0.1)' },
          { l: 'My Subject', v: teacher.subject, i: '📚', bg: 'rgba(245,158,11,0.1)' },
          { l: 'Experience', v: `${teacher.experience} yrs`, i: '🏆', bg: 'rgba(139,92,246,0.1)' },
        ].map(c => (
          <div key={c.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 22 }}>{c.i}</span></div>
            <div className="stat-body"><div className="stat-label">{c.l}</div><div className="stat-value" style={{ fontSize: 20 }}>{c.v}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            📊 Recent Grades
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/grades')}>View All</button>
          </div>
          {recentGrades?.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><p>No grades added yet</p></div> : (
            <div>
              {recentGrades?.map(g => (
                <div key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar avatar-sm">{g.student?.firstName?.[0]}{g.student?.lastName?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{g.student?.firstName} {g.student?.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{g.subject} · {g.examType}</div>
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

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>📢 Notices</div>
          {notices?.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><p>No notices</p></div> : (
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notices?.map(n => (
                <div key={n._id} className="notice-card">
                  <div className="notice-card-bar" style={{ background: n.category === 'urgent' ? '#ef4444' : n.category === 'exam' ? '#f59e0b' : '#4361ee' }} />
                  <div style={{ paddingLeft: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{n.content?.slice(0, 60)}...</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/attendance')}>✅ Mark Attendance</button>
          <button className="btn btn-secondary" onClick={() => navigate('/grades')}>📊 Add Grades</button>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/profile')}>👤 My Profile</button>
        </div>
      </div>
    </div>
  );
}
