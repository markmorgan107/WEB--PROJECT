const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    totalXp: {
        type: Number,
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);