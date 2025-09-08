const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const Whitelist = require('./models/Whitelist');

const debugImport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const attendees = [];
    const duplicates = [];
    const errors = [];
    const emails = new Set();

    fs.createReadStream('../reformatted_attendees.csv')
      .pipe(csv())
      .on('data', (row) => {
        const email = row.Email?.toLowerCase();
        const name = row.Name;
        const bookingId = row['Booking ID'];

        // Check for missing data
        if (!email || !name || !bookingId) {
          console.log(`Skipping row ${attendees.length + 1}: Missing data - ${email || 'no email'}, ${name || 'no name'}, ${bookingId || 'no bookingId'}`);
          return;
        }

        // Check for duplicate emails
        if (emails.has(email)) {
          duplicates.push({ email, name, bookingId });
          return;
        }

        emails.add(email);
        attendees.push({ email, name, bookingId });
      })
      .on('end', async () => {
        console.log(`Total rows processed: ${attendees.length + duplicates.length + errors.length}`);
        console.log(`Valid attendees: ${attendees.length}`);
        console.log(`Duplicate emails: ${duplicates.length}`);
        console.log(`Errors: ${errors.length}`);
        
        if (duplicates.length > 0) {
          console.log('\nDuplicate emails:');
          duplicates.forEach(d => console.log(`- ${d.email}`));
        }
        
        if (errors.length > 0) {
          console.log('\nErrors:');
          errors.forEach(e => console.log(`- Row ${e.row}: ${e.issue} - ${e.email}`));
        }

        await mongoose.connection.close();
      });

  } catch (error) {
    console.error('Error:', error);
  }
};

debugImport();