const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Done'],
        default: 'Todo'
    }
}, { _id: false });

const FeatureSchema = new mongoose.Schema({
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
        enum: ['Planning', 'Building', 'Completed'],
        default: 'Planning'
    },
    tasks: [TaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Feature', FeatureSchema);
