const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET /api/github/stats/:username
// @desc    Get user github stats
router.get('/stats/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        const options = {
            headers: { 'User-Agent': 'Dev-Companion-App' }
        };

        // If credentials exist, append them to auth (though for public data standard Basic auth or just query params works)
        // Best practice for server-to-server public data fetch is often params: client_id, client_secret
        if (clientId && clientSecret) {
            options.params = {
                client_id: clientId,
                client_secret: clientSecret
            };
        }

        // Fetch real data
        const [userRes, reposRes, eventsRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}`, options),
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, options),
            axios.get(`https://api.github.com/users/${username}/events?per_page=100`, options)
        ]);

        const userData = userRes.data;
        const repos = reposRes.data;
        const events = eventsRes.data;

        // Calculate Language Stats
        const languageCounts = {};
        let totalSize = 0;

        repos.forEach(repo => {
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + repo.size;
                totalSize += repo.size;
            }
        });

        const languages = totalSize === 0 ? [] : Object.entries(languageCounts)
            .map(([name, size]) => ({
                name,
                value: Math.round((size / totalSize) * 100),
                color: getLanguageColor(name)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // Calculate Activity (Last 14 Days) from Events
        const activityMap = {};
        const today = new Date();
        const past14Days = [];

        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            activityMap[dateStr] = 0;
            past14Days.push(dateStr);
        }

        events.forEach(event => {
            const dateStr = event.created_at.split('T')[0];
            if (activityMap[dateStr] !== undefined) {
                // Weight different events? For now just count activity
                // PushEvent counts commits, others count as 1
                let count = 1;
                if (event.type === 'PushEvent') {
                    count = event.payload.size || 1;
                }
                activityMap[dateStr] += count;
            }
        });

        const contributions = past14Days.map(date => ({
            day: date.slice(5), // MM-DD
            commits: activityMap[date]
        }));

        res.json({ ...userData, languages, contributions });
    } catch (err) {
        console.error(`GitHub API Error for ${req.params.username}:`, err.message);
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).json({ msg: 'GitHub API Error' });
    }
});

// @route   GET /api/github/activity/:username
// @desc    Get mock activity data for graph (Real one requires complex scraping or GraphQL)
router.get('/activity/:username', (req, res) => {
    // Generate last 30 days mock activity
    const activity = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        activity.push({
            date: d.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10) // Random activity 0-10
        });
    }

    res.json(activity);
});

// Helper to assign colors to languages
function getLanguageColor(language) {
    const colors = {
        JavaScript: '#f7df1e',
        TypeScript: '#3178c6',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Python: '#3572A5',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Go: '#00ADD8',
        Rust: '#dea584',
        PHP: '#4F5D95',
        Ruby: '#701516',
        Swift: '#F05138',
        Kotlin: '#A97BFF'
    };
    return colors[language] || '#cccccc'; // Default grey
}

module.exports = router;
