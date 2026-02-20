const express = require('express');
const router = express.Router();
const axios = require('axios');
const axios = require('axios');

// @desc    Get user leetcode stats
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Try fetching from public API
        // Using a known LeetCode stats proxy. If it fails, fallback to mock.
        try {
            const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
            if (response.data.status === 'success') {
                return res.json(response.data);
            }
        } catch (e) {
            console.log("LeetCode Proxy failed, switching to mock data");
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

module.exports = router;
