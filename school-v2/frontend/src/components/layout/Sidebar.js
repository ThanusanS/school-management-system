import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { section: 'Overview', items: [
    { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  ]},
  { section: 'People', items: [
    { path: '/students', label: 'Students', icon: '🎓' },
    { path: '/teachers', label: 'Teachers', icon: '👩‍🏫' },
  ]},
  { section: 'Academics', items: [
    { path: '/attendance', label: 'Student Attendance', icon: '✅' },
    { path: '/teacher-attendance', label: 'Teacher Attendance', icon: '📌' },
    { path: '/grades', label: 'Grades', icon: '📊' },
    { path: '/timetable', label: 'Timetable', icon: '📅' },
  ]},
  { section: 'Finance & Admin', items: [
    { path: '/fees', label: 'Fee Management', icon: '💳' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/notices', label: 'Notice Board', icon: '📢' },
  ]},
];

const studentNav = [
  { section: 'My Portal', items: [
    { path: '/student/dashboard', label: 'Dashboard', icon: '⬡' },
    { path: '/student/profile', label: 'My Profile', icon: '👤' },
  ]},
  { section: 'Academics', items: [
    { path: '/student/attendance', label: 'My Attendance', icon: '✅' },
    { path: '/student/grades', label: 'My Grades', icon: '📊' },
    { path: '/student/timetable', label: 'Timetable', icon: '📅' },
  ]},
  { section: 'Finance', items: [
    { path: '/student/fees', label: 'My Fees', icon: '💳' },
  ]},
];

const teacherNav = [
  { section: 'My Portal', items: [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: '⬡' },
    { path: '/teacher/profile', label: 'My Profile', icon: '👤' },
  ]},
  { section: 'Manage', items: [
    { path: '/attendance', label: 'Mark Attendance', icon: '✅' },
    { path: '/grades', label: 'Grades', icon: '📊' },
  ]},
];

const Sidebar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const nav = user?.role === 'student' ? studentNav : user?.role === 'teacher' ? teacherNav : adminNav;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">🏫</div>
        <div>
          <div className="logo-text-main">EduManage</div>
          <div className="logo-text-sub">
            {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, justifyContent: 'center', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--danger)' }}
          >
            🚪 Logout
          </button>
        </div>
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
