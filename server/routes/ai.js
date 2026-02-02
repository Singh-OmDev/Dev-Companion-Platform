const express = require('express');
const router = express.Router();
const passport = require('passport');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   POST /api/ai/chat
// @desc    Get AI completion (Mocked for now)
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, context } = req.body;

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let reply = "I'm your AI Pilot. How can I help you ship faster?";

        // Simple keyword-based mock intelligence
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('project') || lowerMsg.includes('idea')) {
            reply = "That sounds like a solid plan. Have you considered using **Next.js** for better SEO, or maybe **FastAPI** if you need high-performance backend endpoints?";
        } else if (lowerMsg.includes('bug') || lowerMsg.includes('error')) {
            reply = "Debugging is part of the process. 🧘‍♂️ \n\nCheck your console logs, verify your API keys, and ensure your `useEffect` dependencies are correct. Need me to review a specific snippet?";
        } else if (lowerMsg.includes('react') || lowerMsg.includes('state')) {
            reply = "For global state, I recommend **Zustand**—it's much simpler than Redux. For server state, **TanStack Query** is the industry standard.";
        } else if (lowerMsg.includes('resume')) {
            reply = "I can help with that! Make sure your resume highlights **impact** (metrics) over just responsibilities. Check out the Resume Builder module I just built for you. 😉";
        }

        res.json({
            reply,
            timestamp: new Date()
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/roadmap
// @desc    Generate personalized learning roadmap (Mocked)
router.post('/roadmap', auth, async (req, res) => {
    try {
        const { goal } = req.body;

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock AI Logic based on goal
        let roadmap = [];
        const target = goal ? goal.toLowerCase() : 'full stack';

        if (target.includes('backend') || target.includes('node')) {
            roadmap = [
                { week: 1, title: 'Advanced Node.js Patterns', description: 'Event Loop, Streams, and Worker Threads.', status: 'completed' },
                { week: 2, title: 'Microservices Architecture', description: 'Docker, Kubernetes basics, and Service Discovery.', status: 'in-progress' },
                { week: 3, title: 'Database Optimization', description: 'Indexing, Caching strategies (Redis), and Aggregation pipelines.', status: 'locked' },
                { week: 4, title: 'System Design', description: 'Designing scalable distributed systems.', status: 'locked' }
            ];
        } else if (target.includes('frontend') || target.includes('react')) {
            roadmap = [
                { week: 1, title: 'React Internal Architecture', description: 'Fiber, Reconciliation, and concurrent mode.', status: 'in-progress' },
                { week: 2, title: 'State Management at Scale', description: 'Comparing Zustand, Recoil, and Redux Toolkit.', status: 'locked' },
                { week: 3, title: 'Performance Tuning', description: 'Memoization, Code Splitting, and Web Vitals.', status: 'locked' },
                { week: 4, title: 'Testing Strategies', description: 'Unit, Integration, and E2E testing with Cypress.', status: 'locked' }
            ];
        } else {
            // Default "Full Stack"
            roadmap = [
                { week: 1, title: 'Modern JavaScript (ESNext)', description: 'Mastering the latest features of JS.', status: 'completed' },
                { week: 2, title: 'Frontend Fundamentals', description: 'React, Tailwind, and Accessibility.', status: 'in-progress' },
                { week: 3, title: 'Backend APIs', description: 'Node.js, Express, and RESTful design.', status: 'locked' },
                { week: 4, title: 'Deployment & DevOps', description: 'CI/CD, AWS, and Monitoring.', status: 'locked' }
            ];
        }

        res.json({
            success: true,
            roadmap
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/ai/suggestions
// @desc    Get proactive AI suggestions based on user state (Mocked)
router.get('/suggestions', auth, async (req, res) => {
    try {
        // Mock analysis of user data
        // In real app: fetch User stats, goals, and project status

        const suggestions = [
            {
                id: 1,
                type: 'leetcode',
                priority: 'high',
                message: 'Your graph problem solving rate is low (15%).',
                action: 'Solve "Number of Islands"',
                link: '/leetcode'
            },
            {
                id: 2,
                type: 'project',
                priority: 'medium',
                message: 'Project "Dev Companion OS" has no README.',
                action: 'Generate README with AI',
                link: '/projects' // Could link to a specific project action
            },
            {
                id: 3,
                type: 'health',
                priority: 'low',
                message: 'You have been coding for 4 hours straight.',
                action: 'Take a break ☕',
                link: null
            }
        ];

        res.json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/resume-enhance
// @desc    Enhance resume text with AI (Mocked)
router.post('/resume-enhance', auth, async (req, res) => {
    try {
        const { text, type } = req.body; // type: 'summary' or 'experience'

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        let enhancedText = text;

        // Mock improvements
        if (type === 'summary') {
            enhancedText = "Results-driven Full Stack Developer with 5+ years of experience in designing scalable microservices and high-performance frontend architectures. Proven track record of reducing latency by 40% and mentoring junior engineering teams.";
        } else if (type === 'experience') {
            enhancedText = "Architected and deployed a mission-critical dashboard using Next.js, resulting in a 40% improvement in load times. Established rigorous code review protocols, improving overall code quality and reducing bug count by 25%.";
        }

        res.json({
            success: true,
            original: text,
            enhanced: enhancedText
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/ai/project-review
// @desc    Get AI review for a project (Mocked)
router.post('/project-review', auth, async (req, res) => {
    try {
        const { project } = req.body;

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Mock improvements based on tech stack
        let feedback = [];
        const stack = project.techStack.join(' ').toLowerCase();

        if (stack.includes('react')) {
            feedback.push("Consider using **React.memo** for list items to prevent unnecessary re-renders.");
            feedback.push("Ensure all `useEffect` hooks have proper dependency arrays to avoid stale closures.");
        }

        if (stack.includes('node') || stack.includes('express')) {
            feedback.push("Add **Rate Limiting** middleware to protect your API endpoints.");
            feedback.push("Use `helmet` to secure Express HTTP headers.");
        }

        if (stack.includes('mongo')) {
            feedback.push("Ensure you have proper **Indexes** on commonly queried fields like `user_id`.");
        }

        // Generic
        feedback.push("Add a detailed `README.md` with setup instructions.");
        feedback.push("Setup a CI/CD pipeline for automated testing.");

        res.json({
            success: true,
            score: Math.floor(Math.random() * (95 - 70) + 70), // Random score 70-95
            feedback
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
