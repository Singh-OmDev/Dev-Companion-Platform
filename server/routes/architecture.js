const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

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
        temperature: 0.1, // Low temp for strictly structured JSON
    };

    if (responseFormat) {
        options.response_format = responseFormat;
    }

    const chatCompletion = await groq.chat.completions.create(options);
    return chatCompletion.choices[0]?.message?.content || "";
};

const getGithubHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Dev-Companion-App'
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

// @route   GET /api/architecture/repos
// @desc    Get top repos for user to select from
router.get('/repos', auth, async (req, res) => {
    try {
        const username = 'Singh-OmDev'; // Replace with real auth user later
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
            headers: getGithubHeaders()
        });

        const repos = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            owner: repo.owner.login,
            default_branch: repo.default_branch
        }));

        res.json(repos);
    } catch (error) {
        console.error("Error fetching repos:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to fetch GitHub repositories." });
    }
});

// @route   POST /api/architecture/analyze
// @desc    Analyze repository structure and return ReactFlow Nodes/Edges
router.post('/analyze', auth, async (req, res) => {
    try {
        const { owner, repo, branch = 'main' } = req.body;

        if (!owner || !repo) {
            return res.status(400).json({ msg: "Missing required parameters (owner, repo)" });
        }

        // 1. Fetch the recursive tree from GitHub
        const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const response = await axios.get(treeUrl, {
            headers: getGithubHeaders()
        });

        const tree = response.data.tree;

        if (!tree || tree.length === 0) {
            return res.status(400).json({ msg: "Repository appears to be empty or nonexistent." });
        }

        // 2. Filter out heavy noise (node_modules, dist, images, etc.) to save tokens
        const ignoredPaths = ['node_modules', '.git', 'dist', 'build', 'public', '.next'];
        const ignoredExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip'];

        const cleanPaths = tree
            .filter(item => {
                const isIgnoredDir = ignoredPaths.some(ignored => item.path.includes(ignored + '/'));
                const isIgnoredExt = ignoredExtensions.some(ext => item.path.endsWith(ext));
                return !isIgnoredDir && !isIgnoredExt;
            })
            .map(item => item.path);

        // Pre-truncate string if it's too massive for contextual bounds
        let treeString = cleanPaths.join('\n');
        if (treeString.length > 20000) {
            treeString = treeString.substring(0, 20000) + "\n... [TRUNCATED]";
        }

        // 3. Ask AI to map out the architecture in ReactFlow format
        const prompt = `You are an expert Software Architect analyzing a given repository file structure.
I need you to map out the high-level architecture of this application for visualization in ReactFlow.

Do NOT map every single file. Group them into logical "Modules", "Services", "Frontend", "Backend", "Database Models", "Routes", etc.

You MUST return a STRICT JSON OBJECT containing exactly two arrays: "nodes" and "edges", following the ReactFlow specification.

RULES:
1. Every node must have an 'id', 'position' ({x, y} coordinates - lay them out reasonably to look like a tree or flow mapping left-to-right or top-to-bottom), and 'data' ({label: "Name of Module", type: "category"}).
2. Node typologies can be: 'frontend', 'backend', 'database', 'api', 'service', 'config'. Put this in \`data.type\`.
3. Every edge must have an 'id', 'source' (node id), and 'target' (node id).
4. Edge types can be default.

File Structure:
\`\`\`
${treeString}
\`\`\`

Return ONLY the JSON. No markdown wrapping (\`\`\`json), no conversational text. Start immediately with { "nodes": [...], "edges": [...] }`;

        const aiResponseText = await generateContent(prompt, { type: 'json_object' });

        const architectureData = JSON.parse(aiResponseText);

        res.json({
            nodes: architectureData.nodes || [],
            edges: architectureData.edges || []
        });

    } catch (error) {
        console.error("Error analyzing architecture:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to analyze repository architecture." });
    }
});

module.exports = router;
