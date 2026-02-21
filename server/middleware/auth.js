const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const clerkAuth = ClerkExpressRequireAuth({
    // Optional: Add configuration here if needed
});

// Adapter to match existing codebase expectation of req.user.id
const authAdapter = (req, res, next) => {
    clerkAuth(req, res, async (err) => {
        if (err) return next(err);

        try {
            if (req.auth && req.auth.userId) {
                const clerkId = req.auth.userId;
                let user = await User.findOne({ clerkId });

                if (!user) {
                    console.log(`Clerk User ${clerkId} not found in DB. Creating...`);
                    const newUserPayload = {
                        clerkId,
                        username: `user_${clerkId.slice(-6)}`,
                        name: 'New Developer'
                    };

                    if (req.auth.claims && req.auth.claims.email) {
                        newUserPayload.email = req.auth.claims.email;
                    }

                    user = new User(newUserPayload);
                    await user.save();
                }

                // Attach MongoDB User to request
                req.user = user;
                req.user.id = user._id; // Important for route compatibility
            }
            next();
        } catch (dbErr) {
            console.error("Auth Middleware DB Error:", dbErr);
            res.status(500).send('Server Error during Auth Sync');
        }
    });
};

module.exports = authAdapter;
