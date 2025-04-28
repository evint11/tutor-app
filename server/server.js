const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
const authRoutes    = require('./routes/auth');
const tutorRoutes   = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth',    authRoutes);
app.use('/api/tutors',  tutorRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve Static Files from public/client
const publicPath = path.join(__dirname, '..', 'public', 'client');
app.use(express.static(publicPath));

// Wildcard fallback: send index.html on any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
