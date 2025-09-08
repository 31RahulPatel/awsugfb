const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  bookingId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

whitelistSchema.index({ email: 1 });

module.exports = mongoose.model('Whitelist', whitelistSchema);