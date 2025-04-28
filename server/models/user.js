// server/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,         // 'student' or 'tutor'
  subjects: [String],   // NEW: array of subjects
  bio: { type: String, default: "" },
  availability: { type: String, default: "" },
});

module.exports = mongoose.model('User', userSchema);

