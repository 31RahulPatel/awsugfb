const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Session = require('../models/Session');
const Feedback = require('../models/Feedback');
const Whitelist = require('../models/Whitelist');
const EventSettings = require('../models/EventSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Upload sessions CSV
router.post('/uploadSessions', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file);
    const filePath = req.file.path;
    const sessions = [];

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const isCSV = req.file.mimetype === 'text/csv' || fileExtension === '.csv';
    
    if (isCSV) {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.sessionId && row.title) {
            sessions.push({
              sessionId: row.sessionId,
              title: row.title,
              speaker: row.speakers || row.speaker || 'TBA',
              time: row.time || 'TBA',
              room: row.room || 'TBA',
              track: row.track || 'General'
            });
          }
        })
        .on('end', async () => {
          console.log('Parsed sessions:', sessions.length);
          try {
            if (sessions.length > 0) {
              await Session.deleteMany({});
              await Session.insertMany(sessions);
            }
            fs.unlinkSync(filePath);
            res.json({ message: `${sessions.length} sessions uploaded successfully` });
          } catch (dbError) {
            fs.unlinkSync(filePath);
            res.status(500).json({ message: 'Database error', error: dbError.message });
          }
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          res.status(500).json({ message: 'CSV parsing failed', error: error.message });
        });
    } else {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      const sessions = data.filter(row => row.sessionId && row.title).map(row => ({
        sessionId: row.sessionId,
        title: row.title,
        speaker: row.speakers || row.speaker || 'TBA',
        time: row.time || 'TBA',
        room: row.room || 'TBA',
        track: row.track || 'General'
      }));

      try {
        if (sessions.length > 0) {
          await Session.deleteMany({});
          await Session.insertMany(sessions);
        }
        fs.unlinkSync(filePath);
        res.json({ message: `${sessions.length} sessions uploaded successfully` });
      } catch (dbError) {
        fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Database error', error: dbError.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload whitelist
router.post('/uploadWhitelist', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const attendees = [];

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const isCSV = req.file.mimetype === 'text/csv' || fileExtension === '.csv';
    
    if (isCSV) {
      // Parse CSV
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const email = (row.Email || row.email)?.toLowerCase();
          const name = row.Name || row.name;
          const bookingId = row['Booking ID'] || row.bookingId || row.booking_id;
          
          // Only add if all required fields are present
          if (email && name && bookingId) {
            attendees.push({
              email: email,
              name: name,
              bookingId: bookingId
            });
          }
        })
        .on('end', async () => {
          try {
            if (attendees.length > 0) {
              await Whitelist.deleteMany({});
              const result = await Whitelist.insertMany(attendees, { ordered: false });
              console.log(`Inserted ${result.length} attendees out of ${attendees.length} parsed`);
            }
            fs.unlinkSync(filePath);
            res.json({ message: `${attendees.length} attendees uploaded successfully` });
          } catch (dbError) {
            console.error('Database insertion error:', dbError);
            fs.unlinkSync(filePath);
            res.status(500).json({ message: 'Database error', error: dbError.message });
          }
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          res.status(500).json({ message: 'CSV parsing failed', error: error.message });
        });
    } else {
      // Parse Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      const attendees = data.filter(row => {
        const email = (row.Email || row.email)?.toLowerCase();
        const name = row.Name || row.name;
        const bookingId = row['Booking ID'] || row.bookingId || row.booking_id;
        return email && name && bookingId;
      }).map(row => ({
        email: (row.Email || row.email)?.toLowerCase(),
        name: row.Name || row.name,
        bookingId: row['Booking ID'] || row.bookingId || row.booking_id
      }));

      try {
        if (attendees.length > 0) {
          await Whitelist.deleteMany({});
          const result = await Whitelist.insertMany(attendees, { ordered: false });
          console.log(`Inserted ${result.length} attendees out of ${attendees.length} parsed`);
        }
        fs.unlinkSync(filePath);
        res.json({ message: `${attendees.length} attendees uploaded successfully` });
      } catch (dbError) {
        console.error('Database insertion error:', dbError);
        fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Database error', error: dbError.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Create session
router.post('/createSession', adminAuth, async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Session ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all sessions (admin)
router.get('/sessions', adminAuth, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feedback for a session
router.get('/feedback/:sessionId', adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ sessionId: req.params.sessionId });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export all feedback
router.get('/exportFeedback', adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.find();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=feedback-export-${timestamp}.csv`);
    
    const csvHeader = 'Category,SessionID,UserEmail,Rating,Comment,CreatedAt\n';
    const csvRows = feedback.map(f => 
      `${f.category},${f.sessionId || ''},${f.userEmail},${f.rating},"${(f.comment || '').replace(/"/g, '""')}",${f.createdAt}`
    ).join('\n');
    
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const totalAttendees = await Whitelist.countDocuments();
    
    res.json({
      totalSessions,
      totalFeedback,
      totalAttendees
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Attendee CRUD operations
// Get all attendees
router.get('/attendees', adminAuth, async (req, res) => {
  try {
    const attendees = await Whitelist.find().sort({ name: 1 });
    res.json(attendees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create attendee
router.post('/attendees', adminAuth, async (req, res) => {
  try {
    const attendee = new Whitelist({
      email: req.body.email.toLowerCase(),
      name: req.body.name,
      bookingId: req.body.bookingId
    });
    await attendee.save();
    res.status(201).json({ message: 'Attendee created successfully', attendee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendee
router.put('/attendees/:id', adminAuth, async (req, res) => {
  try {
    const attendee = await Whitelist.findByIdAndUpdate(
      req.params.id,
      {
        email: req.body.email.toLowerCase(),
        name: req.body.name,
        bookingId: req.body.bookingId
      },
      { new: true }
    );
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json({ message: 'Attendee updated successfully', attendee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete attendee
router.delete('/attendees/:id', adminAuth, async (req, res) => {
  try {
    const attendee = await Whitelist.findByIdAndDelete(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json({ message: 'Attendee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Session CRUD operations
// Update session
router.put('/sessions/:id', adminAuth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session updated successfully', session });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Session ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete session
router.delete('/sessions/:id', adminAuth, async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feedback by category
router.get('/feedback/category/:category', adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ category: req.params.category });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all feedback categories with stats
router.get('/feedback/categories/stats', adminAuth, async (req, res) => {
  try {
    const categories = ['session', 'overall', 'food', 'tech-booths', 'volunteer', 'other'];
    const stats = await Promise.all(
      categories.map(async (category) => {
        const feedback = await Feedback.find({ category });
        const avgRating = feedback.length > 0 
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
          : 0;
        return {
          category,
          count: feedback.length,
          averageRating: Math.round(avgRating * 10) / 10
        };
      })
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Event Settings Routes
// Get event settings
router.get('/event-settings', adminAuth, async (req, res) => {
  try {
    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = new EventSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event settings
router.put('/event-settings', adminAuth, async (req, res) => {
  try {
    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = new EventSettings(req.body);
    } else {
      settings.eventStartDate = req.body.eventStartDate;
      settings.eventName = req.body.eventName || settings.eventName;
    }
    await settings.save();
    res.json({ message: 'Event settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;