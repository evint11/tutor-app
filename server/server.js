const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// Static Files
const frontendPath = path.join(__dirname, '..', 'client');
app.use(express.static(frontendPath));

// Special: Only handle SPA routes
app.get('*', (req, res) => {
  if (req.originalUrl.includes('.') || req.originalUrl.startsWith('/api/')) {
    res.status(404).send('Not found');
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
