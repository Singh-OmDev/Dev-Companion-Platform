const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['leetcode', 'code', 'learn', 'project', 'other'],
        default: 'other'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
