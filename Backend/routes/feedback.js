const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Import model

router.post('/', async (req, res) => {  // <-- just '/'
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }
  try {
    const newFeedback = new Feedback({ email, message });
    await newFeedback.save();
    res.json({ success: true, message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Server error saving feedback' });
  }
});

module.exports = router;
