const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  resumeFile: {
    type: String
  },
  resumeS3Url: {
    type: String
  },
  resumeS3Key: {
    type: String
  },
  resumeOriginalName: {
    type: String
  },
  coverLetter: {
    type: String
  }
}, {
  timestamps: true
});

jobApplicationSchema.index({ userEmail: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);