const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);

