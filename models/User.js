const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false // Based on signup validation
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 1
    },

    totalXp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    streak: {
        type: Number,
        default: 0
    },
    lastCompletedDate: {
        type: Date,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', UserSchema);
