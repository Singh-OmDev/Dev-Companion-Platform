const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Auth middleware replaced


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateContent = async (prompt) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_API_KEY') || process.env.GEMINI_API_KEY === 'mock_key') {
        return "AI Configuration Missing: Please add a valid GEMINI_API_KEY to your server .env file.";
    }
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Thinking process interrupted. Please try again.";
    }
};

// @route   POST /api/ai/chat
// @desc    Get AI completion
router.post('/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ msg: 'Message is required' });

        const prompt = `You are an expert Senior Full Stack Developer mentor. Keep your answers concise, practical, and technical.
User User: ${message}
Mentor:`;

        const reply = await generateContent(prompt);
        res.json({ reply, timestamp: new Date() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/roadmap
// @desc    Generate personalized learning roadmap
router.post('/roadmap', auth, async (req, res) => {
    try {
        const { goal } = req.body;
        if (!goal) return res.status(400).json({ msg: 'Goal is required' });

        const prompt = `Generate a 4-week learning roadmap for "${goal}" in JSON format.
        Return ONLY a raw JSON array (no markdown backticks) with objects containing: week (number), title (string), description (string), status (string: "locked", "in-progress", or "completed").
        Example: [{"week":1, "title":"Basics", "description":"Learn X", "status":"in-progress"}]`;

        let text = await generateContent(prompt);
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let roadmap;
        try {
            roadmap = JSON.parse(text);
        } catch (e) {
            // Fallback if JSON fails
            roadmap = [
                { week: 1, title: 'AI Parsing Error', description: 'Could not generate roadmap. Please try again.', status: 'locked' }
            ];
        }

        res.json({ success: true, roadmap });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/ai/suggestions
// @desc    Get proactive AI suggestions
router.get('/suggestions', auth, async (req, res) => {
    try {
        const user = req.user;

        let contextData = "New User";
        if (user && user.stats) {
            contextData = `User Stats: 
            - Github Commits: ${user.stats.totalCommits || 0}
            - Current Streak: ${user.stats.currentStreak || 0} days
            - LeetCode Solved: ${user.stats.leetcodeSolved?.total || 0} total (Easy: ${user.stats.leetcodeSolved?.easy || 0}, Medium: ${user.stats.leetcodeSolved?.medium || 0}, Hard: ${user.stats.leetcodeSolved?.hard || 0})
            - Preferred Theme: ${user.preferences?.theme || 'default'}
            `;
        }

        const prompt = `You are a personalized developer AI assistant. Here is the current user's profile context:
        ${contextData}
        
        Generate exactly 3 proactive, highly personalized suggestions for this developer in JSON format based on their specific stats.
        Types must be EXACTLY one of: "leetcode", "project", "health". 
        Return ONLY a raw JSON array (no markdown, no backticks) where each object has these exact fields:
        "id" (number 1-3),
        "type" (string), 
        "message" (string, the core insight/encouragement), 
        "action" (string, next step to take), 
        "link" (optional string, e.g., "/leetcode" or "/projects").`;

        let text = await generateContent(prompt);
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let suggestions;
        try {
            suggestions = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI Insights:", text);
            suggestions = [
                { id: 1, type: "leetcode", message: "Keep up the coding momentum!", action: "Try a new medium problem today.", link: "/leetcode" },
                { id: 2, type: "project", message: "Your GitHub activity is looking solid.", action: "Consider starting a new side project.", link: "/projects" },
                { id: 3, type: "health", message: "Don't forget to take breaks.", action: "Step away from the screen for 10 minutes." }
            ];
        }

        res.json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/resume-enhance
// @desc    Enhance resume text
router.post('/resume-enhance', auth, async (req, res) => {
    try {
        const { text, type } = req.body;
        if (!text || !type) return res.status(400).json({ msg: 'Text/Type required' });

        const prompt = `Act as a professional resume writer. Enhance the following ${type} to be more impactful, using action verbs and metrics where possible:
        "${text}"`;

        const enhanced = await generateContent(prompt);
        res.json({ success: true, original: text, enhanced });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/project-review
// @desc    Get AI review for a project
router.post('/project-review', auth, async (req, res) => {
    try {
        const { project } = req.body;
        if (!project) return res.status(400).json({ msg: 'Project required' });

        const prompt = `Review this project:
        Title: ${project.title}
        Description: ${project.description}
        Stack: ${project.techStack?.join(', ')}
        
        Provide a JSON response (no markdown) with:
        - score (number 0-100)
        - feedback (array of strings, specific technical advice)`;

        let text = await generateContent(prompt);
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { score: 0, feedback: ["AI Analysis Failed"] };
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/ai/generate-goal
// @desc    Generate a personalized daily goal
router.get('/generate-goal', auth, async (req, res) => {
    try {
        const user = req.user;
        let contextData = "New User";
        if (user && user.stats) {
            contextData = `Github Commits: ${user.stats.totalCommits || 0}, LeetCode Solved: ${user.stats.leetcodeSolved?.total || 0}, Current Streak: ${user.stats.currentStreak || 0} days`;
        }

        const prompt = `You are an AI developer coach. The user's current stats are: ${contextData}.
        Suggest exactly ONE highly specific, actionable, and realistic daily coding goal for them to accomplish today.
        Return ONLY a raw JSON object (no markdown, no backticks) with:
        "title" (string, short actionable mission, max 50 chars),
        "type" (string, exactly one of: "leetcode", "github", "learning", "other").`;

        let text = await generateContent(prompt);
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let goalObj;
        try {
            goalObj = JSON.parse(text);
        } catch (e) {
            goalObj = { title: "Solve one LeetCode Medium problem", type: "leetcode" };
        }

        res.json(goalObj);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
