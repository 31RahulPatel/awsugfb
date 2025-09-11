const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const Whitelist = require('./models/Whitelist');

const importAttendees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Whitelist.deleteMany({});
    console.log('🗑️ Cleared existing attendees');

    // Wrap CSV parsing in a Promise so we can await it
    const attendees = await new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream('../AWS-Community-Day-Vadodara-2025-Attendees-10-09-2025-19-20-30 - Sheet1-2.csv')
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() })) // normalize headers
        .on('data', (row) => {
          // Map CSV headers: Email, Name, Booking Id
          const email = row.Email;
          const name = row.Name;
          const bookingId = row['Booking Id'];

          if (!bookingId) {
            console.warn('⚠️ Skipping row (missing bookingId):', row);
            return;
          }

          results.push({
            email: email?.toLowerCase().trim(),
            name: name?.trim(),
            bookingId: bookingId?.trim(),
          });
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    // Insert all attendees
    await Whitelist.insertMany(attendees);
    console.log(`🎉 Imported ${attendees.length} attendees successfully!`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Always close DB connection
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
};

importAttendees();
