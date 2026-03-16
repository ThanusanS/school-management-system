const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { Attendance, Grade, Fee, Notice, Library } = require('../models/index');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await Teacher.countDocuments({ status: 'active' });

    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    const todayAtt = await Attendance.find({ date: { $gte: today, $lte: todayEnd }, personModel: 'Student' });
    const presentToday = todayAtt.filter(a => a.status === 'present').length;
    const attendanceRate = todayAtt.length > 0 ? ((presentToday / todayAtt.length) * 100).toFixed(1) : 0;

    const pendingFees = await Fee.countDocuments({ status: { $in: ['pending', 'overdue'] } });
    const totalFeeAmount = await Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$paidAmount' } } }]);

    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const recentNotices = await Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(3);
    const overdueBooks = await require('../models/index').LibraryIssue.countDocuments({ status: 'overdue' });

    const studentsByGrade = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const e = new Date(d); e.setHours(23,59,59,999);
      const recs = await Attendance.find({ date: { $gte: d, $lte: e }, personModel: 'Student' });
      last7Days.push({
        date: d.toISOString().split('T')[0],
        present: recs.filter(r => r.status === 'present').length,
        absent: recs.filter(r => r.status === 'absent').length,
        total: recs.length,
      });
    }

    const feeStats = totalFeeAmount[0] || { total: 0, paid: 0 };

    res.json({
      totalStudents, totalTeachers, presentToday, attendanceRate,
      pendingFees, overdueBooks,
      feeCollected: feeStats.paid, feePending: feeStats.total - feeStats.paid,
      recentStudents, recentNotices,
      studentsByGrade, attendanceTrend: last7Days,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Student dashboard
router.get('/student', auth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Profile not found' });

    const grades = await Grade.find({ student: student._id }).sort({ createdAt: -1 }).limit(10);
    const fees = await Fee.find({ student: student._id });
    const attStats = await (async () => {
      const recs = await Attendance.find({ person: student._id });
      const total = recs.length;
      const present = recs.filter(r => r.status === 'present').length;
      return { total, present, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 };
    })();
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
    const pendingFees = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + (f.amount - f.paidAmount), 0);
    const avgMarks = grades.length > 0 ? (grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / grades.length).toFixed(1) : 0;

    res.json({ student, grades, fees, attStats, notices, pendingFees, avgMarks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Teacher dashboard
router.get('/teacher', auth, async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) return res.status(404).json({ message: 'Profile not found' });

    const totalStudents = await Student.countDocuments({ status: 'active' });
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const todayAtt = await Attendance.find({ date: { $gte: today, $lte: todayEnd }, personModel: 'Student', markedBy: req.user.id });
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
    const recentGrades = await Grade.find({ teacher: teacher._id }).populate('student', 'firstName lastName').sort({ createdAt: -1 }).limit(5);

    res.json({ teacher, totalStudents, todayAttMarked: todayAtt.length, notices, recentGrades });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
