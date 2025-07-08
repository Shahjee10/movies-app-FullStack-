const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },

  password: { type: String, required: true },

  // Email verification fields
  isVerified: { type: Boolean, default: false },
  emailOTP: String,
  emailOTPExpires: Date,

  // Role: 'user' or 'admin'
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // ✅ New: Profile picture path (e.g., uploads/profilePics/xyz.jpg)
  profilePic: {
    type: String,
    default: '', // No image by default
  },
},
{
  timestamps: true // ✅ Adds createdAt and updatedAt automatically
});

// Hash password before saving if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
