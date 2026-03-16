const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { auth } = require('../middleware/auth');

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role, name: user.name, email: user.email },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '7d' }
);

// Login (admin, teacher, student)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    let profile = null;
    if (user.role === 'student') profile = await Student.findOne({ userId: user._id });
    if (user.role === 'teacher') profile = await Teacher.findOne({ userId: user._id });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, theme: user.theme, avatar: user.avatar },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register (admin only creates accounts)
router.post('/register', auth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created', user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let profile = null;
    if (user.role === 'student') profile = await Student.findOne({ userId: user._id });
    if (user.role === 'teacher') profile = await Teacher.findOne({ userId: user._id });
    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update theme preference
router.patch('/theme', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { theme: req.body.theme });
    res.json({ message: 'Theme updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
