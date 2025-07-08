const User = require('../models/User');
const Watchlist = require('../models/Watchlist');

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWatchlistItems = await Watchlist.countDocuments();
    const users = await User.find().select('email role');
    res.json({
      totalUsers,
      totalWatchlistItems,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminStats,
};
