const mongoose = require('mongoose');

// Attendance
const attendanceSchema = new mongoose.Schema({
  person: { type: mongoose.Schema.Types.ObjectId, required: true },
  personModel: { type: String, enum: ['Student', 'Teacher'], required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  grade: { type: String },
  section: { type: String },
  remarks: { type: String },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkInTime: { type: String },
  checkOutTime: { type: String },
}, { timestamps: true });
attendanceSchema.index({ person: 1, date: 1 }, { unique: true });

// Grade
const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  examType: { type: String, enum: ['midterm', 'final', 'quiz', 'assignment', 'project'], required: true },
  marks: { type: Number, required: true },
  totalMarks: { type: Number, required: true, default: 100 },
  grade: { type: String },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  remarks: { type: String },
}, { timestamps: true });
gradeSchema.pre('save', function(next) {
  const p = (this.marks / this.totalMarks) * 100;
  this.grade = p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F';
  next();
});

// Fee
const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, enum: ['tuition', 'transport', 'library', 'sports', 'exam', 'other'], required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'partial', 'overdue'], default: 'pending' },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  remarks: { type: String },
  receiptNumber: { type: String },
}, { timestamps: true });

// Timetable
const timetableSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  section: { type: String },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  room: { type: String },
  academicYear: { type: String, required: true },
}, { timestamps: true });

// Notice
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'exam', 'holiday', 'event', 'urgent'], default: 'general' },
  targetAudience: [{ type: String, enum: ['all', 'students', 'teachers', 'parents'] }],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachments: [{ type: String }],
  views: { type: Number, default: 0 },
}, { timestamps: true });

// Library
const librarySchema = new mongoose.Schema({
  bookId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, required: true },
  publisher: { type: String },
  publishYear: { type: Number },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  location: { type: String },
  description: { type: String },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
}, { timestamps: true });

// Library Issue
const libraryIssueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, required: true },
  borrowerModel: { type: String, enum: ['Student', 'Teacher'], required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  fine: { type: Number, default: 0 },
  remarks: { type: String },
}, { timestamps: true });

// Notification
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['fee', 'attendance', 'grade', 'notice', 'library', 'general'], default: 'general' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

module.exports = {
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Grade: mongoose.model('Grade', gradeSchema),
  Fee: mongoose.model('Fee', feeSchema),
  Timetable: mongoose.model('Timetable', timetableSchema),
  Notice: mongoose.model('Notice', noticeSchema),
  Library: mongoose.model('Library', librarySchema),
  LibraryIssue: mongoose.model('LibraryIssue', libraryIssueSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
