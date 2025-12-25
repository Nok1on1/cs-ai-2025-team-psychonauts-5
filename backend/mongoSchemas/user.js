const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['student', 'admin'],
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User;