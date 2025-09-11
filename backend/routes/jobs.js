const express = require('express');
const multer = require('multer');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadToS3, uploadJobResumeToS3 } = require('../config/s3');
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

// Check if user has already uploaded a resume
router.get('/resumes/check', auth, async (req, res) => {
  try {
    const existingResume = await Resume.findOne({ userEmail: req.user.email });
    res.json({ hasResume: !!existingResume });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check resume status' });
  }
});

// Upload resume to S3
router.post('/resumes', auth, uploadToS3.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user already has a resume uploaded
    const existingResume = await Resume.findOne({ userEmail: req.user.email });
    if (existingResume) {
      return res.status(400).json({ message: 'You have already uploaded a resume. Only one resume per user is allowed.' });
    }

    const resume = new Resume({
      userEmail: req.user.email,
      name: req.body.name,
      phone: req.body.phone,
      experience: req.body.experience,
      skills: req.body.skills,
      filename: req.file.key.split('/').pop(), // Extract filename from S3 key
      s3Url: req.file.location, // S3 URL
      s3Key: req.file.key, // S3 key for future operations
      originalName: req.file.originalname
    });
    
    await resume.save();
    res.status(201).json({ 
      message: 'Resume submitted successfully',
      s3Url: req.file.location
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to upload resume', error: error.message });
  }
});

// Apply for job with S3 upload
router.post('/apply', auth, uploadJobResumeToS3.single('resume'), async (req, res) => {
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
      resumeFile: req.file?.key || req.file?.filename,
      resumeS3Url: req.file?.location,
      resumeS3Key: req.file?.key,
      resumeOriginalName: req.file?.originalname,
      coverLetter: req.body.coverLetter
    });
    await application.save();
    res.status(201).json({ message: 'Applied successfully' });
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
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    const csvHeader = 'ID,Job Title,Company,Applicant Email,Name,Phone,Applied Date,Resume File,Resume Download URL,Cover Letter\n';
    const csvRows = applications.map(app => 
      `${app._id},"${app.jobTitle || ''}","${app.company || ''}",${app.userEmail},"${app.name || ''}",${app.phone || ''},${new Date(app.createdAt).toLocaleDateString()},"${app.resumeOriginalName || app.resumeFile || ''}","${app.resumeS3Url || ''}","${(app.coverLetter || '').replace(/"/g, '""')}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=job-applications-${timestamp}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export applications' });
  }
});

// Admin: Get resume S3 URL (redirect to S3)
router.get('/admin/download/:id', adminAuth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Redirect to S3 URL for direct download
    res.redirect(resume.s3Url);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get resume', error: error.message });
  }
});

// Admin: Get job application resume S3 URL (redirect to S3)
router.get('/admin/download/application/:id', adminAuth, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    
    if (!application.resumeS3Url) {
      return res.status(404).json({ message: 'No resume found for this application' });
    }
    
    // Redirect to S3 URL for direct download
    res.redirect(application.resumeS3Url);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get application resume', error: error.message });
  }
});

// Admin: Export resumes as CSV with S3 links
router.get('/admin/export/resumes', adminAuth, async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    const csvHeader = 'ID,User Email,Name,Phone,Experience,Skills,Upload Date,Original Filename,S3 Download Link\n';
    const csvRows = resumes.map(resume => 
      `${resume._id},${resume.userEmail},"${resume.name || ''}",${resume.phone || ''},"${resume.experience || ''}","${resume.skills || ''}",${new Date(resume.createdAt).toLocaleDateString()},"${resume.originalName || resume.filename || ''}",${resume.s3Url || ''}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=resumes-export-${timestamp}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export resumes', error: error.message });
  }
});

// Admin: Delete job
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// Admin: Delete job application
router.delete('/applications/:id', adminAuth, async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job application' });
  }
});

module.exports = router;
