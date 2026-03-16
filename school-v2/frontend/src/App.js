import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Attendance from './pages/admin/Attendance';
import TeacherAttendance from './pages/admin/TeacherAttendance';
import Grades from './pages/admin/Grades';
import Fees from './pages/admin/Fees';
import Timetable from './pages/admin/Timetable';
import Notices from './pages/admin/Notices';
import Library from './pages/admin/Library';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentGrades from './pages/student/StudentGrades';
import StudentFees from './pages/student/StudentFees';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentProfile from './pages/student/StudentProfile';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';

const Protected = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index element={<HomeRedirect />} />

          {/* Admin routes */}
          <Route path="dashboard" element={<Protected roles={['admin']}><Dashboard /></Protected>} />
          <Route path="students" element={<Protected roles={['admin']}><Students /></Protected>} />
          <Route path="teachers" element={<Protected roles={['admin']}><Teachers /></Protected>} />
          <Route path="attendance" element={<Protected roles={['admin','teacher']}><Attendance /></Protected>} />
          <Route path="teacher-attendance" element={<Protected roles={['admin']}><TeacherAttendance /></Protected>} />
          <Route path="grades" element={<Protected roles={['admin','teacher']}><Grades /></Protected>} />
          <Route path="fees" element={<Protected roles={['admin']}><Fees /></Protected>} />
          <Route path="timetable" element={<Protected roles={['admin']}><Timetable /></Protected>} />
          <Route path="notices" element={<Protected roles={['admin']}><Notices /></Protected>} />
          <Route path="library" element={<Protected roles={['admin']}><Library /></Protected>} />

          {/* Student routes */}
          <Route path="student/dashboard" element={<Protected roles={['student']}><StudentDashboard /></Protected>} />
          <Route path="student/attendance" element={<Protected roles={['student']}><StudentAttendance /></Protected>} />
          <Route path="student/grades" element={<Protected roles={['student']}><StudentGrades /></Protected>} />
          <Route path="student/fees" element={<Protected roles={['student']}><StudentFees /></Protected>} />
          <Route path="student/timetable" element={<Protected roles={['student']}><StudentTimetable /></Protected>} />
          <Route path="student/profile" element={<Protected roles={['student']}><StudentProfile /></Protected>} />

          {/* Teacher routes */}
          <Route path="teacher/dashboard" element={<Protected roles={['teacher']}><TeacherDashboard /></Protected>} />
          <Route path="teacher/profile" element={<Protected roles={['teacher']}><TeacherProfile /></Protected>} />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
