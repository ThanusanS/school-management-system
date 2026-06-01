# 🏫 EduManage v2.0 — Industry-Level School Management System

A full-stack, role-based school management platform with world-class UI.

---

## 🚀 Tech Stack
- **Frontend**: React 18, React Router v6, Chart.js, DM Sans + Syne fonts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT with role-based access (admin / teacher / student)

---

## ✨ Features

### 🛡️ Admin Portal
| Module | Features |
|---|---|
| Dashboard | Live stats, charts, attendance trend, notices |
| Students | Full CRUD, auto login account creation, profile view |
| Teachers | Full CRUD, auto login account creation |
| Student Attendance | Bulk mark by grade/section, daily report |
| Teacher Attendance | Daily staff attendance tracking |
| Grades | Add/edit grades, auto letter grade, subject grouping |
| Fee Management | Add fees, record payments, progress bar, overdue tracking |
| Timetable | Visual weekly schedule builder per class |
| Notice Board | Post notices by category, priority, audience |
| Library | Book catalog, issue/return tracking, fine calculation |

### 🎓 Student Portal
| Page | Features |
|---|---|
| Dashboard | Hero card, stats, recent grades, notices |
| My Attendance | Full record, % rate, progress bar |
| My Grades | Grouped by subject, progress bars |
| My Fees | Payment status, progress bar, receipts |
| My Timetable | Weekly visual schedule, highlights today |
| My Profile | View personal info, change password |

### 👩‍🏫 Teacher Portal
| Page | Features |
|---|---|
| Dashboard | Stats, recent grades, notices, quick actions |
| Mark Attendance | Mark student attendance by class |
| Add Grades | Add/manage student grades |
| My Profile | View info, change password |

### 🎨 UI Features
- **Dark Mode** — toggle in sidebar, persisted to DB + localStorage
- **World-class design** — Syne display font, DM Sans body, gradient accents
- **Animations** — page transitions, modal spring, stat card hover effects
- **Responsive** — works on mobile, tablet, desktop
- **Role-based sidebar** — different nav per role

---

## ⚡ Quick Start

### 1. Extract & navigate
```
school-v2/
├── backend/
└── frontend/
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm run seed
npm run dev
# → Server on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
# → App on http://localhost:3000
```

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@school.com | admin123 |
| 👩‍🏫 Teacher | james@school.com | teacher123 |
| 🎓 Student | student1@school.com | student123 |

All 30 seeded students: `student1@school.com` → `student30@school.com` / `student123`
All 5 seeded teachers: `james@school.com`, `sarah@school.com`, etc. / `teacher123`

---

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   └── index.js  ← Attendance, Grade, Fee, Timetable, Notice, Library, Notification
├── routes/
│   ├── auth.js        (login, register, theme, change-password)
│   ├── students.js    (role-based CRUD)
│   ├── teachers.js    (role-based CRUD)
│   ├── attendance.js  (student + teacher)
│   ├── grades.js
│   ├── fees.js        (with payment recording)
│   ├── timetable.js
│   ├── notices.js
│   ├── library.js     (books + issue/return)
│   ├── notifications.js
│   ├── reports.js     (report card, export)
│   └── dashboard.js   (admin + student + teacher views)
├── middleware/auth.js  (JWT + role guard)
├── server.js
└── seed.js

frontend/src/
├── pages/
│   ├── Login.js
│   ├── admin/         Dashboard, Students, Teachers, Attendance,
│   │                  TeacherAttendance, Grades, Fees, Timetable,
│   │                  Notices, Library
│   ├── student/       StudentDashboard, StudentAttendance,
│   │                  StudentGrades, StudentFees, StudentTimetable,
│   │                  StudentProfile
│   └── teacher/       TeacherDashboard, TeacherProfile
├── components/layout/ Layout.js, Sidebar.js
├── context/           AuthContext.js (with theme)
├── utils/             api.js
├── App.js             (role-based routing)
└── index.css          (world-class design system + dark mode)
```

---

## 🌐 API Reference

### Auth
- `POST /api/auth/login`
- `GET  /api/auth/me`
- `PATCH /api/auth/theme`
- `PATCH /api/auth/change-password`

### Students / Teachers / Grades / Fees / etc.
All follow RESTful patterns: `GET`, `POST`, `PUT`, `DELETE`

---

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_v2
JWT_SECRET=change_this_secret_key
NODE_ENV=development
```
