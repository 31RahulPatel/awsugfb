const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const JobApplication = require('./models/JobApplication');
const Job = require('./models/Job');

const importJobApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await JobApplication.deleteMany({});
    console.log('🗑️ Cleared existing job applications');

    const applications = await new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream('../job-applications.csv')
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', async (row) => {
          const userEmail = row.Email || row.email;
          const jobTitle = row['Job Title'] || row.jobTitle;
          const company = row.Company || row.company;
          const name = row.Name || row.name;
          const phone = row.Phone || row.phone;
          const coverLetter = row['Cover Letter'] || row.coverLetter;

          if (userEmail && jobTitle && company && name) {
            // Find job by title and company
            const job = await Job.findOne({ title: jobTitle, company: company });
            
            results.push({
              userEmail: userEmail.toLowerCase().trim(),
              jobId: job ? job._id : new mongoose.Types.ObjectId(),
              jobTitle: jobTitle.trim(),
              company: company.trim(),
              name: name.trim(),
              phone: phone?.trim() || '',
              coverLetter: coverLetter?.trim() || '',
              resumeFile: null,
              resumeS3Url: null
            });
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await JobApplication.insertMany(applications);
    console.log(`🎉 Imported ${applications.length} job applications successfully!`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
};

importJobApplications();