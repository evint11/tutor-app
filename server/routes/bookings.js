// server/routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: "Failed to create booking", detail: err.message });
  }
});

// Get bookings for a specific user (student or tutor)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const bookings = await Booking.find({
      $or: [
        { studentId: userId },
        { tutorId: userId }
      ]
    })
      .populate("studentId", "name email")
      .populate("tutorId", "name email")
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    console.error("Booking fetch error:", err);
    res.status(500).json({ error: "Failed to fetch bookings", detail: err.message });
  }
});

module.exports = router;
