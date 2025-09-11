const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const Job = require('./models/Job');

const importJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Job.deleteMany({});
    console.log('🗑️ Cleared existing jobs');

    const jobs = await new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream('../jobs.csv')
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (row) => {
          const title = row.Title || row.title;
          const company = row.Company || row.company;
          const location = row.Location || row.location;
          const experience = row.Experience || row.experience;
          const skills = row.Skills || row.skills;
          const description = row.Description || row.description;

          if (title && company && location) {
            results.push({
              title: title.trim(),
              company: company.trim(),
              location: location.trim(),
              experience: experience?.trim() || 'Not specified',
              skills: skills?.trim() || 'Not specified',
              description: description?.trim() || 'No description provided'
            });
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await Job.insertMany(jobs);
    console.log(`🎉 Imported ${jobs.length} jobs successfully!`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
};

importJobs();