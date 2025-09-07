const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Session = require('./models/Session');
require('dotenv').config();

async function seedSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const sessions = [];
    
    fs.createReadStream('../vadodara_sessions.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.sessionId && row.title) {
          sessions.push({
            sessionId: row.sessionId,
            title: row.title,
            speaker: row.speakers || row.speaker || 'TBA',
            time: row.time || 'TBA',
            room: row.room || 'TBA',
            track: row.track || 'General'
          });
        }
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${sessions.length} sessions`);
          await Session.deleteMany({});
          await Session.insertMany(sessions);
          console.log('Sessions seeded successfully');
          process.exit(0);
        } catch (error) {
          console.error('Database error:', error);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

seedSessions();