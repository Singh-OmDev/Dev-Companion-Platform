const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secret_dev_companion_key'
}

// JWT Strategy - For protecting API routes
passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

// GitHub Strategy - For initial login
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/github/callback"
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    // Create new user
                    user = new User({
                        githubId: profile.id,
                        username: profile.username,
                        email: profile.emails?.[0]?.value,
                        name: profile.displayName,
                        avatarUrl: profile.photos?.[0]?.value,
                        bio: profile._json.bio,
                        stats: {
                            totalRepos: profile._json.public_repos
                            // Can fetch more details later via GitHub API
                        }
                    });
                    await user.save();
                } else {
                    // Update existing user info
                    user.username = profile.username;
                    user.avatarUrl = profile.photos?.[0]?.value;
                    user.stats.totalRepos = profile._json.public_repos;
                    await user.save();
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
} else {
    console.warn("⚠️ GitHub Client ID/Secret not found. GitHub OAuth will not work.");
}

module.exports = passport;
