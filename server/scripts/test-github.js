require('dotenv').config();
const axios = require('axios');

const testGithubSync = async (username) => {
    console.log(`Testing GitHub Sync for: ${username}`);
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    console.log(`Client ID: ${clientId ? 'Present' : 'Missing'}`);
    console.log(`Client Secret: ${clientSecret ? 'Present' : 'Missing'}`);

    const options = {
        headers: { 'User-Agent': 'Dev-Companion-App' }
    };

    if (clientId && clientSecret) {
        options.params = {
            client_id: clientId,
            client_secret: clientSecret
        };
    }

    try {
        console.log('Fetching Repos...');
        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, options);
        console.log(`Repos fetched: ${reposRes.data.length}`);

        console.log('Fetching Events...');
        const eventsRes = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, options);
        console.log(`Events fetched: ${eventsRes.data.length}`);

        const repos = reposRes.data;
        const events = eventsRes.data;

        // Calculate Stats Logic from route
        const totalRepos = repos.length;
        let totalCommits = 0;

        const activityMap = {};
        events.forEach(event => {
            const dateStr = event.created_at.split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            if (event.type === 'PushEvent') {
                totalCommits += (event.payload.size || 1);
            } else {
                totalCommits++;
            }
        });

        console.log('Calculated Stats:');
        console.log(`Total Repos: ${totalRepos}`);
        console.log(`Total Commits (Recent Activity): ${totalCommits}`);

        // Streak Calc
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            // console.log(`Checking date: ${dateStr}, Activity: ${activityMap[dateStr]}`);
            if (activityMap[dateStr]) {
                currentStreak++;
            } else if (i === 0 && !activityMap[dateStr]) {
                continue;
            } else {
                break;
            }
        }
        console.log(`Current Streak: ${currentStreak}`);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testGithubSync('Singh-OmDev');
