require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Configs
// Configs
// require('./config/passport');
// const passport = require('passport');

// Middleware
app.use(express.json());
app.use(cors());

// Global Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
    });
    next();
});

// app.use(passport.initialize());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dev-companion')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/pr', require('./routes/pr'));
app.use('/api/architecture', require('./routes/architecture'));

// Initialize Cron Jobs
const initCronJobs = require('./utils/cron');
initCronJobs();

app.get('/', (req, res) => {
    res.send('Dev Companion API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
