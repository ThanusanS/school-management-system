const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { Grade, Attendance, Fee } = require('../models/index');
const { auth, role } = require('../middleware/auth');

// Student Report Card - JSON (frontend renders to PDF)
router.get('/report-card/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { academicYear = '2025-2026', semester = 'Semester 1' } = req.query;
    const grades = await Grade.find({ student: student._id, academicYear, semester })
      .populate('teacher', 'firstName lastName');

    const attendanceRecs = await Attendance.find({ person: student._id });
    const total = attendanceRecs.length;
    const present = attendanceRecs.filter(r => r.status === 'present').length;
    const attPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    const fees = await Fee.find({ student: student._id, academicYear });
    const totalFee = fees.reduce((s, f) => s + f.amount, 0);
    const paidFee = fees.reduce((s, f) => s + f.paidAmount, 0);

    const subjectMap = {};
    grades.forEach(g => {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
      subjectMap[g.subject].push(g);
    });

    const avgMarks = grades.length > 0
      ? (grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / grades.length).toFixed(1)
      : 0;

    const overallGrade = avgMarks >= 90 ? 'A+' : avgMarks >= 80 ? 'A' : avgMarks >= 70 ? 'B' : avgMarks >= 60 ? 'C' : avgMarks >= 50 ? 'D' : 'F';
    const rank = avgMarks >= 80 ? 'Excellent' : avgMarks >= 60 ? 'Good' : avgMarks >= 50 ? 'Average' : 'Needs Improvement';

    res.json({
      student, grades, subjectMap, avgMarks, overallGrade, rank,
      attendance: { total, present, absent: total - present, percentage: attPercentage },
      fees: { total: totalFee, paid: paidFee, pending: totalFee - paidFee },
      academicYear, semester,
      generatedAt: new Date(),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Export students list as JSON (frontend converts to Excel/CSV)
router.get('/students-export', auth, role('admin'), async (req, res) => {
  try {
    const students = await Student.find({ status: 'active' }).sort({ grade: 1, firstName: 1 });
    const data = students.map(s => ({
      'Student ID': s.studentId,
      'First Name': s.firstName,
      'Last Name': s.lastName,
      'Email': s.email,
      'Grade': s.grade,
      'Section': s.section || '',
      'Gender': s.gender || '',
      'Phone': s.phone || '',
      'Parent Name': s.parentName || '',
      'Parent Phone': s.parentPhone || '',
      'Status': s.status,
      'Enrolled': new Date(s.enrollmentDate).toLocaleDateString(),
    }));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Fee report
router.get('/fees-report', auth, role('admin'), async (req, res) => {
  try {
    const { academicYear, status } = req.query;
    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;
    const fees = await Fee.find(query).populate('student', 'firstName lastName studentId grade');
    const summary = {
      total: fees.reduce((s, f) => s + f.amount, 0),
      collected: fees.reduce((s, f) => s + f.paidAmount, 0),
      pending: fees.reduce((s, f) => s + (f.amount - f.paidAmount), 0),
      count: fees.length,
    };
    res.json({ fees, summary });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
