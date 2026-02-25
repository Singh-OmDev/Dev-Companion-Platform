const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

// Auth middleware replaced

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

        // Use Personal Access Token for 5000 req/hr limit
        if (process.env.GITHUB_TOKEN) {
            options.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        } else if (clientId && clientSecret) {
            // Fallback (deprecated by GitHub but might still work slightly)
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
// @desc    Get real activity events from GitHub API for standup generation
router.get('/activity/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const options = { headers: { 'User-Agent': 'Dev-Companion-App' } };

        if (process.env.GITHUB_TOKEN) {
            options.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        } else if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            options.params = {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET
            };
        }

        const eventsRes = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=30`, options);
        res.json(eventsRes.data);
    } catch (err) {
        console.error("Github Events API Error", err.message);
        res.status(500).json({ msg: 'Failed to fetch GitHub events' });
    }
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


// @route   POST /api/github/sync
// @desc    Sync user github stats to database
router.post('/sync', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.socials || !user.socials.github) {
            return res.status(400).json({ msg: 'Github account not linked' });
        }

        let username = user.socials.github;

        // Extract username if full URL provided
        if (username.includes('github.com')) {
            const parts = username.split('/').filter(Boolean);
            username = parts[parts.length - 1];
        }
        username = username.trim(); // Ensure no trailing spaces
        const options = { headers: { 'User-Agent': 'Dev-Companion-App' } };

        if (process.env.GITHUB_TOKEN) {
            options.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        } else if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            options.params = {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET
            };
        }

        const [reposRes, eventsRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, options),
            axios.get(`https://api.github.com/users/${username}/events?per_page=100`, options)
        ]);

        const repos = reposRes.data;
        const events = eventsRes.data;

        // Calculate Stats
        const totalRepos = repos.length;
        let totalCommits = 0;

        // Simple streak calculation (consecutive days with activity in last 14 days)
        // Note: Real streak calc requires more history, this is an approximation from recent events
        const activityMap = {};
        events.forEach(event => {
            const dateStr = event.created_at.split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            if (event.type === 'PushEvent') {
                totalCommits += (event.payload.size || 1);
            } else {
                totalCommits++; // Count other actions as 1 for general activity or keep strictly commits
            }
        });

        // Determine current streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            if (activityMap[dateStr]) {
                currentStreak++;
            } else if (i === 0 && !activityMap[dateStr]) {
                // If no activity *today* yet, don't break streak immediately if yesterday had activity, 
                // but for "Current Streak" usually we want to see if active today. 
                // Let's be lenient: if yesterday was active, streak is valid. 
                // Actually standard logic: count backwards until gap.
                continue;
            } else {
                break;
            }
        }

        // Update User Stats safely using Mongoose $set to avoid validation interference from legacy docs
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'stats.totalRepos': totalRepos,
                    'stats.totalCommits': (user.stats?.totalCommits || 0) + totalCommits,
                    'stats.currentStreak': currentStreak
                }
            },
            { new: true }
        );

        res.json(updatedUser.stats);

    } catch (err) {
        console.error('Github Sync Error:', err.message);
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'GitHub user not found. Please check your username.' });
        }
        res.status(500).send('Server Error: ' + err.message);
    }
});

module.exports = router;
