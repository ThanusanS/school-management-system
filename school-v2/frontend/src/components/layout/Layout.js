import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const titles = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/attendance': 'Student Attendance',
  '/teacher-attendance': 'Teacher Attendance',
  '/grades': 'Grades & Reports',
  '/fees': 'Fee Management',
  '/timetable': 'Timetable',
  '/notices': 'Notice Board',
  '/library': 'Library',
  '/student/dashboard': 'My Dashboard',
  '/student/attendance': 'My Attendance',
  '/student/grades': 'My Grades',
  '/student/fees': 'My Fees',
  '/student/timetable': 'My Timetable',
  '/student/profile': 'My Profile',
  '/teacher/dashboard': 'Teacher Dashboard',
  '/teacher/profile': 'My Profile',
};

export default function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = titles[pathname] || 'EduManage';
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{now}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginRight: 8 }}>
              Welcome, <strong style={{ color: 'var(--text)' }}>{user?.name?.split(' ')[0]}</strong>
            </div>
            <div className="avatar avatar-sm">{user?.name?.charAt(0)}</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
