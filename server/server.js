const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration (adjust if needed)
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '..', 'client');
app.use(express.static(frontendPath));

// Correctly handle SPA routing
app.get('*', (req, res, next) => {
  if (req.path.includes('.') || req.path.startsWith('/api')) {
    // If the request is for a file (like .js, .css) or an API call, continue
    next();
  } else {
    // Otherwise serve index.html (for frontend routes)
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
