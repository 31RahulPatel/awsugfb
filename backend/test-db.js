const mongoose = require('mongoose');
const Session = require('./models/Session');
const Whitelist = require('./models/Whitelist');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Test creating a session
    const testSession = new Session({
      sessionId: 'TEST001',
      title: 'Test Session',
      speaker: 'Test Speaker',
      time: '10:00 AM',
      room: 'Hall A',
      track: 'Test'
    });

    await testSession.save();
    console.log('✅ Test session created');

    // Check if sessions exist
    const sessionCount = await Session.countDocuments();
    console.log(`📊 Total sessions in database: ${sessionCount}`);

    // Check whitelist
    const whitelistCount = await Whitelist.countDocuments();
    console.log(`📊 Total whitelist entries: ${whitelistCount}`);

    // Clean up test data
    await Session.deleteOne({ sessionId: 'TEST001' });
    console.log('✅ Test data cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();