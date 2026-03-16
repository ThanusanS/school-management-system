const express = require('express');
const router = express.Router();
const { Grade } = require('../models/index');
const Student = require('../models/Student');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { subject, examType, semester, academicYear, studentId } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    if (studentId) query.student = studentId;
    // Students see own grades only
    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user.id });
      if (s) query.student = s._id;
    }
    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId grade')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(grades);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, role('admin', 'teacher'), async (req, res) => {
  try {
    const grade = new Grade(req.body);
    await grade.save();
    await grade.populate('student', 'firstName lastName studentId');
    res.status(201).json(grade);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, role('admin', 'teacher'), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(grade);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
