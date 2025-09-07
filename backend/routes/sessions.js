const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single session
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;