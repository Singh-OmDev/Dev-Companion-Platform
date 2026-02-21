// const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Adapter to match existing codebase expectation of req.user.id
const authAdapter = async (req, res, next) => {
    try {
        // Bypass Clerk auth for now, use a default test user
        let user = await User.findOne();
        if (!user) {
            user = new User({
                clerkId: 'test_clerk_id',
                username: 'test_user',
                name: 'Test Developer',
                email: 'test@example.com'
            });
            await user.save();
        }
        req.user = user;
        req.user.id = user._id;
        next();
    } catch (err) {
        console.error("Auth bypass error:", err);
        res.status(500).send('Server Error in Auth Bypass');
    }
};

module.exports = authAdapter;
