const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        enum: ['finance','mindfulness','charisma','intellect','strength'],
        default: 'mindfulness',
        required: true
    },
    xpReward: {
        type: Number,
        default: 0
    },
    coinsReward: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'pending', 'requested', 'pending_review', 'approved', 'rejected'],
        default: 'pending'
    },
    notified: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    proofImage: {
        type: String
    }
});

module.exports = mongoose.model('Quest', QuestSchema);