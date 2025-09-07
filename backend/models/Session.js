const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  speaker: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  track: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

sessionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Session', sessionSchema);