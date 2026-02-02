const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    avatarUrl: String,
    name: String,
    bio: String,
    title: { type: String, default: 'Full Stack Developer' },
    socials: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String,
        leetcode: String
    },

    // Developer Stats
    stats: {
        totalCommits: { type: Number, default: 0 },
        totalRepos: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastActiveDate: Date,
        leetcodeSolved: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        }
    },

    // User Preferences
    preferences: {
        theme: { type: String, default: 'cyber' },
        goalDaily: { type: Number, default: 1 } // e.g., 1 hour or 1 problem
    },

    // AI Context
    skills: [String],
    learningGoals: [{
        topic: String,
        progress: Number, // 0-100
        status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
