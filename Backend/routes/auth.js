const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Middlewares you already have
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware'); // renamed adminOnly to isAdmin for consistency

// Your controllers
const {
  signupRequest,
  verifySignupOTP,
  login,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getAdminStats,
  uploadProfilePic,
} = require('../controllers/authcontroller');

// Setup multer storage for profile pics
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profilePics'); // make sure folder exists
  },
  filename: (req, file, cb) => {
    // Unique filename with timestamp + original extension
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ======================
// 📌 Public Routes
// ======================
router.post('/signup-request', signupRequest);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ======================
// 🔒 Protected Routes
// ======================
router.get('/me', protect, getUserProfile);
router.put('/update', protect, updateProfile);

// Profile picture upload route uses controller
router.post('/upload-dp', protect, upload.single('profilePic'), uploadProfilePic);

// ======================
// 🔒 Admin-only Route
// ======================
router.get('/admin/stats', protect, isAdmin, getAdminStats);

module.exports = router;
