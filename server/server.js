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

// CORS - Allow all for now (can lock down later)
app.use(cors());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// Static Files (Frontend)
const frontendPath = path.join(__dirname, '../client');
app.use(express.static(frontendPath));

// Static Serve Handler
app.get('*', (req, res) => {
  const requestedPath = path.join(frontendPath, req.path);
  if (fs.existsSync(requestedPath)) {
    res.sendFile(requestedPath);
  } else {
    res.sendFile(path.join(frontendPath, 'index.html')); // <-- Fix here
  }
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
