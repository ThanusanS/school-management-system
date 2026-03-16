const express = require('express');
const router = express.Router();
const { Library, LibraryIssue } = require('../models/index');
const Student = require('../models/Student');
const { auth, role } = require('../middleware/auth');

// Books
router.get('/books', auth, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const q = {};
    if (category) q.category = category;
    if (status) q.status = status;
    if (search) q.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
    ];
    const books = await Library.find(q).sort({ title: 1 });
    res.json(books);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/books', auth, role('admin'), async (req, res) => {
  try {
    const count = await Library.countDocuments();
    const bookId = `BK${String(count + 1).padStart(4, '0')}`;
    const book = new Library({ ...req.body, bookId });
    await book.save();
    res.status(201).json(book);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/books/:id', auth, role('admin'), async (req, res) => {
  try {
    const book = await Library.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/books/:id', auth, role('admin'), async (req, res) => {
  try {
    await Library.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Issues
router.get('/issues', auth, async (req, res) => {
  try {
    const { status, borrowerId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (borrowerId) q.borrower = borrowerId;
    if (req.user.role === 'student') {
      const s = await Student.findOne({ userId: req.user.id });
      if (s) q.borrower = s._id;
    }
    const issues = await LibraryIssue.find(q).populate('book').sort({ issueDate: -1 });
    res.json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/issue', auth, role('admin'), async (req, res) => {
  try {
    const book = await Library.findById(req.body.book);
    if (!book || book.availableCopies < 1) return res.status(400).json({ message: 'Book not available' });
    const issue = new LibraryIssue(req.body);
    await issue.save();
    book.availableCopies -= 1;
    if (book.availableCopies === 0) book.status = 'unavailable';
    await book.save();
    res.status(201).json(issue);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/return/:id', auth, role('admin'), async (req, res) => {
  try {
    const issue = await LibraryIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.returnDate = new Date();
    issue.status = 'returned';
    const daysLate = Math.max(0, Math.floor((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24)));
    issue.fine = daysLate * 5; // $5 per day fine
    await issue.save();
    const book = await Library.findById(issue.book);
    book.availableCopies += 1;
    book.status = 'available';
    await book.save();
    res.json(issue);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
