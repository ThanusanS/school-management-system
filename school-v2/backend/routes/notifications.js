// notifications.js
const express = require('express');
const router = express.Router();
const { Notification } = require('../models/index');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ notifications, unread });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/read/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
