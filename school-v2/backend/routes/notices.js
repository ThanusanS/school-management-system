const express = require('express');
const router = express.Router();
const { Notice } = require('../models/index');
const { auth, role } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { category, priority, audience } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (audience) query.targetAudience = { $in: [audience, 'all'] };
    const notices = await Notice.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const notice = new Notice({ ...req.body, createdBy: req.user.id });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notice);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Increment views
router.patch('/:id/view', auth, async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: 'ok' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
