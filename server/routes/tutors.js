const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all tutors
router.get('/', async (req, res) => {
    try {
        const tutors = await User.find({ role: 'tutor' });
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tutors' });
    }
});

// Get a single tutor by ID
router.get('/:id', async (req, res) => {
    try {
        const tutor = await User.findById(req.params.id);
        if (!tutor || tutor.role !== 'tutor') {
            return res.status(404).json({ error: 'Tutor not found' });
        }
        res.json(tutor);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tutor' });
    }
});

// Update tutor profile
router.put('/:id', async (req, res) => {
    try {
        const { bio, availability, subjects } = req.body;

        const updatedTutor = await User.findByIdAndUpdate(
            req.params.id,
            {
                bio,
                availability,

            
                subjects
            },
            { new: true } // Return the updated document
        );

        if (!updatedTutor || updatedTutor.role !== 'tutor') {
            return res.status(404).json({ error: 'Tutor not found or not authorized' });
        }

        res.json(updatedTutor);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
