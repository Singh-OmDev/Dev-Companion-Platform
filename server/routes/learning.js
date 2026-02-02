const express = require('express');
const router = express.Router();
const Learning = require('../models/Learning');
const passport = require('passport');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET /api/learning
// @desc    Get all learning items for user
router.get('/', auth, async (req, res) => {
    try {
        const items = await Learning.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/learning
// @desc    Add new learning item
router.post('/', auth, async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ msg: 'Topic is required' });
        }
        const newItem = new Learning({
            userId: req.user.id,
            ...req.body
        });
        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/learning/:id
// @desc    Update learning item
router.put('/:id', auth, async (req, res) => {
    try {
        let item = await Learning.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        if (item.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        item = await Learning.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/learning/:id
// @desc    Delete learning item
router.delete('/:id', auth, async (req, res) => {
    try {
        let item = await Learning.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        if (item.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Learning.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
