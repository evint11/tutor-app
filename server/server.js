// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS (Allow both local dev and deployed app)
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://tutor-app-p909.onrender.com'  // <--- ADD your deployed URL here
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');


app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve Frontend (static)
const frontendPath = path.join(__dirname, 'client');   // <--- fixed path
app.use(express.static(frontendPath));

// Correctly serve static files or fallback to index.html
app.get('*', (req, res) => {
  const requestedPath = path.join(frontendPath, req.path);
  if (fs.existsSync(requestedPath)) {
    res.sendFile(requestedPath);
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
