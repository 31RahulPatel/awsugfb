const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['session', 'overall', 'food', 'tech-booths', 'volunteer', 'other']
  },
  sessionId: {
    type: String,
    required: function() { return this.category === 'session'; }
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one feedback per user per category/session
feedbackSchema.index({ category: 1, sessionId: 1, userEmail: 1 }, { 
  unique: true,
  partialFilterExpression: { category: 'session' }
});
feedbackSchema.index({ category: 1, userEmail: 1 }, { 
  unique: true,
  partialFilterExpression: { category: { $ne: 'session' } }
});
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ userEmail: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);