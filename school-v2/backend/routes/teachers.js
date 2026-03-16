const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const t = await Teacher.findOne({ userId: req.user.id });
      return res.json({ teachers: t ? [t] : [], total: 1, pages: 1 });
    }
    const { subject, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (status) query.status = status;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { teacherId: { $regex: search, $options: 'i' } },
    ];
    const total = await Teacher.countDocuments(query);
    const teachers = await Teacher.find(query)
      .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ teachers, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Not found' });
    res.json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const count = await Teacher.countDocuments();
    const teacherId = `TCH${String(count + 1).padStart(4, '0')}`;
    const existingUser = await User.findOne({ email: req.body.email });
    let userId = null;
    if (!existingUser) {
      const user = new User({
        name: `${req.body.firstName} ${req.body.lastName}`,
        email: req.body.email,
        password: req.body.password || 'teacher123',
        role: 'teacher',
      });
      await user.save();
      userId = user._id;
    } else {
      userId = existingUser._id;
    }
    const teacher = new Teacher({ ...req.body, teacherId, userId });
    await teacher.save();
    await User.findByIdAndUpdate(userId, { profileId: teacher._id });
    res.status(201).json(teacher);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Not found' });
    res.json(teacher);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
