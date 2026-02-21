const express = require('express');
const router = express.Router();
const axios = require('axios');

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

module.exports = router;
