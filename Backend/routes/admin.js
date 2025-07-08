const express = require('express');
const router = express.Router();

const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getAdminStats } = require('../controllers/adminController');

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');

// Get admin stats
router.get('/stats', protect, isAdmin, (req, res, next) => {
  console.log('Received request for /stats by user:', req.user);
  next();
}, getAdminStats);

router.get('/feedbacks', protect, isAdmin, async (req, res) => {
  console.log('Received request for /feedbacks by user:', req.user);
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});
// Get detailed user profile by ID
router.get('/user/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const watchlistCount = await Watchlist.countDocuments({ userId: req.params.id });
    const feedbacks = await Feedback.find({ email: user.email }).sort({ createdAt: -1 });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || user._id.getTimestamp(),
      watchlistCount,
      feedbacks,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

module.exports = router;
