const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const { Grade, Fee, Attendance, Timetable, Notice, Library } = require('./models/index');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_v2');
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
    Grade.deleteMany({}), Fee.deleteMany({}), Attendance.deleteMany({}),
    Timetable.deleteMany({}), Notice.deleteMany({}), Library.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

  // Admin
  const admin = new User({ name: 'Admin User', email: 'admin@school.com', password: 'admin123', role: 'admin' });
  await admin.save();
  console.log('✅ Admin: admin@school.com / admin123');

  // Teachers
  const teacherData = [
    { firstName: 'James', lastName: 'Wilson', email: 'james@school.com', subject: 'Mathematics', qualification: 'M.Sc Math', experience: 8, salary: 45000, assignedClasses: ['Grade 9', 'Grade 10'], gender: 'male' },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@school.com', subject: 'Science', qualification: 'M.Sc Physics', experience: 5, salary: 42000, assignedClasses: ['Grade 8', 'Grade 9'], gender: 'female' },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael@school.com', subject: 'English', qualification: 'MA English', experience: 12, salary: 48000, assignedClasses: ['Grade 10', 'Grade 11'], gender: 'male' },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily@school.com', subject: 'History', qualification: 'MA History', experience: 3, salary: 38000, assignedClasses: ['Grade 7', 'Grade 8'], gender: 'female' },
    { firstName: 'Robert', lastName: 'Miller', email: 'robert@school.com', subject: 'Computer Science', qualification: 'B.Tech CS', experience: 6, salary: 50000, assignedClasses: ['Grade 11', 'Grade 12'], gender: 'male' },
  ];

  const teachers = [];
  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i];
    const user = new User({ name: `${t.firstName} ${t.lastName}`, email: t.email, password: 'teacher123', role: 'teacher' });
    await user.save();
    const teacher = new Teacher({ ...t, teacherId: `TCH${String(i + 1).padStart(4, '0')}`, phone: `555-010${i+1}`, userId: user._id });
    await teacher.save();
    await User.findByIdAndUpdate(user._id, { profileId: teacher._id });
    teachers.push(teacher);
  }
  console.log('✅ Teachers seeded (5) — password: teacher123');

  // Students
  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const sections = ['A', 'B'];
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia', 'Kevin', 'Laura', 'Mark', 'Nancy', 'Oscar', 'Patricia', 'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zack', 'Amy', 'Brian', 'Cathy', 'David'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];

  const students = [];
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i % lastNames.length];
    const email = `student${i + 1}@school.com`;
    const grade = grades[i % grades.length];
    const section = sections[i % sections.length];

    const user = new User({ name: `${firstName} ${lastName}`, email, password: 'student123', role: 'student' });
    await user.save();

    const student = new Student({
      studentId: `STU${String(i + 1).padStart(4, '0')}`,
      firstName, lastName, email,
      phone: `555-${String(1000 + i).padStart(4, '0')}`,
      grade, section,
      gender: i % 2 === 0 ? 'male' : 'female',
      dateOfBirth: new Date(2006 - (i % 6), i % 12, (i % 28) + 1),
      parentName: `Parent of ${firstName}`,
      parentPhone: `555-${String(2000 + i).padStart(4, '0')}`,
      parentEmail: `parent${i + 1}@email.com`,
      address: `${100 + i} Main Street, City`,
      bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
      rollNumber: String(i + 1).padStart(3, '0'),
      userId: user._id,
    });
    await student.save();
    await User.findByIdAndUpdate(user._id, { profileId: student._id });
    students.push(student);
  }
  console.log('✅ Students seeded (30) — password: student123');

  // Grades
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science'];
  const examTypes = ['midterm', 'final', 'quiz'];
  for (const student of students.slice(0, 20)) {
    for (const subject of subjects) {
      for (const examType of examTypes.slice(0, 2)) {
        const marks = Math.floor(Math.random() * 40) + 55;
        const grade = new Grade({ student: student._id, subject, examType, marks, totalMarks: 100, semester: 'Semester 1', academicYear: '2025-2026', teacher: teachers[Math.floor(Math.random() * teachers.length)]._id });
        await grade.save();
      }
    }
  }
  console.log('✅ Grades seeded');

  // Fees
  const feeTypes = ['tuition', 'transport', 'library', 'sports'];
  for (const student of students) {
    for (const feeType of feeTypes.slice(0, 2)) {
      const amount = feeType === 'tuition' ? 5000 : 1000;
      const paidAmount = Math.random() > 0.3 ? amount : Math.random() > 0.5 ? Math.floor(amount * 0.5) : 0;
      const status = paidAmount >= amount ? 'paid' : paidAmount > 0 ? 'partial' : Math.random() > 0.7 ? 'overdue' : 'pending';
      const count = await Fee.countDocuments();
      await Fee.create({
        student: student._id, feeType, amount, paidAmount, status,
        dueDate: new Date(2025, 8, 30),
        paidDate: paidAmount > 0 ? new Date() : undefined,
        semester: 'Semester 1', academicYear: '2025-2026',
        receiptNumber: `RCP${String(count + 1).padStart(5, '0')}`,
      });
    }
  }
  console.log('✅ Fees seeded');

  // Attendance (last 7 days)
  for (let d = 6; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(12, 0, 0, 0);
    for (const student of students) {
      const rand = Math.random();
      const status = rand > 0.15 ? 'present' : rand > 0.05 ? 'absent' : 'late';
      await Attendance.create({ person: student._id, personModel: 'Student', date, status, grade: student.grade, section: student.section });
    }
    for (const teacher of teachers) {
      const status = Math.random() > 0.1 ? 'present' : 'absent';
      await Attendance.create({ person: teacher._id, personModel: 'Teacher', date, status });
    }
  }
  console.log('✅ Attendance seeded');

  // Notices
  const notices = [
    { title: 'Mid-Term Examinations Schedule', content: 'Mid-term exams will be held from October 15-20. All students must carry their ID cards. Exam timetable is posted on the notice board.', category: 'exam', priority: 'high', targetAudience: ['all'] },
    { title: 'Annual Sports Day 2025', content: 'Annual Sports Day will be held on November 5th. Students interested in participating should register with their class teacher by October 25th.', category: 'event', priority: 'medium', targetAudience: ['students', 'teachers'] },
    { title: 'School Closed - Public Holiday', content: 'School will remain closed on October 10th on account of the public holiday. Regular classes will resume on October 11th.', category: 'holiday', priority: 'medium', targetAudience: ['all'] },
    { title: 'Parent-Teacher Meeting', content: 'Parent-Teacher meeting is scheduled for October 28th from 9 AM to 1 PM. Parents are requested to attend and discuss their ward\'s progress.', category: 'general', priority: 'high', targetAudience: ['all'] },
    { title: 'Library New Arrivals', content: 'The school library has received 50 new books across various subjects. Students are encouraged to visit and explore the new collection.', category: 'general', priority: 'low', targetAudience: ['students'] },
  ];
  for (const n of notices) {
    await Notice.create({ ...n, createdBy: admin._id });
  }
  console.log('✅ Notices seeded');

  // Library books
  const books = [
    { title: 'Introduction to Algorithms', author: 'Cormen et al.', category: 'Computer Science', isbn: '978-0262033848', totalCopies: 3, availableCopies: 2, publisher: 'MIT Press', publishYear: 2009 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', isbn: '978-0061935466', totalCopies: 5, availableCopies: 4, publisher: 'HarperCollins', publishYear: 1960 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', isbn: '978-0553380163', totalCopies: 4, availableCopies: 3, publisher: 'Bantam', publishYear: 1988 },
    { title: 'The Art of War', author: 'Sun Tzu', category: 'History', isbn: '978-1599869773', totalCopies: 3, availableCopies: 3, publisher: 'Filiquarian', publishYear: 500 },
    { title: 'Calculus: Early Transcendentals', author: 'James Stewart', category: 'Mathematics', isbn: '978-1285741550', totalCopies: 6, availableCopies: 5, publisher: 'Cengage', publishYear: 2015 },
    { title: 'World History: Patterns of Interaction', author: 'McDougal Littell', category: 'History', isbn: '978-0547491127', totalCopies: 4, availableCopies: 4, publisher: 'McDougal', publishYear: 2011 },
  ];
  for (let i = 0; i < books.length; i++) {
    await Library.create({ ...books[i], bookId: `BK${String(i + 1).padStart(4, '0')}` });
  }
  console.log('✅ Library seeded');

  // Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { startTime: '08:00', endTime: '08:45' },
    { startTime: '08:45', endTime: '09:30' },
    { startTime: '09:45', endTime: '10:30' },
    { startTime: '10:30', endTime: '11:15' },
    { startTime: '11:30', endTime: '12:15' },
    { startTime: '12:15', endTime: '13:00' },
  ];
  const ttSubjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Physical Education'];
  for (const day of days) {
    for (let p = 0; p < 6; p++) {
      await Timetable.create({
        grade: 'Grade 9', section: 'A', dayOfWeek: day,
        startTime: periods[p].startTime, endTime: periods[p].endTime,
        subject: ttSubjects[p % ttSubjects.length],
        teacher: teachers[p % teachers.length]._id,
        room: `Room ${100 + p}`,
        academicYear: '2025-2026',
      });
    }
  }
  console.log('✅ Timetable seeded (Grade 9-A)');

  console.log('\n🎉 All done!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:   admin@school.com   / admin123');
  console.log('👩‍🏫 Teacher: james@school.com  / teacher123');
  console.log('🎓 Student: student1@school.com / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
