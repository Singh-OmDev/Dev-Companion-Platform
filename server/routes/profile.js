const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport'); // Keep imports if passport needed elsewhere, but likely not. 
// Actually simpler: 
const auth = require('../middleware/auth');

// Auth middleware replaced



// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("Profile GET Error details:", err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
    const { bio, title, socials, skills } = req.body;
    const userId = req.user.id; // Passport-JWT attaches user to req

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (bio !== undefined) user.bio = bio;
        if (title !== undefined) user.title = title;
        if (socials !== undefined) user.socials = { ...(user.socials || {}), ...socials };
        if (skills !== undefined) user.skills = skills;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
