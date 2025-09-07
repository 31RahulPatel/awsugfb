const mongoose = require('mongoose');
const Whitelist = require('./models/Whitelist');
require('dotenv').config();

const seedData = [
  { email: 'rahul@example.com', name: 'Rahul', phone: '9876543210' },
  { email: 'sneh@example.com', name: 'Sneh', phone: '9765432109' },
  { email: 'user1@example.com', name: 'User One', phone: '9988776655' },
  { email: 'user2@example.com', name: 'User Two', phone: '9090909090' }
];

async function seedWhitelist() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Whitelist.deleteMany({});
    await Whitelist.insertMany(seedData);
    console.log('Whitelist seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedWhitelist();