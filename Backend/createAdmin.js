const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin created successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
