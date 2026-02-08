const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Auth middleware replaced


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generateContent = async (prompt) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_API_KEY')) {
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
        // In a real app, you would pass user context here
        const prompt = `Generate 3 proactive suggestions for a developer in JSON format. 
        Types: "leetcode", "project", "health". 
        Return ONLY a raw JSON array (no markdown) with: id, type, message, action, link (optional).`;

        let text = await generateContent(prompt);
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let suggestions;
        try {
            suggestions = JSON.parse(text);
        } catch (e) {
            suggestions = [];
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

module.exports = router;
