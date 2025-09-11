const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');

const app = express();

// CORS middleware at the very top
app.use(cors({
  origin: 'https://main.d3vxdunsumxv41.amplifyapp.com',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 200 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Default GET / route for health checks
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// POST /api/admin/uploadWhitelist route
app.post('/api/admin/uploadWhitelist', (req, res) => {
  res.json({ message: 'Whitelist uploaded successfully!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  
  // Handle custom file filter errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection with optimized settings
const mongoOptions = {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log('MongoDB connected with connection pooling'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});