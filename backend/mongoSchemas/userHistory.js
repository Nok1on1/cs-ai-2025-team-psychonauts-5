const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    correct: {
        type: Number,
        required: true,
        min: 0
    },
    total_questions: {
        type: Number,
        required: true,
        min: 1
    },

    scorePercent: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

historySchema.pre("save", function (next) {
    this.scorePercent = Math.round(
        (this.correct / this.total_questions) * 100
    );
    next();
});

module.exports = mongoose.model("user_history", historySchema);
