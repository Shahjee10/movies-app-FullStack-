const express = require('express');
const router = express.Router();

// Destructure 'protect' middleware function from authMiddleware
const { protect } = require('../middleware/authMiddleware');

// Import controller functions
const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');

// Protect all routes with 'protect' middleware (valid JWT token required)
router.post('/', protect, addToWatchlist);
router.get('/', protect, getWatchlist);
router.delete('/:movieId', protect, removeFromWatchlist);

module.exports = router;
