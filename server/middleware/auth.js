const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Middleware to verify the Clerk token via the SDK
const clerkAuth = ClerkExpressRequireAuth({});

// Adapter to resolve the database User object from the verified Clerk token
const attachUserDB = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ msg: 'Unauthorized - No Clerk token' });
        }

        const clerkId = req.auth.userId;
        let user = await User.findOne({ clerkId });

        if (!user) {
            // In a strict setup, the user *must* exist via sync before accessing private routes.
            // For resilience during dev, we can either return 401 or implicitly create.
            // Returning 401 forces the frontend to sync first.
            return res.status(401).json({ msg: 'User profile not found in database. Please sync.' });
        }

        req.user = user;
        req.user.id = user._id; // Attach Mongo ID for legacy route compatibility
        next();

    } catch (err) {
        console.error("Auth resolve error:", err);
        res.status(500).send('Server Error in Auth Resolution');
    }
};

// Combine the two middleware steps
module.exports = [clerkAuth, attachUserDB];
