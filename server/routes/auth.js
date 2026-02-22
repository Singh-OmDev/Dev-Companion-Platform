const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// @route   POST /api/auth/sync
// @desc    Sync Clerk user to local MongoDB
// @access  Private
router.post('/sync', ClerkExpressWithAuth(), async (req, res) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ msg: 'Unauthorized - No Clerk token' });
        }

        const clerkId = req.auth.userId;
        const { email, firstName, lastName, imageUrl } = req.body;

        let user = await User.findOne({ clerkId });

        if (!user) {
            // Check if user exists by email (if they signed up differently before)
            if (email) {
                user = await User.findOne({ email });
            }

            if (user) {
                // Link existing user to Clerk
                user.clerkId = clerkId;
                user.avatarUrl = imageUrl || user.avatarUrl;
                await user.save();
            } else {
                // Create brand new user
                user = new User({
                    clerkId,
                    email: email || '',
                    name: firstName ? `${firstName} ${lastName || ''}`.trim() : 'Developer',
                    avatarUrl: imageUrl || '',
                    username: email ? email.split('@')[0] : `user_${clerkId.slice(-5)}`
                });
                await user.save();
            }
        } else {
            // Optionally update details on each login
            if (imageUrl && !user.avatarUrl) {
                user.avatarUrl = imageUrl;
                await user.save();
            }
        }

        res.json({ msg: 'User synced successfully', user });
    } catch (err) {
        console.error('Auth sync error:', err);
        res.status(500).send('Server Error during sync');
    }
});

const auth = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Return current user
// @access  Private
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

module.exports = router;
