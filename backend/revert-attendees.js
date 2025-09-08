const mongoose = require('mongoose');
require('dotenv').config();

const Whitelist = require('./models/Whitelist');

const revertAttendees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all attendees
    const result = await Whitelist.deleteMany({});
    console.log(`Deleted ${result.deletedCount} attendees`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Revert completed - all attendees removed');

  } catch (error) {
    console.error('Error:', error);
  }
};

revertAttendees();