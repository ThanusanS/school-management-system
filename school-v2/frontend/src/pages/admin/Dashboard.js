import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import API from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: 'var(--text-3)' }, border: { display: false } },
    y: { grid: { color: 'var(--border)' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: 'var(--text-3)' }, border: { display: false } },
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!stats) return <div>Error loading dashboard</div>;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: '#4361ee', bg: 'rgba(67,97,238,0.1)' },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: '👩‍🏫', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Present Today', value: stats.presentToday, icon: '✅', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', sub: `${stats.attendanceRate}% rate` },
    { label: 'Fee Collected', value: `$${(stats.feeCollected / 1000).toFixed(0)}k`, icon: '💳', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', sub: `$${(stats.feePending / 1000).toFixed(0)}k pending` },
    { label: 'Pending Fees', value: stats.pendingFees, icon: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', sub: 'Records' },
    { label: 'Library Overdue', value: stats.overdueBooks, icon: '📚', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', sub: 'Books' },
  ];

  const lineData = {
    labels: stats.attendanceTrend.map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Present', data: stats.attendanceTrend.map(d => d.present), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4, borderWidth: 2 },
      { label: 'Absent', data: stats.attendanceTrend.map(d => d.absent), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)', fill: true, tension: 0.4, pointBackgroundColor: '#ef4444', pointRadius: 4, borderWidth: 2 },
    ],
  };

  const barData = {
    labels: stats.studentsByGrade.map(g => g._id),
    datasets: [{
      data: stats.studentsByGrade.map(g => g.count),
      backgroundColor: ['rgba(67,97,238,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(59,130,246,0.8)'],
      borderRadius: 8, borderSkipped: false,
    }],
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {statCards.map((c, i) => (
          <div key={c.label} className="stat-card" style={{ '--icon-color': c.color, animationDelay: `${i * 0.06}s` }}>
            <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 22 }}>{c.icon}</span></div>
            <div className="stat-body">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              {c.sub && <div className="stat-sub">{c.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Attendance Trend</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Last 7 days</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)' }}>
              <span><span style={{ color: '#10b981' }}>●</span> Present</span>
              <span><span style={{ color: '#ef4444' }}>●</span> Absent</span>
            </div>
          </div>
          <div className="chart-wrap"><Line data={lineData} options={chartDefaults} /></div>
        </div>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Students by Grade</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Active enrollments</div>
          </div>
          <div className="chart-wrap"><Bar data={barData} options={chartDefaults} /></div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        {/* Recent students */}
        <div className="card">
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            🎓 Recent Students
          </div>
          <div>
            {stats.recentStudents.map(s => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar">{s.firstName[0]}{s.lastName[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.grade} · {s.studentId}</div>
                </div>
                <span className="badge badge-success">{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="card">
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            📢 Latest Notices
          </div>
          <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recentNotices?.map(n => {
              const colors = { urgent: '#ef4444', exam: '#f59e0b', event: '#4361ee', holiday: '#10b981', general: '#6b7280' };
              return (
                <div key={n._id} className="notice-card">
                  <div className="notice-card-bar" style={{ background: colors[n.category] || '#6b7280' }} />
                  <div style={{ paddingLeft: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{n.content?.slice(0, 70)}...</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                      <span className={`badge badge-${n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'gray'}`}>{n.priority}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
