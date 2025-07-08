// updateAdminPassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_connection_string_here';

async function updateAdminPassword(email, newPassword) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    user.password = newPassword; // This will trigger pre-save hook to hash password
    await user.save();
    console.log('Admin password updated successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

// Change email and password here:
const adminEmail = 'admin@example.com';
const newAdminPassword = '123456';

updateAdminPassword(adminEmail, newAdminPassword);
