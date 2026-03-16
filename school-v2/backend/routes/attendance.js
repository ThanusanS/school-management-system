// attendance.js
const express = require('express');
const router = express.Router();
const { Attendance } = require('../models/index');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { date, grade, section, personId, type = 'Student' } = req.query;
    const query = { personModel: type };
    if (date) {
      const s = new Date(date); s.setHours(0,0,0,0);
      const e = new Date(date); e.setHours(23,59,59,999);
      query.date = { $gte: s, $lte: e };
    }
    if (grade) query.grade = grade;
    if (section) query.section = section;
    if (personId) query.person = personId;
    // Student sees own attendance only
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (student) query.person = student._id;
    }
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher && type === 'Teacher') query.person = teacher._id;
    }
    const records = await Attendance.find(query)
      .populate('person').sort({ date: -1 }).limit(500);
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/bulk', auth, role('admin', 'teacher'), async (req, res) => {
  try {
    const { records, date, grade, section, personModel = 'Student' } = req.body;
    for (const r of records) {
      await Attendance.findOneAndUpdate(
        { person: r.personId, date: new Date(date) },
        { status: r.status, grade, section, personModel, remarks: r.remarks, markedBy: req.user.id, checkInTime: r.checkInTime, checkOutTime: r.checkOutTime },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Saved', count: records.length });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/stats/:personId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ person: req.params.personId });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    res.json({ total, present, absent, late, excused, percentage: total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
