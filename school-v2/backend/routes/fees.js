const express = require('express');
const router = express.Router();
const { Fee } = require('../models/index');
const Student = require('../models/Student');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { studentId, status, feeType, academicYear, semester } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user.id });
      if (s) query.student = s._id;
    }
    const fees = await Fee.find(query).populate('student', 'firstName lastName studentId grade').sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const count = await Fee.countDocuments();
    const receiptNumber = `RCP${String(count + 1).padStart(5, '0')}`;
    const fee = new Fee({ ...req.body, receiptNumber });
    await fee.save();
    await fee.populate('student', 'firstName lastName studentId');
    res.status(201).json(fee);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(fee);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Mark fee as paid
router.patch('/:id/pay', auth, role('admin'), async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const fee = await Fee.findById(req.params.id);
    fee.paidAmount = paidAmount;
    fee.paidDate = new Date();
    fee.status = paidAmount >= fee.amount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';
    await fee.save();
    res.json(fee);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Fee summary for a student
router.get('/summary/:studentId', auth, async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.params.studentId });
    const total = fees.reduce((s, f) => s + f.amount, 0);
    const paid = fees.reduce((s, f) => s + f.paidAmount, 0);
    const pending = total - paid;
    const overdue = fees.filter(f => f.status === 'overdue').length;
    res.json({ total, paid, pending, overdue, count: fees.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
