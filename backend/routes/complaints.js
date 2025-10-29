const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); // Our gatekeeper
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const router = express.Router();

// --- GET ALL COMPLAINTS ---
// URL: GET /api/complaints
// Access: Public
router.get('/', async (req, res) => {
  try {
    // Find all complaints and sort them by creation date, newest first
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching complaints.' });
  }
});

// --- CREATE A NEW COMPLAINT ---
// URL: POST /api/complaints
// Access: Private (requires login)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    // The middleware gives us req.user
    const newComplaint = new Complaint({
      text,
      authorRoll: req.user.rollNo,
      authorId: req.user.id
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating complaint.' });
  }
});

// --- DELETE A COMPLAINT ---
// URL: DELETE /api/complaints/:id
// Access: Private (Author or Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    // Check if complaint exists
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Check if the user is the author OR an admin
    // We must compare the authorId as a string
    if (complaint.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: 'Complaint removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting complaint.' });
  }
});

module.exports = router;