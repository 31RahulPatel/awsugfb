const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const Whitelist = require('./models/Whitelist');

const backupAndImport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Backup existing data
    const existingData = await Whitelist.find({});
    fs.writeFileSync('backup-attendees.json', JSON.stringify(existingData, null, 2));
    console.log(`Backed up ${existingData.length} existing attendees`);

    // Clear and import new data
    await Whitelist.deleteMany({});
    
    const attendees = [];
    fs.createReadStream('../converted_attendees.csv')
      .pipe(csv())
      .on('data', (row) => {
        attendees.push({
          email: row.Email.toLowerCase(),
          name: row.Name,
          bookingId: row.Bookingid
        });
      })
      .on('end', async () => {
        await Whitelist.insertMany(attendees);
        console.log(`Imported ${attendees.length} new attendees`);
        await mongoose.connection.close();
      });

  } catch (error) {
    console.error('Error:', error);
  }
};

backupAndImport();