const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'DevOps', 'CS Concepts', 'Language', 'Other'],
        default: 'Other'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    notes: String,
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['video', 'article', 'course', 'documentation'], default: 'article' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Learning', LearningSchema);
