const mongoose = require('mongoose');

const eventSettingsSchema = new mongoose.Schema({
  eventStartDate: {
    type: Date,
    required: true,
    default: () => new Date('2025-09-09T18:00:00.000Z') // Default: Sep 9, 2025 6:00 PM UTC
  },
  eventName: {
    type: String,
    default: 'AWS UG Vadodara Community Day'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventSettings', eventSettingsSchema);