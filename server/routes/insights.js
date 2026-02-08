const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Learning = require('../models/Learning');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Auth middleware replaced


// @route   GET /api/insights
// @desc    Get aggregated developer insights
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Raw Data
        const projects = await Project.find({ userId });
        const learning = await Learning.find({ userId });
        const user = await User.findById(userId);

        // 2. Focus Area (Tech Stack Distribution)
        const techDist = {};
        projects.forEach(p => {
            if (p.techStack && Array.isArray(p.techStack)) {
                p.techStack.forEach(tech => {
                    techDist[tech] = (techDist[tech] || 0) + 1;
                });
            }
        });

        const maxVal = Object.values(techDist).length > 0 ? Math.max(...Object.values(techDist)) : 0;

        const focusRadarData = Object.entries(techDist)
            .map(([subject, A]) => ({ subject, A, fullMark: maxVal + 2 }))
            .sort((a, b) => b.A - a.A)
            .slice(0, 6); // Top 6 technologies

        // 3. Learning Distribution
        const learningDist = {};
        learning.forEach(l => {
            learningDist[l.category] = (learningDist[l.category] || 0) + 1;
        });
        const learningData = Object.entries(learningDist).map(([name, value]) => ({ name, value }));

        // 4. Productivity Pulse (Mocked based on stats for now, ideally needs daily activity log)
        // Simulating a "Pulse" based on streak and total commits
        const pulseScore = Math.min(100, (user.stats.currentStreak * 5) + (user.stats.totalCommits / 10));

        // 5. Activity Trend (Mocked 7-day trend - normally would aggregate from timestamps)
        const activityTrend = [
            { name: 'Mon', commits: 4, learning: 2 },
            { name: 'Tue', commits: 7, learning: 1 },
            { name: 'Wed', commits: 2, learning: 4 },
            { name: 'Thu', commits: 9, learning: 0 },
            { name: 'Fri', commits: 5, learning: 3 },
            { name: 'Sat', commits: 12, learning: 5 },
            { name: 'Sun', commits: 8, learning: 2 },
        ];

        res.json({
            focusRadar: focusRadarData,
            learningDistribution: learningData,
            productivityPulse: Math.round(pulseScore),
            activityTrend
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
