// StudentGrades.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

const GRADE_COLOR = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' };

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSem, setFilterSem] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const r = await API.get('/grades');
        setGrades(r.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const subjects = [...new Set(grades.map(g => g.subject))];
  const filtered = grades.filter(g => (!filterSubject || g.subject === filterSubject) && (!filterSem || g.semester === filterSem));
  const avg = filtered.length > 0 ? (filtered.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / filtered.length).toFixed(1) : 0;

  // Group by subject
  const bySubject = {};
  filtered.forEach(g => { if (!bySubject[g.subject]) bySubject[g.subject] = []; bySubject[g.subject].push(g); });

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Grades</div><div className="page-subtitle">{grades.length} records · Average: {avg}%</div></div>
      </div>

      <div className="search-bar">
        <select className="form-input" style={{ width: 170 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-input" style={{ width: 150 }} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
          <option value="">All Semesters</option>
          <option>Semester 1</option><option>Semester 2</option>
        </select>
      </div>

      {Object.keys(bySubject).length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📊</div><p>No grades found</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(bySubject).map(([subject, subGrades]) => {
            const subAvg = (subGrades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / subGrades.length).toFixed(1);
            const overallGrade = subAvg >= 90 ? 'A+' : subAvg >= 80 ? 'A' : subAvg >= 70 ? 'B' : subAvg >= 60 ? 'C' : subAvg >= 50 ? 'D' : 'F';
            return (
              <div key={subject} className="card">
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>📚 {subject}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Avg: <strong style={{ color: 'var(--text)' }}>{subAvg}%</strong></span>
                    <span className={`badge badge-${GRADE_COLOR[overallGrade] || 'gray'}`} style={{ fontSize: 14, fontWeight: 800 }}>{overallGrade}</span>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Exam Type</th><th>Marks</th><th>Score</th><th>Grade</th><th>Semester</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {subGrades.map(g => (
                        <tr key={g._id}>
                          <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{g.examType}</span></td>
                          <td style={{ fontWeight: 700 }}>{g.marks}<span style={{ color: 'var(--text-3)', fontWeight: 400 }}>/{g.totalMarks}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div className="progress-fill" style={{ width: `${(g.marks / g.totalMarks) * 100}%`, background: `var(--${GRADE_COLOR[g.grade] === 'success' ? 'success' : GRADE_COLOR[g.grade] === 'danger' ? 'danger' : 'warning'})` }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{((g.marks / g.totalMarks) * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${GRADE_COLOR[g.grade] || 'gray'}`}>{g.grade}</span></td>
                          <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{g.semester}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{g.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
