// StudentTimetable.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const SUBJECTS_COLORS = ['#4361ee','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#06b6d4','#84cc16'];

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await API.get('/auth/me');
        const profile = me.data.profile;
        if (profile) {
          setGrade(profile.grade); setSection(profile.section || 'A');
          const r = await API.get('/timetable', { params: { grade: profile.grade, section: profile.section || 'A', academicYear: '2025-2026' } });
          setTimetable(r.data);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, []);

  const byDay = {};
  DAYS.forEach(d => { byDay[d] = timetable.filter(t => t.dayOfWeek === d).sort((a,b) => a.startTime.localeCompare(b.startTime)); });

  const allSubjects = [...new Set(timetable.map(t => t.subject))];
  const colorMap = {};
  allSubjects.forEach((s, i) => { colorMap[s] = SUBJECTS_COLORS[i % SUBJECTS_COLORS.length]; });

  const today = new Date().toLocaleDateString('en', { weekday: 'long' });

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Timetable</div><div className="page-subtitle">{grade} - Section {section} · 2025-2026</div></div>
      </div>
      {timetable.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📅</div><p>No timetable available yet</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAYS.map(day => byDay[day].length > 0 && (
            <div key={day} className="card" style={{ overflow: 'hidden', border: day === today ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
              <div style={{ padding: '12px 20px', background: day === today ? 'var(--accent-light)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: day === today ? 'var(--accent)' : 'var(--text)' }}>{day}</div>
                {day === today && <span className="badge badge-accent">Today</span>}
                <span className="badge badge-gray">{byDay[day].length} periods</span>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '14px 20px', overflowX: 'auto' }}>
                {byDay[day].map(t => (
                  <div key={t._id} style={{ flex: '0 0 160px', padding: '12px 14px', borderRadius: 10, borderLeft: `3px solid ${colorMap[t.subject] || 'var(--accent)'}`, background: `${colorMap[t.subject] || 'var(--accent)'}15`, minHeight: 72 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: colorMap[t.subject] }}>{t.subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{t.teacher?.firstName} {t.teacher?.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{t.startTime} – {t.endTime}</div>
                    {t.room && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>🚪 {t.room}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
