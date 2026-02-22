const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Learning = require('../models/Learning');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');

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

        let focusRadarData = Object.entries(techDist)
            .map(([subject, A]) => ({ subject, A, fullMark: maxVal + 2 }))
            .sort((a, b) => b.A - a.A)
            .slice(0, 6); // Top 6 technologies

        // 3. Learning Distribution
        const learningDist = {};
        learning.forEach(l => {
            learningDist[l.category] = (learningDist[l.category] || 0) + 1;
        });
        let learningData = Object.entries(learningDist).map(([name, value]) => ({ name, value }));

        // 4. Productivity Pulse (Mocked based on stats for now, ideally needs daily activity log)
        // Simulating a "Pulse" based on streak and total commits
        const pulseScore = Math.min(100, ((user?.stats?.currentStreak || 0) * 5) + ((user?.stats?.totalCommits || 0) / 10));

        // 5. Activity Trend (Mocked 7-day trend - normally would aggregate from timestamps)
        let activityTrend = [
            { name: 'Mon', commits: 4, learning: 2 },
            { name: 'Tue', commits: 7, learning: 1 },
            { name: 'Wed', commits: 2, learning: 4 },
            { name: 'Thu', commits: 9, learning: 0 },
            { name: 'Fri', commits: 5, learning: 3 },
            { name: 'Sat', commits: 12, learning: 5 },
            { name: 'Sun', commits: 8, learning: 2 },
        ];

        if (user?.socials?.github) {
            try {
                const port = process.env.PORT || 5000;
                const ghRes = await axios.get(`http://localhost:${port}/api/github/stats/${user.socials.github}`);
                const ghData = ghRes.data;

                if (focusRadarData.length === 0 && ghData.languages && ghData.languages.length > 0) {
                    const ghMax = Math.max(...ghData.languages.map(l => l.value));
                    focusRadarData = ghData.languages.map(lang => ({
                        subject: lang.name,
                        A: lang.value,
                        fullMark: ghMax + 10
                    })).slice(0, 6);
                }

                if (learningData.length === 0 && ghData.languages && ghData.languages.length > 0) {
                    learningData = ghData.languages.map(lang => ({
                        name: lang.name,
                        value: lang.value
                    }));
                }

                if (ghData.contributions && ghData.contributions.length > 0) {
                    const last7 = ghData.contributions.slice(-7);
                    activityTrend = last7.map(c => ({
                        name: c.day,
                        commits: c.commits,
                        learning: 0
                    }));
                }
            } catch (err) {
                console.error("Insights: Failed to fetch internal github stats fallback", err.message);
            }
        }

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
