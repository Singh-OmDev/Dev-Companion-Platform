const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feature = require('../models/Feature');
const User = require('../models/User');
const Groq = require('groq-sdk');
const axios = require('axios');
const { getGithubToken } = require('../utils/githubToken');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'mock_key'
});

const generateContent = async (prompt, responseFormat = null) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock_key') {
        throw new Error("AI Configuration Missing: Please add a valid GROQ_API_KEY.");
    }

    try {
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
    } catch (error) {
        console.error("Groq Error:", error);
        throw new Error("Thinking process interrupted. Please try again.");
    }
};

// @route   GET /api/features
// @desc    Get all features for the current user
router.get('/', auth, async (req, res) => {
    try {
        const features = await Feature.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(features);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/features
// @desc    Create a new feature
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, tasks } = req.body;
        if (!title) {
            return res.status(400).json({ msg: 'Title is required' });
        }

        const newFeature = new Feature({
            userId: req.user.id,
            title,
            description,
            tasks: tasks || []
        });

        const feature = await newFeature.save();
        res.json(feature);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/features/generate
// @desc    Generate tasks for a feature idea
router.post('/generate', auth, async (req, res) => {
    try {
        const { idea } = req.body;
        if (!idea) {
            return res.status(400).json({ msg: 'Idea description is required' });
        }

        const prompt = `You are an expert Senior Tech Lead. Break down the following feature idea into a perfectly scoped, step-by-step technical Kanban board.
        Idea: "${idea}"
        
        Return ONLY a JSON object (no markdown, no conversational text) with this exact schema:
        {
            "title": "A concise title for the feature (e.g., User Authentication)",
            "description": "A short summary of what the feature accomplishes.",
            "tasks": [
                {
                    "taskId": "A unique short ID for the task, e.g., T-1, T-2",
                    "title": "Clear task title, e.g., Setup DB Schema",
                    "description": "Technical details of what to implement."
                }
            ]
        }`;

        let text = await generateContent(prompt, { type: "json_object" });
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let generatedFeature;
        try {
            generatedFeature = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse Groq Feature output:", text);
            return res.status(500).json({ msg: 'AI failed to properly format the tasks.' });
        }

        // Apply a generated feature ID prefix to tasks to ensure uniqueness
        const featureIdPrefix = `F${Math.floor(Math.random() * 1000)}`;
        if (generatedFeature.tasks && Array.isArray(generatedFeature.tasks)) {
            generatedFeature.tasks = generatedFeature.tasks.map((task, index) => ({
                ...task,
                taskId: `${featureIdPrefix}-T${index + 1}`,
                status: 'Todo'
            }));
        }

        res.json({ success: true, feature: generatedFeature });
    } catch (err) {
        console.error("Feature Generation Error:", err);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   PUT /api/features/:id/tasks/:taskId
// @desc    Update a task status
router.put('/:id/tasks/:taskId', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Todo', 'In Progress', 'Done'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const feature = await Feature.findOne({ _id: req.params.id, userId: req.user.id });
        if (!feature) {
            return res.status(404).json({ msg: 'Feature not found' });
        }

        const task = feature.tasks.find(t => t.taskId === req.params.taskId);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        task.status = status;
        await feature.save();

        res.json(feature);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/features/:id/sync
// @desc    Sync feature tasks with GitHub commits
router.post('/:id/sync', auth, async (req, res) => {
    try {
        const feature = await Feature.findOne({ _id: req.params.id, userId: req.user.id });
        if (!feature) {
            return res.status(404).json({ msg: 'Feature not found' });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.socials || !user.socials.github) {
            return res.status(400).json({ msg: 'Github account not linked' });
        }

        let username = user.socials.github;
        if (username.includes('github.com')) {
            const parts = username.split('/').filter(Boolean);
            username = parts[parts.length - 1];
        }
        username = username.trim();

        const options = { headers: { 'User-Agent': 'Dev-Companion-App' } };
        const token = await getGithubToken(req.auth.userId);
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        } else if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            options.params = {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET
            };
        }

        // Fetch user's recent repos first (up to 5 most recently pushed)
        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, options);
        const repos = reposRes.data;

        // Extract all commit messages from these recent repos
        const commitMessages = [];
        for (const repo of repos) {
            try {
                const commitsRes = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=15`, options);
                commitsRes.data.forEach(commitObj => {
                    if (commitObj.commit && commitObj.commit.message) {
                        commitMessages.push(commitObj.commit.message.toLowerCase());
                    }
                });
            } catch (err) {
                console.log(`Could not fetch commits for repo ${repo.name}`);
            }
        }

        let syncedCount = 0;

        // Check if any commit message mentions a taskId
        feature.tasks.forEach(task => {
            if (task.status !== 'Done') {
                const taskIdLower = task.taskId.toLowerCase();
                const matched = commitMessages.some(msg => msg.includes(taskIdLower));
                if (matched) {
                    task.status = 'Done';
                    syncedCount++;
                }
            }
        });

        if (syncedCount > 0) {
            await feature.save();
        }

        res.json({ success: true, syncedCount, feature });
    } catch (err) {
        console.error("Github Sync Error:", err);
        res.status(500).send('Server Error syncing with GitHub');
    }
});

// @route   DELETE /api/features/:id
// @desc    Delete a feature
router.delete('/:id', auth, async (req, res) => {
    try {
        const feature = await Feature.findOne({ _id: req.params.id, userId: req.user.id });
        if (!feature) {
            return res.status(404).json({ msg: 'Feature not found' });
        }

        await Feature.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Feature deleted' });
    } catch (err) {
        console.error("Feature Deletion Error:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
