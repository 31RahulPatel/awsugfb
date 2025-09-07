const express = require('express');
const multer = require('multer');
const { auth, adminAuth } = require('../middleware/auth');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const JobApplication = require('../models/JobApplication');

const router = express.Router();
const upload = multer({ dest: 'uploads/resumes/' });

// Get all jobs (public for attendees)
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Create job (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// Upload jobs via CSV (admin only)
router.post('/upload-csv', adminAuth, upload.single('file'), (req, res) => {
  try {
    const fs = require('fs');
    const csv = require('csv-parser');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const newJobs = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.title && row.company) {
          newJobs.push({
            title: row.title,
            company: row.company,
            location: row.location || '',
            experience: row.experience || '',
            skills: row.skills || '',
            description: row.description || ''
          });
        }
      })
      .on('end', async () => {
        try {
          if (newJobs.length > 0) {
            await Job.insertMany(newJobs);
          }
          fs.unlinkSync(filePath);
          res.json({ message: `${newJobs.length} jobs uploaded successfully` });
        } catch (error) {
          fs.unlinkSync(filePath);
          res.status(500).json({ message: 'Failed to save jobs' });
        }
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath);
        res.status(500).json({ message: 'CSV parsing failed', error: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: 'CSV upload failed', error: error.message });
  }
});

// Upload resume
router.post('/resumes', auth, upload.single('resume'), async (req, res) => {
  try {
    const resume = new Resume({
      userEmail: req.user.email,
      name: req.body.name,
      phone: req.body.phone,
      experience: req.body.experience,
      skills: req.body.skills,
      filename: req.file?.filename
    });
    await resume.save();
    res.status(201).json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

// Apply for job
router.post('/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      userEmail: req.user.email,
      jobId: req.body.jobId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const application = new JobApplication({
      userEmail: req.user.email,
      jobId: req.body.jobId,
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      name: req.body.name,
      phone: req.body.phone,
      resumeFile: req.file?.filename,
      coverLetter: req.body.coverLetter
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

// Admin: Get all resumes
router.get('/admin/resumes', adminAuth, async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

// Admin: Get all applications
router.get('/admin/applications', adminAuth, async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Admin: Export applications as CSV
router.get('/admin/export/applications', adminAuth, async (req, res) => {
  try {
    const applications = await JobApplication.find();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const csvHeader = 'ID,Job Title,Applicant Email,Name,Phone,Applied Date,Resume File\n';
    const csvRows = applications.map(app => 
      `${app._id},"${app.jobTitle || ''}",${app.userEmail},"${app.name || ''}",${app.phone || ''},${new Date(app.createdAt).toLocaleDateString()},${app.resumeFile || ''}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=job-applications-${timestamp}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export applications' });
  }
});

// Admin: Download resume file
router.get('/admin/download/:filename', adminAuth, (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/resumes/', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Admin: Export resumes as CSV
router.get('/admin/export/resumes', adminAuth, async (req, res) => {
  try {
    const resumes = await Resume.find();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const csvHeader = 'ID,User Email,Name,Phone,Experience,Skills,Upload Date,File\n';
    const csvRows = resumes.map(resume => 
      `${resume._id},${resume.userEmail},"${resume.name || ''}",${resume.phone || ''},"${resume.experience || ''}","${resume.skills || ''}",${new Date(resume.createdAt).toLocaleDateString()},${resume.filename || ''}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=resumes-${timestamp}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export resumes' });
  }
});

module.exports = router;