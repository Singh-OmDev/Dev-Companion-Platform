const fs = require('fs');
const path = 'e:\\Dev Companion Platform\\server\\routes\\github.js';
let content = fs.readFileSync(path, 'utf8');

const syncRoute = `
// @route   POST /api/github/sync
// @desc    Sync user github stats to database
router.post('/sync', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.socials || !user.socials.github) {
            return res.status(400).json({ msg: 'Github account not linked' });
        }

        const username = user.socials.github;
        const options = { headers: { 'User-Agent': 'Dev-Companion-App' } };
        
        if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            options.params = {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET
            };
        }

        const [reposRes, eventsRes] = await Promise.all([
            axios.get(\`https://api.github.com/users/\${username}/repos?per_page=100\`, options),
            axios.get(\`https://api.github.com/users/\${username}/events?per_page=100\`, options)
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
        
        // Update User
        user.stats = {
            ...user.stats,
            totalRepos,
            totalCommits: user.stats.totalCommits + totalCommits, // Accumulate or Replace? Replace is safer if we re-sync often, but we only fetched recent events. 
            // Better strategy: We can't easily get *TOTAL* lifetime commits from API without scraping. 
            // So we will just set it to "Sum of repos size" or just keep it as "activity score". 
            // Let's just use the recent activity count for now as "Recent Commits" or similar, 
            // OR finding a field in user profile? Github API user object doesn't have total commits.
            // Let's stick to accumulating if we can, or just setting it for the "Session". 
            // For this UI, let's just set it to total events fetched for now to match "Recent Activity".
            totalCommits: events.length, 
            currentStreak
        };

        await user.save();
        res.json(user.stats);

    } catch (err) {
        console.error('Github Sync Error:', err.message);
        res.status(500).send('Server Error');
    }
});
`;

// Insert before module.exports
const lastLine = 'module.exports = router;';
if (content.includes(lastLine)) {
    content = content.replace(lastLine, syncRoute + '\n' + lastLine);
    fs.writeFileSync(path, content);
    console.log('Successfully added sync route.');
} else {
    console.error('Could not find module.exports to insert before.');
}
