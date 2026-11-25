'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-fee-management';
    console.log(`Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('MongoDB connected for seeding.\n');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared.\n');

    // Create Admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@school.com',
      password: 'Admin@123456',
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin created:');
    console.log(`   Username: admin`);
    console.log(`   Password: Admin@123456`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Email: ${admin.email}\n`);

    // Create Main Admin
    const mainAdmin = await User.create({
      username: 'mainadmin',
      email: 'mainadmin@school.com',
      password: 'MainAdmin@123456',
      fullName: 'Main Administrator',
      role: 'main_admin',
      isActive: true,
    });
    console.log('✅ Main Admin created:');
    console.log(`   Username: mainadmin`);
    console.log(`   Password: MainAdmin@123456`);
    console.log(`   Role: ${mainAdmin.role}`);
    console.log(`   Email: ${mainAdmin.email}\n`);

    console.log('🎉 Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You can now login with either account.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedUsers();
