const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const passport = require('passport');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET /api/projects
// @desc    Get all projects for user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/projects
// @desc    Create new project
router.post('/', auth, async (req, res) => {
    try {
        const newProject = new Project({
            userId: req.user.id,
            ...req.body
        });
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
router.put('/:id', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Project removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
