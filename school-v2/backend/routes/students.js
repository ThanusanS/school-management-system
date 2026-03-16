const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { grade, status, search, page = 1, limit = 10 } = req.query;
    // Students can only see their own profile
    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user.id });
      return res.json({ students: s ? [s] : [], total: 1, pages: 1 });
    }
    const query = {};
    if (grade) query.grade = grade;
    if (status) query.status = status;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ students, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const studentId = `STU${String(count + 1).padStart(4, '0')}`;
    // Create login account for student
    const existingUser = await User.findOne({ email: req.body.email });
    let userId = null;
    if (!existingUser) {
      const user = new User({
        name: `${req.body.firstName} ${req.body.lastName}`,
        email: req.body.email,
        password: req.body.password || 'student123',
        role: 'student',
      });
      await user.save();
      userId = user._id;
    } else {
      userId = existingUser._id;
    }
    const student = new Student({ ...req.body, studentId, userId });
    await student.save();
    await User.findByIdAndUpdate(userId, { profileId: student._id });
    res.status(201).json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, role('admin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
