const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Idea', 'Planning', 'Building', 'Paused', 'Completed'],
        default: 'Idea'
    },
    techStack: [String],
    githubLink: String,
    liveLink: String,
    deadline: Date,
    tasks: [{
        title: String,
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
