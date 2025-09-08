const express = require('express');
const Feedback = require('../models/Feedback');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { category, sessionId, rating, comment } = req.body;
    const userEmail = req.user.email;

    // Validate session exists for session feedback
    if (category === 'session') {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
    }

    // Check if feedback already exists
    const query = { category, userEmail };
    if (category === 'session') {
      query.sessionId = sessionId;
    }
    
    const existingFeedback = await Feedback.findOne(query);
    if (existingFeedback) {
      const message = category === 'session' 
        ? 'Feedback already submitted for this session'
        : `Feedback already submitted for ${category}`;
      return res.status(400).json({ message });
    }

    const feedbackData = {
      category,
      userEmail,
      rating,
      comment
    };
    
    if (category === 'session') {
      feedbackData.sessionId = sessionId;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's feedback
router.get('/my-feedback', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userEmail: req.user.email });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feedback categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = [
      { id: 'overall', name: 'Overall Experience', description: 'Rate your overall event experience' },
      { id: 'session', name: 'Sessions', description: 'View and rate individual sessions' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;