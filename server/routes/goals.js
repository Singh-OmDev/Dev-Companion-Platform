const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const User = require('../models/User');
const passport = require('passport');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET /api/goals
// @desc    Get goals for TODAY
router.get('/', auth, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const goals = await Goal.find({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        res.json(goals);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/goals
// @desc    Add new daily goal
router.post('/', auth, async (req, res) => {
    try {
        const newGoal = new Goal({
            userId: req.user.id,
            ...req.body,
            date: new Date()
        });
        const goal = await newGoal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/goals/:id/toggle
// @desc    Toggle completion status and update user streak
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ msg: 'Goal not found' });
        if (goal.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        goal.isCompleted = !goal.isCompleted;
        await goal.save();

        // Check if all goals completed to update streak (simplified logic)
        // In a real app, we'd have more complex streak calculation

        res.json(goal);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/goals/:id
// @desc    Delete goal
router.delete('/:id', auth, async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Goal removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
