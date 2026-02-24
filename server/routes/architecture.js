const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

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

        // 2. Filter directories only and ignore heavy noise
        const ignoredPaths = ['node_modules', '.git', 'dist', 'build', 'public', '.next'];

        const directories = tree
            .filter(item => item.type === 'tree') // Directories only
            .filter(item => !ignoredPaths.some(ignored => item.path.split('/').includes(ignored)))
            .map(item => item.path);

        // 3. Algorithmic High-Level Architecture Parsing (Perfect Hierarchy)
        const nodesMap = new Map();
        const edgesMap = new Map();

        // Always create a root anchor
        nodesMap.set('root', { id: 'root', data: { label: repo, type: 'root' } });

        directories.forEach(path => {
            const parts = path.split('/');

            // Only map the architectural surface (up to 2 levels deep) to prevent infinite sprawl
            if (parts.length > 2) return;

            const id = path;
            const parentId = parts.length === 1 ? 'root' : parts.slice(0, -1).join('/');
            const label = parts[parts.length - 1];

            // Heuristics to classify modules like an AI would, but instantly and accurately
            let type = 'service';
            const lowerLabel = label.toLowerCase();
            const lowerPath = path.toLowerCase();

            if (lowerPath.includes('client') || lowerPath.includes('frontend') || lowerPath.includes('ui') || lowerPath.includes('components')) {
                type = 'frontend';
            } else if (lowerPath.includes('server') || lowerPath.includes('backend') || lowerPath.includes('api') || lowerPath.includes('routes') || lowerPath.includes('controllers')) {
                type = 'backend';
            }
            if (lowerLabel.includes('db') || lowerLabel.includes('database') || lowerLabel.includes('model') || lowerLabel.includes('schema') || lowerLabel.includes('prisma')) {
                type = 'database';
            } else if (lowerLabel.includes('config') || lowerLabel.includes('env') || lowerLabel.includes('setup')) {
                type = 'config';
            }

            nodesMap.set(id, { id, data: { label, type } });

            const edgeId = `${parentId}->${id}`;
            edgesMap.set(edgeId, { id: edgeId, source: parentId, target: id });
        });

        res.json({
            nodes: Array.from(nodesMap.values()),
            edges: Array.from(edgesMap.values())
        });

    } catch (error) {
        console.error("Error analyzing architecture:", error.response?.data || error.message);
        res.status(500).json({ msg: "Failed to analyze repository architecture." });
    }
});

module.exports = router;
