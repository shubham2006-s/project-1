import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/User.js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('123456', 12);

    const adminUser = new User({
      name: 'Shubham',
      email: 'shubhampatel0928@gmail.com',
      password: hashedPassword,
      role: 'user'
    });

    await adminUser.save();
    console.log('Admin user created:', adminUser);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createAdmin();