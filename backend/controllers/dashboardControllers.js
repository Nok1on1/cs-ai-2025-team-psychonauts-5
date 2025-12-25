const jwt = require("jsonwebtoken");
const UserHistory = require("../mongoSchemas/userHistory");

const recentTests = async (req, res) => {
    try {
        const token = req.cookies["x-access-token"];
        if (!token) return res.status(401).json({message: "No token"});

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log("JWT payload:", payload);
        console.log("Email from payload:", payload.email);
        const email = payload.email;

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
        const token = req.cookies["x-access-token"];
        if (!token) return res.status(401).json({message: "No token"});

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const email = payload.email;

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