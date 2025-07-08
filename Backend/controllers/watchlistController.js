const Watchlist = require('../models/watchlist');

// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
  const userId = req.user.userId;  // comes from authMiddleware (make sure it sets req.user)
  const { movieId, movieData } = req.body;

  try {
    // Check if this movie is already in user's watchlist
    const exists = await Watchlist.findOne({ userId, movieId });
    if (exists) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    const newEntry = new Watchlist({ userId, movieId, movieData });
    await newEntry.save();

    res.status(201).json({ message: 'Movie added to watchlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get watchlist of user
exports.getWatchlist = async (req, res) => {
  const userId = req.user.userId;

  try {
    const watchlist = await Watchlist.find({ userId });
    res.status(200).json(watchlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove movie from watchlist by movieId
exports.removeFromWatchlist = async (req, res) => {
  const userId = req.user.userId;
  const movieId = req.params.movieId;

  try {
    await Watchlist.findOneAndDelete({ userId, movieId });
    res.status(200).json({ message: 'Movie removed from watchlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
