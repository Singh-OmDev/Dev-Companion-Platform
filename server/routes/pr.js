const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const { getGithubToken } = require('../utils/githubToken');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'mock_key'
});

const generateContent = async (prompt, responseFormat = null) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock_key') {
        throw new Error("AI Configuration Missing: Please add a valid GROQ_API_KEY to your server .env file.");
    }

    const options = {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
    };

    if (responseFormat) {
        options.response_format = responseFormat;
    }

    const chatCompletion = await groq.chat.completions.create(options);
    return chatCompletion.choices[0]?.message?.content || "";
};

const getGithubHeaders = async (clerkUserId) => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dev-Companion-App'
    };
    const token = await getGithubToken(clerkUserId);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// @route   GET /api/pr/repos
// @desc    Get top repos for user to select from
router.get('/repos', auth, async (req, res) => {
    try {
        let username = req.user?.socials?.github || 'Singh-OmDev';
        if (username.includes('github.com')) {
            const parts = username.split('/').filter(Boolean);
            username = parts[parts.length - 1];
        }
        username = username.trim();

        const headers = await getGithubHeaders(req.auth.userId);

        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
            headers
        });

        const repos = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            owner: repo.owner.login
        }));

        res.json(repos);
    } catch (error) {
        console.error("Error fetching repos:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to fetch GitHub repositories." });
    }
});

// @route   GET /api/pr/branches/:owner/:repo
// @desc    Get branches for a specific repository
router.get('/branches/:owner/:repo', auth, async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const headers = await getGithubHeaders(req.auth.userId);
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, {
            headers
        });

        const branches = response.data.map(branch => branch.name);
        res.json(branches);
    } catch (error) {
        console.error("Error fetching branches:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to fetch repository branches." });
    }
});

// @route   POST /api/pr/generate
// @desc    Generate PR description from diff
router.post('/generate', auth, async (req, res) => {
    try {
        const { owner, repo, base, head } = req.body;

        if (!owner || !repo || !base || !head) {
            return res.status(400).json({ msg: "Missing required parameters (owner, repo, base, head)" });
        }

        // Fetch the diff from GitHub
        const diffUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`;
        const headers = await getGithubHeaders(req.auth.userId);
        const response = await axios.get(diffUrl, {
            headers
        });

        const files = response.data.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ msg: "No changes found between these branches." });
        }

        // Extract patches to form the diff string
        let diffString = files.map(file => {
            return `--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch || 'Binary file or too large'}`;
        }).join('\n\n');

        // Truncate diff if it's monstrously large to save tokens
        if (diffString.length > 15000) {
            diffString = diffString.substring(0, 15000) + "\n... [TRUNCATED DIFF FOR AI]";
        }

        const prompt = `You are a Senior Full Stack Engineer. 
I need you to write a highly professional, detailed, and clean Pull Request description based on the following code diff. 

The description should be formatted in Markdown and include the following sections exactly:
# 🎉 Pull Request Summary
(A creative, professional title and 1-2 sentence high-level summary of what this code does and why.)

## 🛠 Key Changes
(A bulleted list explaining the actual technical changes logically. Do not just list files, explain the *logic* introduced or changed.)

## 🧪 Testing Instructions
(Provide 2-3 logical steps a reviewer should take to test this branch based on the code you see.)

Here is the Git Diff:
\`\`\`diff
${diffString}
\`\`\`

Write ONLY the valid Markdown for the PR description. Do not include any conversational filler.`;

        const markdownText = await generateContent(prompt);
        res.json({ markdown: markdownText });

    } catch (error) {
        console.error("Error generating PR:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to generate PR description." });
    }
});

module.exports = router;
