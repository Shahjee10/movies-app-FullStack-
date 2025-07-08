const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const path = require('path');

// Signup Request - create user or resend OTP if unverified
exports.signupRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already registered and verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      user.name = name;
      user.password = password;
      user.emailOTP = otp;
      user.emailOTPExpires = otpExpiry;
    } else {
      user = new User({
        name,
        email: cleanEmail,
        password,
        isVerified: false,
        emailOTP: otp,
        emailOTPExpires: otpExpiry,
        role: 'user',
      });
    }

    await user.save();

    await sendEmail(cleanEmail, `Your signup OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to email. Please verify to complete signup.' });
  } catch (err) {
    console.error('Signup Request Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Signup OTP
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.emailOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.emailOTPExpires) return res.status(400).json({ message: 'OTP expired' });

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login (only verified users)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (wrong password)' });
    }

    // Create JWT with `id` in payload
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || '',
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (name and password)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

      user.password = newPassword;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password - send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const cleanEmail = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();

    const resetLink = `http://192.168.100.21/reset-password/${token}`;
    await sendEmail(user.email, `Reset your password here: ${resetLink}`);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password using token
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get logged-in user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email role profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Get User Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin stats (example)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      totalUsers,
      message: 'Admin stats fetched successfully',
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store relative path, consistent with static serving setup
    user.profilePic = `uploads/profilePics/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture updated', path: user.profilePic });
  } catch (error) {
    console.error('Upload Profile Picture Error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};
