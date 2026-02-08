const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev_companion_key';

// @route   GET /auth/github
// @desc    Auth with GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /auth/github/callback
// @desc    GitHub auth callback
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication
        const payload = {
            id: req.user._id,
            username: req.user.username,
            avatarUrl: req.user.avatarUrl
        };

        // Sign Token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        // Redirect to frontend with token
        // In production, use a more secure method (e.g., cookie or limited-time code)
        // For MVP, passing via query param to a specific frontend route is acceptable for now
        res.redirect(`http://localhost:5173/auth/success?token=${token}`);
    }
);

const auth = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Return current user
// @access  Private
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

module.exports = router;
