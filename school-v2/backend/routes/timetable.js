// timetable.js
const express = require('express');
const r = express.Router();
const { Timetable } = require('../models/index');
const { auth, role } = require('../middleware/auth');

r.get('/', auth, async (req, res) => {
  try {
    const { grade, section, academicYear, dayOfWeek } = req.query;
    const q = {};
    if (grade) q.grade = grade;
    if (section) q.section = section;
    if (academicYear) q.academicYear = academicYear;
    if (dayOfWeek) q.dayOfWeek = dayOfWeek;
    const data = await Timetable.find(q).populate('teacher', 'firstName lastName').sort({ dayOfWeek: 1, startTime: 1 });
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

r.post('/', auth, role('admin'), async (req, res) => {
  try {
    const t = new Timetable(req.body);
    await t.save();
    res.status(201).json(t);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const t = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = r;
