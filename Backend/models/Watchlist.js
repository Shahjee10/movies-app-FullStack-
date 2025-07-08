const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true }, // TMDB movie ID
  movieData: { type: Object, required: true } // store movie info (title, image etc.)
});

// ✅ Safe export to prevent OverwriteModelError
module.exports = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);
