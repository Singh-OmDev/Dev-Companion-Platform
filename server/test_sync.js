require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const axios = require('axios');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({});
    let username = user.socials.github;
    if (username.includes('github.com')) {
        const parts = username.split('/').filter(Boolean);
        username = parts[parts.length - 1];
    }
    username = username.trim();
    console.log('Parsed:', username);

    const options = { headers: { 'User-Agent': 'Dev-Companion-App' } };
    if (process.env.GITHUB_TOKEN) {
        options.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
        const [reposRes, eventsRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, options),
            axios.get(`https://api.github.com/users/${username}/events?per_page=100`, options)
        ]);
        console.log('Repos:', reposRes.data.length);
        console.log('Events:', eventsRes.data.length);

        let totalCommits = 0;
        let currentStreak = 0;

        const activityMap = {};
        eventsRes.data.forEach(event => {
            const dateStr = event.created_at.split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            if (event.type === 'PushEvent') {
                totalCommits += (event.payload.size || 1);
            } else {
                totalCommits++;
            }
        });
        // ... string calculation ...
        console.log('Commits:', totalCommits);

        if (!user.stats) user.stats = {};
        user.stats.totalRepos = reposRes.data.length;
        user.stats.totalCommits = (user.stats.totalCommits || 0) + totalCommits;
        user.stats.currentStreak = 5;
        await user.save();
        console.log('Saved successfully');
    } catch (e) {
        console.log('ERROR:', e.message);
    }
    process.exit(0);
}
check();
