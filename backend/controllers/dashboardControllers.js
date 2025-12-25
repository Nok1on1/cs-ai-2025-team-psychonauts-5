const jwt = require("jsonwebtoken");
const UserHistory = require("../mongoSchemas/userHistory");
const User = require("../mongoSchemas/user");

const recentTests = async (req, res) => {
    try {
        const email = req.user.email;

        const history = await UserHistory.find({email})
            .sort({createdAt: -1})
            .limit(10);

        res.json(history);
    } catch (err) {
        res.status(401).json({message: "Invalid or expired token"});
    }
};

const insertTest = async (req, res) => {
    try {
        const email = req.user.email;

        const {subject, difficulty, correct, total_questions} = req.body;

        if (
            !subject ||
            !difficulty ||
            correct == null ||
            !total_questions
        ) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const history = await UserHistory.create({
            email,
            subject,
            difficulty,
            correct,
            total_questions
        });

        res.status(201).json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
};

module.exports = {recentTests, insertTest}