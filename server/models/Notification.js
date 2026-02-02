const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: String // Optional link to redirect user
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
