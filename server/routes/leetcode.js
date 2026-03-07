const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/leetcode/sync
// @desc    Sync user leetcode stats to database
router.post('/sync', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const username = user.socials?.leetcode;
        if (!username) {
            return res.status(400).json({ msg: 'LeetCode account not linked' });
        }

        const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`);

        if (response.data && response.data.totalSolved !== undefined) {
            const data = response.data;

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                {
                    $set: {
                        'stats.leetcodeSolved.easy': data.easySolved,
                        'stats.leetcodeSolved.medium': data.mediumSolved,
                        'stats.leetcodeSolved.hard': data.hardSolved,
                        'stats.leetcodeSolved.total': data.totalSolved,
                    }
                },
                { new: true }
            );

            return res.json(updatedUser.stats.leetcodeSolved);
        } else {
            return res.status(404).json({ msg: 'Invalid LeetCode username or API unavailable' });
        }

    } catch (err) {
        console.error('LeetCode Sync Error:', err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @desc    Get user leetcode stats
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Try fetching from public API
        // Using a known LeetCode stats proxy. If it fails, fallback to mock.
        try {
            const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
            if (response.data && response.data.totalSolved !== undefined) {
                const data = response.data;

                // Calculate an approximate acceptance rate
                let accRate = 0;
                if (data.totalSubmissions && data.totalSubmissions.length > 0) {
                    const totalSubsNum = data.totalSubmissions[0].submissions;
                    if (totalSubsNum > 0) {
                        accRate = ((data.totalSolved / totalSubsNum) * 100).toFixed(1);
                    }
                }

                return res.json({
                    status: "success",
                    totalSolved: data.totalSolved,
                    easySolved: data.easySolved,
                    mediumSolved: data.mediumSolved,
                    hardSolved: data.hardSolved,
                    acceptanceRate: parseFloat(accRate) || 0,
                    ranking: data.ranking,
                    contributionPoints: data.contributionPoint || 0,
                    reputation: data.reputation || 0
                });
            }
        } catch (e) {
            console.log("LeetCode Proxy failed, switching to mock data", e.message);
        }

        // Fallback Mock Data
        res.json({
            status: "success",
            message: "Mock data (API unavailable)",
            totalSolved: 145,
            easySolved: 50,
            mediumSolved: 80,
            hardSolved: 15,
            acceptanceRate: 65.4,
            ranking: 12450,
            contributionPoints: 1200,
            reputation: 50
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// @desc    Get AI personalized recommendations for LeetCode
router.get('/:username/recommendations', async (req, res) => {
    try {
        const { username } = req.params;

        // Fetch recent submissions to give context to the AI
        let recentTitles = [];
        try {
            const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
            if (response.data && response.data.recentSubmissions) {
                recentTitles = response.data.recentSubmissions.slice(0, 5).map(s => s.title);
            }
        } catch (e) {
            console.log("Failed to fetch recent submissions for AI context");
        }

        const prompt = `You are an expert algorithms mentor. The user has recently solved or attempted these LeetCode problems: ${recentTitles.length > 0 ? recentTitles.join(', ') : 'Various beginner problems'}.
        Based on these recent topics, suggest EXACTLY 2 new LeetCode problems that would be good practice for them next.
        Return ONLY a raw JSON array (no markdown, no backticks) where each object has these exact fields:
        "title" (string, the problem name),
        "difficulty" (string, exactly "E", "M", or "H"),
        "topics" (string, e.g., "Array • DP"),
        "link" (string, the full LeetCode URL).
        Example: [{"title": "Maximum Subarray", "difficulty": "E", "topics": "Array • DP", "link": "https://leetcode.com/problems/maximum-subarray/"}]`;

        const fallbackSuggestions = [
            { title: "Two Sum", difficulty: "E", topics: "Array • Hash Table", link: "https://leetcode.com/problems/two-sum/" },
            { title: "Longest Substring Without Repeating Characters", difficulty: "M", topics: "Hash Table • String", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }
        ];

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_API_KEY')) {
            return res.json(fallbackSuggestions);
        }

        let suggestions = fallbackSuggestions;
        try {
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            suggestions = JSON.parse(text);
        } catch (e) {
            console.error("Gemini failed/invalid key, using fallback:", e.message);
        }

        res.json(suggestions);
    } catch (err) {
        console.error("AI Recommendation Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
