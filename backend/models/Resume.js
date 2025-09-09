const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  filename: {
    type: String
  },
  s3Url: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

resumeSchema.index({ userEmail: 1 });

module.exports = mongoose.model('Resume', resumeSchema);